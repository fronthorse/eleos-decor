"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function CheckoutForm({ cartItems, cartTotal, compact = false }) {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [message, setMessage] = useState("");

  const whatsappNumber = "2348168350533";

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);

    if (session?.user) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", session.user.id)
        .single();

      setProfile(data || null);
    }
  }

  async function handleCheckout() {
    if (cartItems.length === 0) return;

    const orderNumber = `ELEOS-${Date.now()}`;

    const customerName = user ? profile?.full_name || "" : guestName;
    const customerPhone = user ? profile?.phone || "" : guestPhone;
    const customerEmail = user?.email || guestEmail || null;
    const customerAddress = guestAddress || "Not provided";

    if (!customerName || !customerPhone) {
      setMessage(
        user
          ? "Please update your profile with name and phone number first."
          : "Please enter your name and phone number."
      );
      return;
    }

    setMessage("Preparing your WhatsApp order...");

 const orderMessage = `
🛍️ *NEW ORDER - ELEOS DECOR*

━━━━━━━━━━━━━━━
🆔 Order ID: ${orderNumber}
━━━━━━━━━━━━━━━

${cartItems
  .map(
    (item, index) => `
${index + 1}. ${item.title}

Quantity: ${item.quantity}
Price: ₦${parseFloat(
      item.price.toString().replace(/,/g, "")
    ).toLocaleString()}
`
  )
  .join("\n")}

━━━━━━━━━━━━━━━
💰 Total: ₦${Number(
  cartTotal.toString().replace(/,/g, "")
).toLocaleString()}
━━━━━━━━━━━━━━━

👤 CUSTOMER DETAILS

Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || "Guest customer"}

📍 Delivery Address:
${customerAddress}

📝 Order Note:
${orderNote || "None"}

Thank you for shopping with Eleos Decor ✨
`;

    const { error } = await supabase.from("checkout_inquiries").insert([
      {
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        delivery_address: customerAddress,
        items: cartItems,
        total_amount: cartTotal,
        order_note: orderNote || null,
        status: "New",
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    fetch("/api/send-inquiry-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        items: cartItems,
        totalAmount: cartTotal,
        orderNote,
      }),
    }).catch(() => {});

    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      orderMessage
    )}`;

    window.open(whatsappLink, "_blank");

    setMessage("Order saved. Continue on WhatsApp.");
  }

  return (
    <div>
      {!user && (
        <>
          <hr />

          <h5 className="fw-bold mb-3">Contact Details</h5>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="e.g. 08123456789"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </>
      )}

      <div className="mb-3">
        <label className="form-label">Delivery Address</label>
        <textarea
          className="form-control"
          rows="2"
          value={guestAddress}
          onChange={(e) => setGuestAddress(e.target.value)}
          placeholder="Enter delivery address"
        ></textarea>
      </div>

      {user && (
        <div className="alert alert-light border small">
          Checking out as <strong>{user.email}</strong>
          <br />
          Name: {profile?.full_name || "Not set"}
          <br />
          Phone: {profile?.phone || "Not set"}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Order Note</label>
        <textarea
          className="form-control"
          rows={compact ? "2" : "3"}
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Optional note about your order"
        ></textarea>
      </div>

      <button onClick={handleCheckout} className="btn btn-dark w-100 mb-2">
        Checkout on WhatsApp
      </button>

      {message && <p className="text-muted small mt-2 mb-0">{message}</p>}
    </div>
  );
}