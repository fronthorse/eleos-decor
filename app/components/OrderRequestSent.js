"use client";

import Link from "next/link";

export default function OrderRequestSent({
  orderRequest,
  className = "",
  onReturnToShop,
}) {
  if (!orderRequest) {
    return null;
  }

  return (
    <div className={`order-request-card mx-auto ${className}`.trim()}>
      <p className="section-label">WhatsApp Checkout</p>
      <h2 className="luxury-heading mb-3">{"\u2728"} Order Request Sent</h2>

      <p className="text-muted mb-3">
        Your decor request has been prepared and sent to Eleos Decor on
        WhatsApp.
      </p>

      <div className="order-request-steps">
        <p>Our team will:</p>
        <ul>
          <li>confirm product availability</li>
          <li>discuss delivery details</li>
          <li>finalize your order</li>
        </ul>
      </div>

      <p className="text-muted small mb-4">
        Order ID: <strong>{orderRequest.orderNumber}</strong>. This request is
        not a completed payment yet. If you closed WhatsApp accidentally, you
        can reopen the conversation below.
      </p>

      <div className="order-request-actions">
        <a
          href={orderRequest.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success"
        >
          Continue on WhatsApp
        </a>

        <Link
          href="/shop"
          onClick={onReturnToShop}
          className="btn btn-outline-dark"
        >
          Return to Shop
        </Link>

        {orderRequest.hasAccount && (
          <Link href="/customer/dashboard#orders" className="btn btn-dark">
            View My Orders
          </Link>
        )}
      </div>
    </div>
  );
}
