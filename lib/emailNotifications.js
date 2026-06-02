import { Resend } from "resend";
import { getCartVariantLabel } from "./productVariants";

const REQUIRED_RESEND_ENV = [
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNaira(value) {
  return `NGN ${Number(value || 0).toLocaleString()}`;
}

function summarizeError(error) {
  if (!error) {
    return { message: "Unknown email error" };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return {
    message: error.message || error.name || "Unknown email error",
    name: error.name,
    statusCode: error.statusCode,
    code: error.code,
  };
}

export function getResendEmailConfig() {
  const missing = REQUIRED_RESEND_ENV.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    return { missing };
  }

  return {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.CONTACT_FROM_EMAIL,
    toEmail: process.env.CONTACT_TO_EMAIL,
    missing: [],
  };
}

export function createResendClient(config) {
  return new Resend(config.apiKey);
}

export function jsonEmailEnvError(missing) {
  return Response.json(
    {
      success: false,
      error: `Missing required email env var${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
    },
    { status: 500 }
  );
}

export function logEmailError(context, error, details = {}) {
  console.error(`[email:${context}]`, {
    ...details,
    error: summarizeError(error),
  });
}

export function buildOrderItemsHtml(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return "<li>No items provided.</li>";
  }

  return items
    .map((item) => {
      const variantLabel = getCartVariantLabel(item);

      return `
        <li>
          <strong>${escapeHtml(item.title || "Untitled item")}</strong><br />
          ${variantLabel ? `Selected Print: ${escapeHtml(variantLabel)}<br />` : ""}
          Quantity: ${escapeHtml(item.quantity || 1)}<br />
          Price: ${formatNaira(item.price)}
        </li>
      `;
    })
    .join("");
}

export function buildAdminOrderEmailHtml(order) {
  return `
    <div style="font-family: sans-serif; line-height: 1.7;">
      <h2>New Checkout Inquiry</h2>

      <p><strong>Order ID:</strong> ${escapeHtml(order.orderNumber || "Not provided")}</p>
      <p><strong>Name:</strong> ${escapeHtml(order.customerName || "Not provided")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customerPhone || "Not provided")}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customerEmail || "Guest customer")}</p>
      <p><strong>Delivery Address:</strong> ${escapeHtml(order.customerAddress || "Not provided")}</p>

      <h3>Items</h3>
      <ul>${buildOrderItemsHtml(order.items)}</ul>

      <p><strong>Total:</strong> ${formatNaira(order.totalAmount)}</p>
      <p><strong>Order Note:</strong> ${escapeHtml(order.orderNote || "None")}</p>
    </div>
  `;
}

export function buildCustomerOrderEmailHtml(order) {
  return `
    <div style="font-family: sans-serif; line-height: 1.7;">
      <h2>Thank You for Shopping with Eleos Decor</h2>

      <p>Hello ${escapeHtml(order.customerName || "there")},</p>
      <p>We have received your checkout inquiry successfully.</p>
      <p>Our team will contact you shortly to confirm your order details and payment.</p>

      <h3>Order Summary</h3>
      <p><strong>Order ID:</strong> ${escapeHtml(order.orderNumber || "Not provided")}</p>
      <ul>${buildOrderItemsHtml(order.items)}</ul>

      <p><strong>Total:</strong> ${formatNaira(order.totalAmount)}</p>
      <p>Thank you for choosing Eleos Decor.</p>
    </div>
  `;
}
