"use client";

import { useState } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart-button";
import { Product } from "@/lib/catalog";

export function ProductPurchase({ product }: { product: Product }) {
  const inStockSizes = product.variants.filter((variant) => variant.stockQuantity > 0);
  const [selectedSize, setSelectedSize] = useState(inStockSizes[0]?.size || product.variants[0]?.size || "Free");

  return (
    <>
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]">Select size</h2>
          <Link href="/faqs#size" className="focus-ring rounded-sm text-sm font-semibold text-maroon">
            Size help
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Select product size">
          {product.variants.length ? (
            product.variants.map((variant) => {
              const disabled = variant.stockQuantity <= 0;
              const selected = selectedSize === variant.size;
              return (
                <button
                  key={String(variant.id)}
                  type="button"
                  disabled={disabled}
                  role="radio"
                  aria-checked={selected}
                  className={`focus-ring min-h-11 rounded-md border px-3 text-sm font-semibold transition ${
                    selected
                      ? "border-maroon bg-maroon text-white"
                      : "border-charcoal/15 bg-white text-charcoal hover:border-maroon hover:text-maroon"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                  onClick={() => setSelectedSize(variant.size)}
                >
                  {variant.size}
                </button>
              );
            })
          ) : (
            <button
              type="button"
              role="radio"
              aria-checked="true"
              className="focus-ring min-h-11 rounded-md border border-maroon bg-maroon px-3 text-sm font-semibold text-white"
            >
              Free
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        <AddToCartButton product={product} size={selectedSize} className="w-full" />
        <Link className="btn-secondary w-full" href="/appointments">
          Book styling appointment
        </Link>
      </div>
    </>
  );
}
