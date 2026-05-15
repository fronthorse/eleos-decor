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
  new: "New",
  contacted: "Contacted",
  payment_pending: "Payment Pending",
  paid: "Paid",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
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

  return ORDER_STATUS_LABELS[normalizedStatus] || "New";
}
