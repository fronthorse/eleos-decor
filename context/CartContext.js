"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { getSessionSafely } from "../lib/supabase/auth";
import { getCartItemKey } from "../lib/productVariants";

const CartContext = createContext();

export function CartProvider({ children }) {
  const supabase = createClient();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("eleos-cart");

    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
  localStorage.setItem("eleos-cart", JSON.stringify(cartItems));

  async function autoSaveCart() {
    if (!user || !cartLoaded) return;

    await supabase.from("saved_carts").upsert(
      {
        user_id: user.id,
        cart_items: cartItems,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );
  }

  autoSaveCart();
}, [cartItems, user, cartLoaded]);
useEffect(() => {
  async function getUser() {
    const { session } = await getSessionSafely(supabase);

    setUser(session?.user || null);
  }

  getUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null);
  });

  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  async function autoLoadCart() {
    if (!user) {
      setCartLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from("saved_carts")
      .select("cart_items")
      .eq("user_id", user.id)
      .single();

    if (!error && data?.cart_items) {
      setCartItems(data.cart_items);
    }

    setCartLoaded(true);
  }

  autoLoadCart();
}, [user]);


  function addToCart(product) {
    setCartItems((currentItems) => {
      const productKey = getCartItemKey(product);
      const existingItem = currentItems.find(
        (item) => getCartItemKey(item) === productKey
      );

      if (existingItem) {
        return currentItems.map((item) =>
          getCartItemKey(item) === productKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentItems,
        { ...product, cart_item_key: productKey, quantity: 1 },
      ];
    });
  }

  function removeFromCart(id) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => getCartItemKey(item) !== id && item.id !== id)
    );
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) return;

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        getCartItemKey(item) === id || item.id === id ? { ...item, quantity } : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  async function saveCartToAccount() {
    const { session } = await getSessionSafely(supabase);

    if (!session) {
      return {
        success: false,
        message: "Please login to save your cart.",
      };
    }

   const { error } = await supabase.from("saved_carts").upsert(
  {
    user_id: session.user.id,
    cart_items: cartItems,
    updated_at: new Date().toISOString(),
  },
  {
    onConflict: "user_id",
  }
);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Cart saved successfully.",
    };
  }

  async function loadCartFromAccount() {
    const { session } = await getSessionSafely(supabase);

    if (!session) {
      return {
        success: false,
        message: "Please login to load your saved cart.",
      };
    }

    const { data, error } = await supabase
      .from("saved_carts")
      .select("cart_items")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      return {
        success: false,
        message: "No saved cart found.",
      };
    }

    setCartItems(data.cart_items || []);

    return {
      success: true,
      message: "Saved cart loaded.",
    };
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce((total, item) => {
    const price = Number(
  String(item.price)
    .replace(/₦/g, "")
    .replace(/,/g, "")
    .trim()
);
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveCartToAccount,
        loadCartFromAccount,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
