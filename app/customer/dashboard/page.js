"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmptyState from "../../components/EmptyState";
import { createClient } from "../../../lib/supabase/client";
import { getSessionSafely } from "../../../lib/supabase/auth";
import { isAdminEmail } from "../../../lib/adminAuth";
import {
  formatOrderStatus,
  getOrderStatusDescription,
  getOrderStatusIcon,
  getOrderStatusProgress,
  normalizeOrderStatus,
} from "../../../lib/orderStatuses";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

const ORDER_PROGRESS_STEPS = [
  { status: "new", label: "Request Sent" },
  { status: "contacted", label: "Contacted" },
  { status: "payment_pending", label: "Payment" },
  { status: "paid", label: "Confirmed" },
  { status: "processing", label: "Delivery" },
  { status: "delivered", label: "Delivered" },
];

function formatNaira(value) {
  return `\u20a6${Number(value || 0).toLocaleString()}`;
}

function summarizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Decor order request";
  }

  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );
  const firstItem = items[0]?.title || "Decor item";
  const extraCount = Math.max(0, items.length - 1);

  return `${firstItem}${extraCount > 0 ? ` + ${extraCount} more` : ""} (${
    totalItems
  } item${totalItems === 1 ? "" : "s"})`;
}

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

            <div className="soft-card p-4" id="orders">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h5 className="fw-bold mb-1">My Orders</h5>
                  <p className="text-muted small mb-0">
                    Track your WhatsApp-assisted order requests here.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  message="Your checkout orders will appear here after you place an order."
                />
              ) : (
                <div className="customer-order-list">
                  {orders.map((order) => {
                    const status = normalizeOrderStatus(order.status);
                    const progress = getOrderStatusProgress(status);
                    const isCancelled = status === "cancelled";

                    return (
                      <article className="customer-order-card" key={order.id}>
                        <div className="customer-order-header">
                          <div>
                            <p className="text-muted small mb-1">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                            <h6 className="fw-bold mb-1">
                              {order.order_number || `Order #${order.id}`}
                            </h6>
                            <p className="text-muted mb-0">
                              {summarizeOrderItems(order.items)}
                            </p>
                          </div>

                          <span className={`status-badge status-${status}`}>
                            {getOrderStatusIcon(status)}{" "}
                            {formatOrderStatus(status)}
                          </span>
                        </div>

                        <div className="customer-order-meta">
                          <span>
                            <strong>Total:</strong>{" "}
                            {formatNaira(order.total_amount)}
                          </span>
                          <span>{getOrderStatusDescription(status)}</span>
                        </div>

                        {!isCancelled && (
                          <div className="order-progress">
                            {ORDER_PROGRESS_STEPS.map((step) => {
                              const stepProgress = getOrderStatusProgress(
                                step.status
                              );
                              const isActive = progress >= stepProgress;

                              return (
                                <div
                                  className={`order-progress-step ${
                                    isActive ? "active" : ""
                                  }`}
                                  key={step.status}
                                >
                                  <span></span>
                                  <small>{step.label}</small>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </article>
                    );
                  })}
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
