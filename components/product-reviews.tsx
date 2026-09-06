"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Images, Star } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { createProductReview, getProductReviews, type ProductReview } from "@/lib/api/product-extras";

export function ProductReviews({ productId }: { productId: string | number }) {
  const { status } = useSession();
  const numericId = Number(productId);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!Number.isInteger(numericId)) return;
    getProductReviews(numericId, selectedRating)
      .then((value) => {
        setReviews(value.reviews);
        setTotal(value.total);
      })
      .catch(() => {
        setReviews([]);
        setTotal(0);
      });
  }, [numericId, selectedRating]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createProductReview(numericId, Number(form.get("rating")), String(form.get("comment") || ""));
      const latest = await getProductReviews(numericId, selectedRating);
      setReviews(latest.reviews);
      setTotal(latest.total);
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
        <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Filter reviews by rating">
          {[undefined, 5, 4, 3, 2, 1].map((rating) => {
            const selected = selectedRating === rating;
            const label = rating ? `${rating} stars` : "All ratings";
            return (
              <button
                className={`focus-ring rounded-full border px-3 py-2 text-xs font-bold ${selected ? "border-maroon bg-maroon text-white" : "border-charcoal/15 bg-white text-charcoal/70 hover:border-maroon/40 hover:text-maroon"}`}
                key={label}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedRating(rating)}
              >
                {rating ? `${rating} ★` : "All"}
              </button>
            );
          })}
          {total ? <span className="ml-1 text-xs text-charcoal/60">{total} published review{total === 1 ? "" : "s"}</span> : null}
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {reviews.map((review) => (
              <article className="border-b border-charcoal/10 pb-5" key={review.id}>
                <div className="flex items-center gap-1 text-gold" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, index) => <Star className={`h-4 w-4 ${index < review.rating ? "fill-current" : "opacity-25"}`} key={index} aria-hidden="true" />)}</div>
                <p className="mt-3 leading-7 text-charcoal/70">{review.comment || "Rated without a written review."}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-charcoal/70">
                  {review.user_name}
                  {review.verified_purchase ? <><CheckCircle2 className="h-4 w-4 text-emerald" aria-hidden="true" /> Verified AMZIRA purchase</> : null}
                  {review.marketplace_verified_purchase ? <><CheckCircle2 className="h-4 w-4 text-emerald" aria-hidden="true" /> Verified {review.source === "myntra" ? "Myntra" : "Flipkart"} purchase</> : null}
                </p>
                {review.media.length ? (
                  <div className="mt-4 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
                    {review.media.map((media) => (
                      <a className="focus-ring overflow-hidden rounded-xl border border-charcoal/10" href={media.media_url} key={media.id} rel="noreferrer" target="_blank">
                        <span className="relative block aspect-square">
                          <Image alt={media.alt_text || "Customer shared product photo"} className="object-cover" fill sizes="(max-width: 640px) 45vw, 12rem" src={media.media_url} unoptimized />
                        </span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
            {!reviews.length ? <p className="flex items-center gap-2 text-sm text-charcoal/60"><Images className="h-4 w-4" aria-hidden="true" /> No published reviews match this filter yet.</p> : null}
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
