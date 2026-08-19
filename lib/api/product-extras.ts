import { z } from "zod";
import { browserApi } from "@/lib/api/browser-client";

const deliverySchema = z.object({
  pincode: z.string(),
  shipping_cost: z.coerce.number(),
  delivery_days_min: z.coerce.number(),
  delivery_days_max: z.coerce.number(),
  estimated_delivery_date_start: z.string(),
  estimated_delivery_date_end: z.string()
});

const reviewSchema = z.object({
  id: z.string(),
  user_id: z.coerce.number(),
  product_id: z.coerce.number(),
  rating: z.coerce.number(),
  comment: z.string().nullish(),
  verified_purchase: z.boolean(),
  created_at: z.string(),
  user_name: z.string()
});

export type ProductReview = z.infer<typeof reviewSchema>;

export async function getDeliveryEstimate(slug: string, pincode: string) {
  return deliverySchema.parse(
    await browserApi<unknown>(`/products/${encodeURIComponent(slug)}/delivery-estimate?pincode=${encodeURIComponent(pincode)}`)
  );
}

export async function getProductReviews(productId: number) {
  const value = z.object({ reviews: z.array(reviewSchema), total: z.coerce.number() }).parse(
    await browserApi<unknown>(`/reviews/product/${productId}?page=1&per_page=12`)
  );
  return value;
}

export async function createProductReview(productId: number, rating: number, comment: string) {
  return reviewSchema.parse(
    await browserApi<unknown>("/reviews/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, rating, comment })
    })
  );
}
