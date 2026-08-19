import { z } from "zod";
import { API_ORIGIN } from "@/lib/api/config";
import { browserApi } from "@/lib/api/browser-client";
import type { CartSummary } from "@/lib/api/types";
import type { GuestCartItem } from "@/lib/cart";
import { writeGuestCart } from "@/lib/cart";

const cartSchema = z.object({
  items: z.array(
    z.object({
      id: z.coerce.number(),
      product_id: z.coerce.number(),
      product_name: z.string(),
      product_slug: z.string(),
      product_image: z.string().nullish(),
      variant_id: z.coerce.number(),
      variant_details: z.string().nullish(),
      quantity: z.coerce.number(),
      unit_price: z.coerce.number(),
      total_price: z.coerce.number(),
      stock_available: z.coerce.number()
    })
  ),
  subtotal: z.coerce.number(),
  shipping: z.coerce.number().optional(),
  shipping_amount: z.coerce.number().optional(),
  tax: z.coerce.number().default(0),
  total: z.coerce.number(),
  total_items: z.coerce.number()
});

function imageUrl(path: string | null | undefined) {
  if (!path) return "/images/hero-upgrade/green-kids-lehenga-front.webp";
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/") ? `${API_ORIGIN}${path}` : path;
}

export async function getAuthenticatedCart(): Promise<CartSummary> {
  const value = cartSchema.parse(await browserApi<unknown>("/cart/"));
  return {
    items: value.items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productSlug: item.product_slug,
      productImage: imageUrl(item.product_image),
      variantId: item.variant_id,
      variantDetails: item.variant_details || "Selected style",
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      stockAvailable: item.stock_available
    })),
    subtotal: value.subtotal,
    shipping: value.shipping ?? value.shipping_amount ?? 0,
    tax: value.tax,
    total: value.total,
    totalItems: value.total_items
  };
}

export async function addAuthenticatedCartItem(productId: number, variantId: number, quantity = 1) {
  await browserApi("/cart/items", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity })
  });
}

export async function updateAuthenticatedCartItem(itemId: number, quantity: number) {
  await browserApi(`/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity })
  });
}

export async function removeAuthenticatedCartItem(itemId: number) {
  await browserApi(`/cart/items/${itemId}`, { method: "DELETE" });
}

export async function syncGuestCart(items: GuestCartItem[]) {
  const failed: GuestCartItem[] = [];
  for (const item of items) {
    const productId = Number(item.productId);
    const variantId = Number(item.variantId);
    if (!Number.isInteger(productId) || !Number.isInteger(variantId)) {
      failed.push(item);
      continue;
    }
    try {
      await addAuthenticatedCartItem(productId, variantId, item.quantity);
    } catch {
      failed.push(item);
    }
  }
  writeGuestCart(failed);
  return { synchronized: items.length - failed.length, failed };
}
