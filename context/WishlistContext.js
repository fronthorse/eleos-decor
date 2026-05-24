"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "../lib/supabase/client";
import { getSessionSafely } from "../lib/supabase/auth";
import { getProductPreviewImageSrc } from "../lib/productImages";

const WishlistContext = createContext();
const GUEST_WISHLIST_KEY = "eleos_guest_wishlist";
const WISHLIST_PRODUCT_FIELDS = "id,title,category,price,image_url";

function normalizeProductId(productId) {
  return String(productId || "");
}

function normalizeWishlistItem(product) {
  const productId = typeof product === "object" ? product?.id : product;
  const id = normalizeProductId(productId);

  if (!id) {
    return null;
  }

  if (typeof product !== "object") {
    return {
      id,
      title: "Saved decor item",
      price: "",
      image_url: "",
      imageSrc: "",
      category: "",
      href: `/product/${id}`,
    };
  }

  const imageSrc =
    product.imageSrc ||
    product.thumbnail_url ||
    product.thumbnailUrl ||
    product.thumbnailImage ||
    product.thumbnail_image ||
    getProductPreviewImageSrc(product);

  return {
    id,
    title: product.title || "Saved decor item",
    price: product.price || "",
    image_url: product.image_url || product.image || "",
    imageSrc: imageSrc || product.image_url || product.image || "",
    category: product.category || "",
    href: product.href || `/product/${id}`,
  };
}

function readGuestWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedWishlist = window.localStorage.getItem(GUEST_WISHLIST_KEY);
    const parsedWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (!Array.isArray(parsedWishlist)) {
      return [];
    }

    return parsedWishlist.map(normalizeWishlistItem).filter(Boolean);
  } catch (error) {
    console.warn("Unable to read guest wishlist.", error);
    return [];
  }
}

function writeGuestWishlist(items) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn("Unable to save guest wishlist.", error);
  }
}

function clearGuestWishlist() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GUEST_WISHLIST_KEY);
}

export function WishlistProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);

  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const mergedGuestWishlistForUser = useRef("");

  const setWishlistState = useCallback((items) => {
    const normalizedItems = items.map(normalizeWishlistItem).filter(Boolean);

    setWishlistItems(normalizedItems);
    setWishlistIds(normalizedItems.map((item) => item.id));
  }, []);

  const fetchWishlist = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", userId);

    if (error) {
      console.warn("Unable to fetch wishlist.", error.message);
      return;
    }

    const productIds = [...new Set((data || []).map((item) => item.product_id))];

    if (productIds.length === 0) {
      setWishlistState([]);
      return;
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(WISHLIST_PRODUCT_FIELDS)
      .in("id", productIds);

    if (productsError) {
      console.warn("Unable to fetch wishlist products.", productsError.message);
      setWishlistState(productIds);
      return;
    }

    const productsById = new Map(
      (products || []).map((product) => [normalizeProductId(product.id), product])
    );

    setWishlistState(
      productIds.map((id) => productsById.get(normalizeProductId(id)) || id)
    );
  }, [setWishlistState, supabase]);

  const mergeGuestWishlistIntoUser = useCallback(async (userId) => {
    const guestItems = readGuestWishlist();

    if (guestItems.length === 0) {
      return true;
    }

    if (mergedGuestWishlistForUser.current === userId) {
      return true;
    }

    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", userId);

    if (error) {
      console.warn("Unable to prepare wishlist merge.", error.message);
      return false;
    }

    const existingIds = new Set(
      (data || []).map((item) => normalizeProductId(item.product_id))
    );
    const newItems = guestItems.filter((item) => !existingIds.has(item.id));

    if (newItems.length > 0) {
      const { error: insertError } = await supabase.from("wishlist_items").insert(
        newItems.map((item) => ({
          user_id: userId,
          product_id: item.id,
        }))
      );

      if (insertError) {
        console.warn("Unable to merge guest wishlist.", insertError.message);
        return false;
      }
    }

    clearGuestWishlist();
    mergedGuestWishlistForUser.current = userId;
    return true;
  }, [supabase]);

  const checkUser = useCallback(async () => {
    const { session } = await getSessionSafely(supabase);

    setUser(session?.user || null);

    if (session?.user) {
      await mergeGuestWishlistIntoUser(session.user.id);
      await fetchWishlist(session.user.id);
    } else {
      setWishlistState(readGuestWishlist());
    }
  }, [fetchWishlist, mergeGuestWishlistIntoUser, setWishlistState, supabase]);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      window.setTimeout(async () => {
        if (session?.user) {
          await mergeGuestWishlistIntoUser(session.user.id);
          await fetchWishlist(session.user.id);
        } else {
          mergedGuestWishlistForUser.current = "";
          setWishlistState(readGuestWishlist());
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [checkUser, fetchWishlist, mergeGuestWishlistIntoUser, setWishlistState, supabase]);

  async function removeFromWishlist(productId) {
    const normalizedId = normalizeProductId(productId);

    if (!normalizedId) {
      return { success: false, message: "Product could not be updated." };
    }

    if (!user) {
      const nextItems = wishlistItems.filter((item) => item.id !== normalizedId);

      setWishlistState(nextItems);
      writeGuestWishlist(nextItems);

      return { success: true, message: "Removed from wishlist." };
    }

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", normalizedId);

    if (error) {
      return { success: false, message: error.message };
    }

    setWishlistState(wishlistItems.filter((item) => item.id !== normalizedId));

    return { success: true, message: "Removed from wishlist." };
  }

  async function toggleWishlist(product) {
    const wishlistItem = normalizeWishlistItem(product);

    if (!wishlistItem) {
      return {
        success: false,
        message: "Product could not be saved.",
      };
    }

    const isSaved = wishlistIds.includes(wishlistItem.id);

    if (isSaved) {
      return removeFromWishlist(wishlistItem.id);
    }

    if (!user) {
      const nextItems = [...wishlistItems, wishlistItem];

      setWishlistState(nextItems);
      writeGuestWishlist(nextItems);

      return { success: true, message: "Added to wishlist." };
    }

    const { error } = await supabase.from("wishlist_items").insert([
      {
        user_id: user.id,
        product_id: wishlistItem.id,
      },
    ]);

    if (error) {
      return { success: false, message: error.message };
    }

    setWishlistState([...wishlistItems, wishlistItem]);

    return { success: true, message: "Added to wishlist." };
  }

  function isInWishlist(productId) {
    return wishlistIds.includes(normalizeProductId(productId));
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
