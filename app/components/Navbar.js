"use client";

import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { createClient } from "../../lib/supabase/client";
import MiniCartDrawer from "./MiniCartDrawer";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = createClient();
const router = useRouter();
  const { cartCount, clearCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
  }

  async function handleLogout() {
  await supabase.auth.signOut();

  clearCart();
  localStorage.removeItem("eleos-cart");

  setUser(null);

  router.push("/");
  router.refresh();
}

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white fixed-top minimal-navbar">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            Eleos Decor
          </a>

          <div className="d-flex align-items-center gap-2 order-lg-2">
            <button
              onClick={() => setCartOpen(true)}
              className="btn btn-sm btn-outline-dark cart-nav-btn"
            >
              Cart ({cartCount})
            </button>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse order-lg-1" id="navbarNav">
            <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/shop">
                  Shop
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/about">
                  About
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/contact">
                  Contact
                </a>
              </li>

              {!user ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/customer/login">
                      Login
                    </a>
                  </li>

                  <li className="nav-item">
                    <a className="btn btn-sm btn-dark px-4" href="/customer/signup">
                      Sign Up
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/customer/dashboard">
                      Dashboard
                    </a>
                  </li>

                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="btn btn-sm btn-outline-dark px-4"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <MiniCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}