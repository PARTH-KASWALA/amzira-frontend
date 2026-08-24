"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Heart, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { AddToCartButton } from "@/components/cart-button";
import { SizeChartDialog } from "@/components/size-chart-dialog";
import { Product } from "@/lib/catalog";

export function ProductPurchase({ product }: { product: Product }) {
  const variants = useMemo(
    () => [...product.variants].sort((left, right) => Number.parseInt(left.size) - Number.parseInt(right.size)),
    [product.variants]
  );
  const inStockSizes = variants.filter((variant) => variant.stockQuantity > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | number | null>(
    inStockSizes[0]?.id || variants[0]?.id || null
  );
  const selectedSize = variants.find((variant) => String(variant.id) === String(selectedVariantId))?.size;

  return (
    <div className="space-y-6">
      {/* Size Selection Section */}
      <div className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-maroon-deep flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-maroon" /> Select Size <span className="text-charcoal/60 font-medium lowercase tracking-normal">(Age Group)</span>
          </h2>
          <SizeChartDialog selectedSize={selectedSize} />
        </div>

        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Select product size">
          {variants.length ? (
            variants.map((variant) => {
              const disabled = variant.stockQuantity <= 0;
              const selected = String(selectedVariantId) === String(variant.id);
              return (
                <button
                  key={String(variant.id)}
                  type="button"
                  disabled={disabled}
                  role="radio"
                  aria-label={variant.size}
                  aria-checked={selected}
                  className={`focus-ring relative flex flex-col items-center justify-center min-h-[54px] min-w-[76px] rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
                    selected
                      ? "border-2 border-[#580B26] bg-[#580B26] text-white shadow-md scale-[1.02]"
                      : "border-amber-900/15 bg-white text-charcoal hover:border-maroon/50 hover:text-maroon"
                  } disabled:cursor-not-allowed disabled:opacity-35`}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  <span className="font-display text-sm font-bold">{variant.size}</span>
                  {!disabled ? (
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 rounded-full px-2 py-0.2 text-[9px] font-extrabold ${
                        selected ? "bg-amber-300 text-maroon-deep" : "bg-amber-100 text-maroon-deep"
                      }`}
                    >
                      {variant.stockQuantity} left
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <button
              type="button"
              role="radio"
              aria-checked="true"
              className="focus-ring rounded-xl border border-maroon bg-maroon px-4 py-2 text-xs font-bold text-white"
            >
              Free Size
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3">
        <AddToCartButton product={product} variantId={selectedVariantId || undefined} className="w-full py-4 text-xs font-bold uppercase tracking-wider rounded-2xl bg-[#580B26] shadow-md" />
        <Link className="btn-secondary w-full rounded-2xl justify-center gap-2 text-xs font-bold" href="/appointments">
          <CalendarDays className="h-4 w-4 text-maroon" /> Book Styling Appointment
        </Link>
      </div>

      {/* Royal Fit & Skin Comfort Guarantee */}
      <div className="rounded-2xl border border-amber-900/10 bg-white p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-maroon-deep">
          <ShieldCheck className="h-4 w-4 text-emerald" />
          <span>Soft Skin Lining & Alteration Guarantee</span>
        </div>
        <p className="text-charcoal/65 leading-relaxed text-[11px]">
          Every AMZIRA lehenga & pattu pavadai features a soft 100% breathable cotton inner lining to ensure zero skin irritation during celebrations, with generous inner seam allowances for easy future alterations.
        </p>
      </div>
    </div>
  );
}
