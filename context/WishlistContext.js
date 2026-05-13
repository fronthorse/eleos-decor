"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const supabase = createClient();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [user, setUser] = useState(null);

  async function fetchWishlist(userId) {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", userId);

    if (!error) {
      setWishlistIds(data.map((item) => item.product_id));
    }
  }

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);

    if (session?.user) {
      fetchWishlist(session.user.id);
    }
  }

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        fetchWishlist(session.user.id);
      } else {
        setWishlistIds([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function toggleWishlist(productId) {
    if (!user) {
      return {
        success: false,
        message: "Please login to save wishlist items.",
      };
    }

    const isSaved = wishlistIds.includes(productId);

    if (isSaved) {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        return { success: false, message: error.message };
      }

      setWishlistIds((current) => current.filter((id) => id !== productId));

      return { success: true, message: "Removed from wishlist." };
    }

    const { error } = await supabase.from("wishlist_items").insert([
      {
        user_id: user.id,
        product_id: productId,
      },
    ]);

    if (error) {
      return { success: false, message: error.message };
    }

    setWishlistIds((current) => [...current, productId]);

    return { success: true, message: "Added to wishlist." };
  }

  function isInWishlist(productId) {
    return wishlistIds.includes(productId);
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
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
