import { z } from "zod";
import { browserApi } from "@/lib/api/browser-client";

const wishlistItemSchema = z.object({
  id: z.coerce.number(),
  product_id: z.coerce.number(),
  product_name: z.string(),
  product_slug: z.string(),
  product_price: z.coerce.number(),
  product_image: z.string().nullish()
});

export type WishlistItem = z.infer<typeof wishlistItemSchema>;

export async function getWishlist() {
  const value = z.object({ wishlist_items: z.array(wishlistItemSchema) }).parse(
    await browserApi<unknown>("/wishlist/")
  );
  return value.wishlist_items;
}

export async function addWishlistItem(productId: number) {
  await browserApi("/wishlist/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId })
  });
}

export async function removeWishlistItem(productId: number) {
  await browserApi(`/wishlist/${productId}`, { method: "DELETE" });
}

export async function isWishlistItem(productId: number) {
  const value = await browserApi<{ in_wishlist: boolean }>(`/wishlist/check/${productId}`);
  return value.in_wishlist;
}
