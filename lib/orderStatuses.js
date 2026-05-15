export const ORDER_STATUSES = [
  "new",
  "contacted",
  "payment_pending",
  "paid",
  "processing",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS = {
  new: "Awaiting Confirmation",
  contacted: "Contacted",
  payment_pending: "Payment Pending",
  paid: "Payment Confirmed",
  processing: "Processing Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_DESCRIPTIONS = {
  new: "Customer submitted an order request.",
  contacted: "WhatsApp conversation has started.",
  payment_pending: "Awaiting customer payment.",
  paid: "Payment has been confirmed.",
  processing: "Order is being prepared for delivery.",
  delivered: "Order has been delivered.",
  cancelled: "Order was cancelled.",
};

export const ORDER_STATUS_PROGRESS = {
  new: 1,
  contacted: 2,
  payment_pending: 3,
  paid: 4,
  processing: 5,
  delivered: 6,
  cancelled: 0,
};

export const ORDER_STATUS_ICONS = {
  new: "\u25cf",
  contacted: "\u25cf",
  payment_pending: "\u25cf",
  paid: "\u2713",
  processing: "\u2192",
  delivered: "\u2713",
  cancelled: "\u00d7",
};

const LEGACY_STATUS_MAP = {
  New: "new",
  pending: "new",
  Contacted: "contacted",
  "Payment Pending": "payment_pending",
  Paid: "paid",
  payment_confirmed: "paid",
  Processing: "processing",
  Delivered: "delivered",
  fulfilled: "delivered",
  Cancelled: "cancelled",
};

export function normalizeOrderStatus(status) {
  if (!status) {
    return "new";
  }

  return LEGACY_STATUS_MAP[status] || status;
}

export function formatOrderStatus(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  return ORDER_STATUS_LABELS[normalizedStatus] || ORDER_STATUS_LABELS.new;
}

export function getOrderStatusDescription(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  return (
    ORDER_STATUS_DESCRIPTIONS[normalizedStatus] || ORDER_STATUS_DESCRIPTIONS.new
  );
}

export function getOrderStatusProgress(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  return ORDER_STATUS_PROGRESS[normalizedStatus] || 0;
}

export function getOrderStatusIcon(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  return ORDER_STATUS_ICONS[normalizedStatus] || ORDER_STATUS_ICONS.new;
}
