import { z } from "zod";
import { browserApi } from "@/lib/api/browser-client";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/admin/order-status";

const optionalString = z.string().nullish().transform((value) => value || null);
const optionalNumber = z.coerce.number().nullish().transform((value) => value ?? null);

const orderSummarySchema = z.object({
  id: z.coerce.number(),
  order_number: z.string(),
  customer_name: z.string(),
  customer_email: z.string(),
  customer_phone: optionalString,
  status: z.enum(ORDER_STATUSES),
  payment_status: z.enum(PAYMENT_STATUSES).nullable().optional().default(null),
  payment_method: optionalString,
  total_amount: z.coerce.number(),
  items_count: z.coerce.number(),
  created_at: z.string(),
  tracking_number: optionalString,
  courier_name: optionalString
});

const ordersPageSchema = z.object({
  total: z.coerce.number(),
  page: z.coerce.number(),
  limit: z.coerce.number(),
  pages: z.coerce.number(),
  orders: z.array(orderSummarySchema)
});

const orderItemSchema = z.object({
  id: z.coerce.number(),
  product_id: z.coerce.number(),
  variant_id: z.coerce.number(),
  product_name: z.string(),
  variant_details: optionalString,
  quantity: z.coerce.number(),
  unit_price: z.coerce.number(),
  total_price: z.coerce.number()
});

const historySchema = z.object({
  id: z.coerce.number(),
  old_status: optionalString,
  new_status: z.string(),
  changed_by: optionalNumber,
  notes: optionalString,
  created_at: z.string()
});

const orderDetailSchema = z.object({
  id: z.coerce.number(),
  order_number: z.string(),
  customer: z.object({ name: z.string(), email: z.string(), phone: optionalString }),
  status: z.enum(ORDER_STATUSES),
  allowed_next_statuses: z.array(z.enum(ORDER_STATUSES)),
  subtotal: z.coerce.number(),
  tax_amount: z.coerce.number(),
  shipping_charge: z.coerce.number(),
  discount_amount: z.coerce.number(),
  coupon_code: optionalString,
  total_amount: z.coerce.number(),
  items: z.array(orderItemSchema),
  shipping_address: z.object({
    full_name: z.string(),
    phone: z.string(),
    address_line1: z.string(),
    address_line2: optionalString,
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string()
  }),
  payment: z.object({
    method: optionalString,
    status: z.enum(PAYMENT_STATUSES).nullable().optional().default(null),
    amount: optionalNumber,
    currency: optionalString,
    transaction_reference: optionalString,
    refunded_amount: z.coerce.number().default(0),
    paid_at: optionalString
  }),
  customer_notes: optionalString,
  admin_notes: optionalString,
  tracking_number: optionalString,
  carrier_name: optionalString,
  courier_name: optionalString,
  awb_code: optionalString,
  tracking_url: optionalString,
  current_location: optionalString,
  estimated_delivery_date: optionalString,
  delivered_at: optionalString,
  status_history: z.array(historySchema),
  created_at: z.string()
});

export type SellerOrderSummary = z.infer<typeof orderSummarySchema>;
export type SellerOrdersPage = z.infer<typeof ordersPageSchema>;
export type SellerOrderDetail = z.infer<typeof orderDetailSchema>;

export type SellerOrderFilters = {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
};

export async function getSellerOrders(filters: SellerOrderFilters = {}) {
  const query = new URLSearchParams();
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.status) query.set("status", filters.status);
  if (filters.paymentStatus) query.set("payment_status", filters.paymentStatus);
  query.set("page", String(filters.page || 1));
  query.set("limit", String(filters.limit || 20));
  return ordersPageSchema.parse(await browserApi<unknown>(`/admin/orders?${query.toString()}`));
}

export async function getSellerOrder(orderId: number) {
  return orderDetailSchema.parse(await browserApi<unknown>(`/admin/orders/${orderId}`));
}

export async function updateSellerOrderStatus(
  orderId: number,
  input: {
    status: string;
    trackingNumber?: string;
    carrierName?: string;
    estimatedDeliveryDate?: string;
    notes?: string;
  }
) {
  return browserApi<{ order_id: number; status: string }>(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({
      status: input.status,
      tracking_number: input.trackingNumber?.trim() || null,
      carrier_name: input.carrierName?.trim() || null,
      estimated_delivery_date: input.estimatedDeliveryDate || null,
      notes: input.notes?.trim() || null
    })
  });
}
