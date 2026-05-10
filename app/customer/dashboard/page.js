"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../.././components/Navbar";
import Footer from "../.././components/Footer";
import EmptyState from "../.././components/EmptyState";

import { createClient } from "../../../lib/supabase/client";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
const [wishlistProducts, setWishlistProducts] = useState([]);
 const { cartItems, cartCount, cartTotal, addToCart } = useCart();
const { wishlistIds, toggleWishlist } = useWishlist();
const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [profileMessage, setProfileMessage] = useState("");
const [savingProfile, setSavingProfile] = useState(false);

  const [user, setUser] = useState(null);


  useEffect(() => {
  fetchWishlistProducts();
}, [wishlistIds]);
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
    fetchProfile(session.user.id);
  }

  async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!error && data) {
    setFullName(data.full_name || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
  }
}

async function handleSaveProfile() {
  if (!user) return;

  setSavingProfile(true);
  setProfileMessage("");

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      phone,
      address,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    }
  );

  setSavingProfile(false);

  if (error) {
    setProfileMessage(error.message);
    return;
  }

  setProfileMessage("Profile updated successfully.");

  setTimeout(() => {
    setProfileMessage("");
  }, 3000);
}

async function fetchWishlistProducts() {
  if (wishlistIds.length === 0) {
    setWishlistProducts([]);
    return;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", wishlistIds);

  if (!error) {
    setWishlistProducts(data || []);
  }
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

           <div className="soft-card p-4 h-100">
  <h5 className="fw-bold mb-3">Wishlist</h5>

  {wishlistProducts.length === 0 ? (
    <EmptyState
  title="Your wishlist is empty"
  message="Save products you love and revisit them anytime."
  actionText="Explore Products"
  actionHref="/shop"
/>
  ) : (
    <div>
      {wishlistProducts.map((product) => (
        <div
          key={product.id}
          className="d-flex align-items-center gap-2 mb-3"
        >
          <img
            src={product.image_url}
            alt={product.title}
            style={{
              width: "45px",
              height: "45px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />

          <div className="flex-grow-1">
            <p className="mb-0 small fw-bold">
              {product.title}
            </p>

            <p className="mb-0 small text-muted">
              ₦{product.price}
            </p>
          </div>

          <button
            onClick={() =>
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                image_url: product.image_url,
              })
            }
            className="btn btn-sm btn-outline-dark"
          >
            Add
          </button>

          <button
            onClick={() => toggleWishlist(product.id)}
            className="btn btn-sm btn-outline-danger"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
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
          <div className="row mt-5">
  <div className="col-lg-8">
    <div className="soft-card p-4">
      <h4 className="fw-bold mb-3">Profile Settings</h4>

      <p className="text-muted mb-4">
        Save your details for easier shopping and future delivery coordination.
      </p>

      <div className="mb-3">
        <label className="form-label">Full Name</label>

        <input
          type="text"
          className="form-control"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Phone Number</label>

        <input
          type="text"
          className="form-control"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 08123456789"
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Delivery Address</label>

        <textarea
          className="form-control"
          rows="4"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your delivery address"
        ></textarea>
      </div>

      <button
  onClick={handleSaveProfile}
  className="btn btn-dark"
  disabled={savingProfile}
>
  {savingProfile ? "Saving..." : "Save Profile"}
</button>

      {profileMessage && (
       <p className="text-success mt-3 mb-0">
  {profileMessage}
</p>
      )}
    </div>
  </div>
</div>
        </div>
      </section>

      <Footer />
    </>
  );
}