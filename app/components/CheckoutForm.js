"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { getSessionSafely } from "../../lib/supabase/auth";
import { useCart } from "../../context/CartContext";
import { normalizeOrderStatus } from "../../lib/orderStatuses";

function generateOrderNumber() {
  return `ELEOS-${Date.now()}`;
}

function cleanPrice(price) {
  return Number(String(price || "0").replace(/,/g, ""));
}

export default function CheckoutForm({
  cartItems,
  cartTotal,
  compact = false,
  onOrderRequestSent,
}) {
  const supabase = createClient();
  const { clearCart } = useCart();

  const [user, setUser] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState("");

  const whatsappNumber = "2348168350533";

  async function checkUser() {
    const { session } = await getSessionSafely(supabase);

    if (!session?.user) {
      setUser(null);
      return;
    }

    setUser(session.user);
    setCustomerEmail(session.user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, delivery_address")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error.message);
      return;
    }

    setCustomerName(data?.full_name || "");
    setCustomerPhone(data?.phone || "");
    setDeliveryAddress(data?.delivery_address || "");
  }

  useEffect(() => {
    checkUser();
  }, []);

  async function handleCheckout() {
    if (isSubmitting || submittedOrderNumber) {
      return;
    }

    if (cartItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setMessage("Please enter your name and phone number.");
      return;
    }

    const orderNumber = generateOrderNumber();
    const finalAddress = deliveryAddress.trim() || "Not provided";
    const finalEmail = customerEmail.trim() || null;

    setIsSubmitting(true);
    setMessage("Saving your order...");

    const orderMessage = `
🛍️ *NEW ORDER - ELEOS DECOR*

━━━━━━━━━━━━━━━
🆔 Order ID: ${orderNumber}
━━━━━━━━━━━━━━━

${cartItems
  .map((item, index) => {
    const itemPrice = cleanPrice(item.price);

    return `
${index + 1}. ${item.title}

Quantity: ${item.quantity}
Price: ₦${itemPrice.toLocaleString()}
`;
  })
  .join("\n")}

━━━━━━━━━━━━━━━
💰 Total: ₦${cleanPrice(cartTotal).toLocaleString()}
━━━━━━━━━━━━━━━

👤 CUSTOMER DETAILS

Name: ${customerName}
Phone: ${customerPhone}
Email: ${finalEmail || "Guest customer"}

📍 Delivery Address:
${finalAddress}

📝 Order Note:
${orderNote || "None"}

Thank you for shopping with Eleos Decor ✨
`;

    const { error } = await supabase.from("checkout_inquiries").insert([
      {
        order_number: orderNumber,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: finalEmail,
        delivery_address: finalAddress,
        items: cartItems,
        total_amount: cleanPrice(cartTotal),
        order_note: orderNote.trim() || null,
        status: normalizeOrderStatus("new"),
        user_id: user?.id || null,
      },
    ]);

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    fetch("/api/send-inquiry-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: finalEmail,
        customerAddress: finalAddress,
        items: cartItems,
        totalAmount: cleanPrice(cartTotal),
        orderNote,
      }),
    }).catch(() => {});

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`,
      "_blank"
    );

    setSubmittedOrderNumber(orderNumber);
    onOrderRequestSent?.({
      orderNumber,
      whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        orderMessage
      )}`,
      hasAccount: Boolean(user?.id),
    });
    clearCart?.();
    setMessage("Order request sent. Continue on WhatsApp to finalize.");
    setIsSubmitting(false);
  }

  return (
    <div>
      <hr />
      <h5 className="fw-bold mb-3">Contact Details</h5>

      <div className="mb-3">
        <label className="form-label">Name</label>
        <input className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" />
      </div>

      <div className="mb-3">
        <label className="form-label">Phone Number</label>
        <input className="form-control" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 08123456789" />
      </div>

      <div className="mb-3">
        <label className="form-label">Email Address</label>
        <input type="email" className="form-control" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="your@email.com" />
      </div>

      <div className="mb-3">
        <label className="form-label">Delivery Address</label>
        <textarea className="form-control" rows={compact ? "2" : "3"} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter delivery address" />
      </div>

      <div className="mb-3">
        <label className="form-label">Order Note</label>
        <textarea className="form-control" rows={compact ? "2" : "3"} value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Optional note about your order" />
      </div>

      <button
        onClick={handleCheckout}
        disabled={isSubmitting || Boolean(submittedOrderNumber)}
        className="btn btn-dark w-100 mb-2"
      >
        {isSubmitting
          ? "Processing..."
          : submittedOrderNumber
          ? "Order Request Sent"
          : "Checkout on WhatsApp"}
      </button>

      {message && <p className="text-muted small mt-2 mb-0">{message}</p>}
    </div>
  );
}
