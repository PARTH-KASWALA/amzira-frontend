"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Eye, X } from "lucide-react";
import { Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

export function ProductQuickView({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogId = `quick-view-${product.slug}`;
  const availableVariants = product.variants.filter((variant) => variant.stockQuantity > 0);
  const availableSizes = Array.from(new Set(availableVariants.map((variant) => variant.size).filter(Boolean)));

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="focus-ring absolute bottom-3 left-3 z-10 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-maroon shadow-sm transition hover:bg-white"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Quick view
      </button>

      {open ? createPortal(
        <div
          className="fixed inset-0 z-[120] bg-charcoal/75 p-4 backdrop-blur-[1px] sm:p-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="mx-auto flex max-h-full w-full max-w-4xl flex-col overflow-auto bg-ivory shadow-2xl sm:grid sm:grid-cols-2 sm:overflow-hidden"
          >
            <div className="relative min-h-[22rem] bg-sandal sm:min-h-0">
              <Image
                src={product.primaryImage}
                alt={product.name}
                fill
                unoptimized={product.primaryImage.startsWith("/images/") || product.primaryImage.startsWith("https://cdn.amzira.com/")}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex min-h-0 flex-col bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-charcoal/10 pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep">AMZIRA quick view</p>
                  <h2 id={`${dialogId}-title`} className="mt-2 font-display text-3xl font-semibold leading-tight text-maroon-deep">{product.name}</h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-charcoal/20 text-charcoal hover:border-maroon hover:text-maroon"
                  aria-label="Close quick view"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto py-6">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-bold text-maroon">{formatMoney(product.salePrice)}</span>
                  {product.basePrice > product.salePrice ? <span className="text-sm text-charcoal/60 line-through">{formatMoney(product.basePrice)}</span> : null}
                </div>
                <p className="text-sm leading-7 text-charcoal/70">{product.description}</p>

                {availableSizes.length ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-charcoal/65">Available sizes</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableSizes.map((size) => <span key={size} className="rounded-full border border-charcoal/15 bg-ivory px-3 py-2 text-xs font-semibold">{size}</span>)}
                    </div>
                  </div>
                ) : null}

                <dl className="grid gap-3 border-y border-charcoal/10 py-4 text-sm sm:grid-cols-2">
                  {product.ageRecommendation ? <div><dt className="text-charcoal/55">Age recommendation</dt><dd className="mt-1 font-semibold text-charcoal">{product.ageRecommendation}</dd></div> : null}
                  {product.fabric ? <div><dt className="text-charcoal/55">Fabric</dt><dd className="mt-1 font-semibold text-charcoal">{product.fabric}</dd></div> : null}
                  {product.includedPieces?.length ? <div><dt className="text-charcoal/55">Includes</dt><dd className="mt-1 font-semibold text-charcoal">{product.includedPieces.join(", ")}</dd></div> : null}
                  <div><dt className="text-charcoal/55">Stock</dt><dd className="mt-1 font-semibold text-charcoal">{product.inStock ? `${product.stockQuantity ?? "Available"} in stock` : "Currently sold out"}</dd></div>
                </dl>
              </div>

              <Link href={`/product/${product.slug}`} className="btn-primary mt-auto inline-flex items-center justify-center gap-2" onClick={() => setOpen(false)}>
                Choose size &amp; view details
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
