"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { createClient } from "../../lib/supabase/client";
import { getSessionSafely } from "../../lib/supabase/auth";
import { isAdminEmail } from "../../lib/adminAuth";
import MiniCartDrawer from "./MiniCartDrawer";
import { useRouter } from "next/navigation";
import { FiShoppingBag } from "react-icons/fi";

export default function Navbar() {
  const supabase = createClient();
const router = useRouter();
  const { cartCount, clearCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const isAdmin = isAdminEmail(user?.email);

  async function checkUser() {
    const { session } = await getSessionSafely(supabase);

    setUser(session?.user || null);
  }

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <Link className="navbar-brand fw-bold" href="/">
            Eleos Decor
          </Link>

          <div className="d-flex align-items-center gap-2 order-lg-2">
            <button
  onClick={() => setCartOpen(true)}
  className="cart-icon-btn"
  aria-label="Open cart"
>
  <FiShoppingBag />

  {cartCount > 0 && (
    <span className="cart-count-badge">
      {cartCount}
    </span>
  )}
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
                <Link className="nav-link" href="/">
                  Home
                </Link>
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
              ) : isAdmin ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/admin">
                      Admin Dashboard
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
