"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { createProductReview, getProductReviews, type ProductReview } from "@/lib/api/product-extras";

export function ProductReviews({ productId }: { productId: string | number }) {
  const { status } = useSession();
  const numericId = Number(productId);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!Number.isInteger(numericId)) return;
    getProductReviews(numericId).then((value) => setReviews(value.reviews)).catch(() => setReviews([]));
  }, [numericId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createProductReview(numericId, Number(form.get("rating")), String(form.get("comment") || ""));
      setReviews((await getProductReviews(numericId)).reviews);
      setMessage("Your review has been published.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be submitted.");
    }
  }

  if (!Number.isInteger(numericId)) return null;
  return (
    <section className="product-reviews-section border-t border-charcoal/10">
      <div className="container-page py-14">
        <h2 className="font-display text-4xl font-semibold text-maroon-deep">Customer reviews</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {reviews.map((review) => (
              <article className="border-b border-charcoal/10 pb-5" key={review.id}>
                <div className="flex items-center gap-1 text-gold" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, index) => <Star className={`h-4 w-4 ${index < review.rating ? "fill-current" : "opacity-25"}`} key={index} aria-hidden="true" />)}</div>
                <p className="mt-3 leading-7 text-charcoal/70">{review.comment || "Rated without a written review."}</p>
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-charcoal/70">{review.user_name}{review.verified_purchase ? <><CheckCircle2 className="h-4 w-4 text-emerald" aria-hidden="true" /> Verified purchase</> : null}</p>
              </article>
            ))}
            {!reviews.length ? <p className="text-sm text-charcoal/60">No reviews yet. Verified buyers can share the first one.</p> : null}
          </div>
          {status === "authenticated" ? (
            <form className="h-fit rounded-md border border-charcoal/10 bg-white p-5" onSubmit={submit}>
              <h3 className="font-display text-2xl text-maroon-deep">Share your experience</h3>
              <label className="form-field mt-5">Rating<select name="rating" defaultValue="5"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
              <label className="form-field mt-4">Review<textarea name="comment" rows={4} maxLength={1000} required /></label>
              <button className="btn-primary mt-5 w-full" type="submit">Publish review</button>
              {message ? <p className="mt-3 text-sm font-semibold text-maroon" role="status">{message}</p> : null}
            </form>
          ) : (
            <div className="h-fit border-t border-charcoal/10 pt-5"><p className="text-sm leading-6 text-charcoal/65">Sign in after a verified purchase to share a review.</p><Link className="btn-secondary mt-4" href="/login">Sign in</Link></div>
          )}
        </div>
      </div>
    </section>
  );
}
