"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmptyState from "../../components/EmptyState";
import { createClient } from "../../../lib/supabase/client";
import { getSessionSafely } from "../../../lib/supabase/auth";
import { isAdminEmail } from "../../../lib/adminAuth";
import { formatOrderStatus } from "../../../lib/orderStatuses";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const { cartItems } = useCart();
  const { wishlistIds } = useWishlist();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, delivery_address")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      return;
    }

    setFullName(data?.full_name || "");
    setPhone(data?.phone || "");
    setDeliveryAddress(data?.delivery_address || "");
  }

  async function fetchOrders(userId) {
    const { data, error } = await supabase
      .from("checkout_inquiries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    setOrders(data || []);
  }

  async function checkUser() {
    const { session } = await getSessionSafely(supabase);

    if (!session?.user) {
      router.push("/customer/login");
      return;
    }

    if (isAdminEmail(session.user.email)) {
      router.push("/admin");
      return;
    }

    setUser(session.user);

    await fetchProfile(session.user.id);
    await fetchOrders(session.user.id);

    setCheckingAuth(false);
  }

  useEffect(() => {
    checkUser();
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();

    if (!user) return;

    setSavingProfile(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      phone,
      delivery_address: deliveryAddress,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      setSavingProfile(false);
      return;
    }

    setMessage("Profile updated successfully.");
    setSavingProfile(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/customer/login");
    router.refresh();
  }

  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <main className="container py-5" style={{ marginTop: "90px" }}>
          <h4 className="fw-bold">Loading dashboard...</h4>
          <p className="text-muted">Please wait.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container py-5" style={{ marginTop: "90px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">My Dashboard</h1>
            <p className="text-muted mb-0">Logged in as {user?.email}</p>
          </div>

          <button onClick={handleLogout} className="btn btn-outline-dark">
            Logout
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="soft-card p-4 h-100">
              <h5 className="fw-bold mb-3">Profile Settings</h5>

              <form onSubmit={handleSaveProfile}>
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

                <div className="mb-3">
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-dark w-100"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>

                {message && (
                  <p className="text-muted small mt-2 mb-0">{message}</p>
                )}
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="soft-card p-4 text-center">
                  <h2 className="fw-bold gold-text">
                    {cartItems?.length || 0}
                  </h2>
                  <p className="text-muted mb-0">Items in Cart</p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="soft-card p-4 text-center">
                  <h2 className="fw-bold gold-text">
                    {wishlistIds?.length || 0}
                  </h2>
                  <p className="text-muted mb-0">Wishlist Items</p>
                </div>
              </div>
            </div>

            <div className="soft-card p-4">
              <h5 className="fw-bold mb-3">Order History</h5>

              {orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  message="Your checkout orders will appear here after you place an order."
                />
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.order_number || `#${order.id}`}</td>
                          <td>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td>{formatOrderStatus(order.status)}</td>
                          <td>
                            ₦{Number(order.total_amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
