export const ORDER_STATUSES = [
  "placed",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "return_requested",
  "returned",
  "cancelled",
  "refunded"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "success", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const labels: Record<OrderStatus, string> = {
  placed: "Placed",
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  return_requested: "Return requested",
  returned: "Returned",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

export function orderStatusLabel(status: string) {
  return labels[status as OrderStatus] || status.replaceAll("_", " ");
}

export function statusTone(status: string) {
  if (["delivered", "refunded"].includes(status)) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (["cancelled", "failed", "returned"].includes(status)) return "bg-red-50 text-red-800 ring-red-200";
  if (["shipped", "out_for_delivery"].includes(status)) return "bg-blue-50 text-blue-800 ring-blue-200";
  if (["pending", "placed", "return_requested"].includes(status)) return "bg-amber-50 text-amber-900 ring-amber-200";
  return "bg-slate-100 text-slate-800 ring-slate-200";
}

export function formatAdminDate(value: string | null | undefined, withTime = true) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" as const } : {})
  }).format(date);
}
