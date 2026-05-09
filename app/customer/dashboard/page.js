"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../.././components/Navbar";
import Footer from "../.././components/Footer";

import { createClient } from "../../../lib/supabase/client";
import { useCart } from "../../../context/CartContext";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const { cartItems, cartCount, cartTotal } = useCart();

  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/customer/login");
      return;
    }

    setUser(session.user);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold">Loading dashboard...</h4>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <section className="luxury-section" style={{ marginTop: "80px" }}>
        <div className="container">
          <p className="section-label">My Account</p>

          <h1 className="luxury-heading mb-2">Customer Dashboard</h1>

          <p className="text-muted mb-5">
            Welcome back, {user.email}
          </p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="soft-card p-4 h-100">
                <h5 className="fw-bold mb-3">Saved Cart</h5>

                <p className="text-muted">
                  {cartCount} item(s) in your cart
                </p>

                <p className="fw-bold">
                  ₦{cartTotal.toLocaleString()}
                </p>

                {cartItems.length > 0 && (
                  <div className="mb-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex align-items-center gap-2 mb-2"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />

                        <div>
                          <p className="mb-0 small fw-bold">
                            {item.title}
                          </p>

                          <p className="mb-0 small text-muted">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-muted small mb-0">
                  Your cart is saved automatically whenever you are logged in.
                </p>

                <a href="/cart" className="btn btn-dark w-100 mt-3">
                  View Cart
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="soft-card p-4 h-100">
                <h5 className="fw-bold mb-3">Wishlist</h5>

                <p className="text-muted mb-0">
                  Wishlist system coming soon.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="soft-card p-4 h-100">
                <h5 className="fw-bold mb-3">Account</h5>

                <p className="text-muted mb-4">
                  Manage your shopping experience.
                </p>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-dark w-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}