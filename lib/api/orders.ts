import { z } from "zod";
import { API_BASE_URL } from "@/lib/api/config";
import { browserApi } from "@/lib/api/browser-client";
import type { OrderSummary, ReturnEligibility } from "@/lib/api/types";

const orderItemSchema = z.object({
  id: z.coerce.number().default(0),
  product_id: z.coerce.number().default(0),
  product_name: z.string().default("AMZIRA outfit"),
  variant_details: z.string().nullish(),
  quantity: z.coerce.number().default(1),
  unit_price: z.coerce.number().default(0),
  total_price: z.coerce.number().default(0),
  image: z.string().nullish(),
  size: z.string().nullish()
});

const orderSchema = z.object({
  id: z.coerce.number(),
  order_number: z.string(),
  status: z.string().default("placed"),
  public_status: z.string().default("PLACED"),
  payment_status: z.string().default("pending"),
  payment_method: z.string().default("razorpay"),
  subtotal: z.coerce.number().default(0),
  tax: z.coerce.number().optional(),
  tax_amount: z.coerce.number().optional(),
  shipping_amount: z.coerce.number().optional(),
  shipping_charge: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  discount_amount: z.coerce.number().optional(),
  coupon_code: z.string().nullish(),
  total: z.coerce.number().optional(),
  total_amount: z.coerce.number().optional(),
  items: z.array(orderItemSchema).default([]),
  created_at: z.string().default(""),
  estimated_delivery: z.string().nullish(),
  tracking_number: z.string().nullish(),
  courier_name: z.string().nullish(),
  timeline: z.array(z.record(z.unknown())).default([])
});

const returnEligibilitySchema = z.object({
  eligible: z.boolean(),
  return_deadline: z.string().nullish(),
  server_time: z.string(),
  ms_remaining: z.coerce.number().nonnegative(),
  return_status: z.string()
});

function mapOrder(input: unknown): OrderSummary {
  const value = orderSchema.parse(input);
  return {
    id: value.id,
    orderNumber: value.order_number,
    status: value.status,
    publicStatus: value.public_status,
    paymentStatus: value.payment_status,
    paymentMethod: value.payment_method,
    subtotal: value.subtotal,
    tax: value.tax ?? value.tax_amount ?? 0,
    shipping: value.shipping_amount ?? value.shipping_charge ?? 0,
    discount: value.discount ?? value.discount_amount ?? 0,
    couponCode: value.coupon_code || "",
    total: value.total ?? value.total_amount ?? 0,
    items: value.items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      variantDetails: item.variant_details || "Selected style",
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      image: item.image || "",
      size: item.size || ""
    })),
    createdAt: value.created_at,
    estimatedDelivery: value.estimated_delivery || "",
    trackingNumber: value.tracking_number || "",
    courierName: value.courier_name || "",
    timeline: value.timeline
  };
}

export async function getOrders() {
  const values = await browserApi<unknown[]>("/orders/?page=1&limit=50");
  return z.array(orderSchema).parse(values).map(mapOrder);
}

export async function getOrder(reference: string) {
  return mapOrder(await browserApi<unknown>(`/orders/${encodeURIComponent(reference)}`));
}

export async function getOrderTracking(reference: string) {
  return browserApi<Record<string, unknown>>(`/orders/${encodeURIComponent(reference)}/tracking`);
}

export async function cancelOrder(orderId: number) {
  await browserApi(`/orders/${orderId}/cancel`, { method: "PUT" });
}

export async function requestOrderReturn(orderId: number, reason: string, description: string) {
  return browserApi(`/orders/${orderId}/return`, {
    method: "POST",
    body: JSON.stringify({ reason, description })
  });
}

export async function getReturnEligibility(orderId: number): Promise<ReturnEligibility> {
  const value = returnEligibilitySchema.parse(
    await browserApi<unknown>(`/orders/${orderId}/return-eligibility`)
  );
  return {
    eligible: value.eligible,
    returnDeadline: value.return_deadline || "",
    serverTime: value.server_time,
    msRemaining: value.ms_remaining,
    returnStatus: value.return_status
  };
}

export async function downloadInvoice(orderNumber: string) {
  const response = await fetch(`${API_BASE_URL}/orders/orders/${encodeURIComponent(orderNumber)}/invoice`, {
    credentials: "include",
    headers: { Accept: "application/pdf" }
  });
  if (!response.ok) throw new Error("Invoice is not available for this order yet.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `AMZIRA-${orderNumber}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
