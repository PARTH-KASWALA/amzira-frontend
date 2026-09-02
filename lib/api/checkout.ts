import { z } from "zod";
import { browserApi } from "@/lib/api/browser-client";
import type { CheckoutPreview, PaymentOrder } from "@/lib/api/types";

const commerceStatusSchema = z.object({
  checkout_enabled: z.boolean(),
  cod_enabled: z.boolean()
});

const checkoutItemSchema = z.object({
  cart_item_id: z.coerce.number(),
  product_id: z.coerce.number(),
  product_name: z.string(),
  product_image: z.string().nullish(),
  variant_id: z.coerce.number(),
  variant_details: z.string().nullish(),
  quantity: z.coerce.number(),
  unit_price: z.coerce.number(),
  total_price: z.coerce.number()
});

const previewSchema = z.object({
  items: z.array(checkoutItemSchema),
  subtotal: z.coerce.number(),
  shipping: z.coerce.number().optional(),
  shipping_amount: z.coerce.number().optional(),
  discount: z.coerce.number().default(0),
  tax: z.coerce.number(),
  total: z.coerce.number(),
  address_id: z.coerce.number(),
  status: z.string()
});

const paymentOrderSchema = z.object({
  payment_required: z.boolean().default(true),
  order_id: z.coerce.number().optional(),
  order_number: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_key_id: z.string().optional(),
  amount: z.coerce.number(),
  currency: z.string(),
  subtotal: z.coerce.number(),
  shipping: z.coerce.number().optional(),
  shipping_amount: z.coerce.number().optional(),
  discount: z.coerce.number().default(0),
  tax: z.coerce.number(),
  total: z.coerce.number()
});

function mapItems(items: z.infer<typeof checkoutItemSchema>[]) {
  return items.map((item) => ({
    id: item.cart_item_id,
    productId: item.product_id,
    productName: item.product_name,
    productSlug: "",
    productImage: item.product_image || "",
    variantId: item.variant_id,
    variantDetails: item.variant_details || "Selected style",
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
    stockAvailable: item.quantity
  }));
}

export async function getCommerceStatus() {
  const value = commerceStatusSchema.parse(await browserApi<unknown>("/commerce/status"));
  return { checkoutEnabled: value.checkout_enabled, codEnabled: value.cod_enabled };
}

export async function validateCheckout(userId: number, addressId: number): Promise<CheckoutPreview> {
  const value = previewSchema.parse(
    await browserApi<unknown>("/checkout", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, address_id: addressId })
    })
  );
  return {
    items: mapItems(value.items),
    subtotal: value.subtotal,
    shipping: value.shipping ?? value.shipping_amount ?? 0,
    discount: value.discount,
    tax: value.tax,
    total: value.total,
    addressId: value.address_id,
    status: value.status
  };
}

export async function createPaymentOrder(userId: number, addressId: number, couponCode?: string): Promise<PaymentOrder> {
  const value = paymentOrderSchema.parse(
    await browserApi<unknown>("/create-payment-order", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, address_id: addressId, coupon_code: couponCode || null })
    })
  );
  return {
    items: [],
    subtotal: value.subtotal,
    shipping: value.shipping ?? value.shipping_amount ?? 0,
    discount: value.discount,
    tax: value.tax,
    total: value.total,
    addressId,
    status: "payment_pending",
    paymentRequired: value.payment_required,
    orderId: value.order_id,
    orderNumber: value.order_number,
    razorpayOrderId: value.razorpay_order_id,
    razorpayKeyId: value.razorpay_key_id,
    amount: value.amount,
    currency: value.currency
  };
}

export async function verifyPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
  addressId: number;
}) {
  return browserApi<Record<string, unknown>>("/verify-payment", {
    method: "POST",
    body: JSON.stringify({
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
      user_id: input.userId,
      address_id: input.addressId
    }),
    timeoutMs: 20000
  });
}
