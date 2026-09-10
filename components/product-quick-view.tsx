"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Eye, Ruler, X } from "lucide-react";
import { Product, ProductImage, ProductVariant } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "@/components/cart-button";

type QuickViewProduct = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "categorySlug"
  | "subcategorySlug"
  | "basePrice"
  | "salePrice"
  | "primaryImage"
  | "images"
  | "imageDetails"
  | "fabric"
  | "includedPieces"
  | "ageRecommendation"
  | "inStock"
  | "stockQuantity"
  | "variants"
>;

export type QuickViewTriggerProduct = Pick<
  Product,
  "id" | "name" | "slug" | "basePrice" | "salePrice" | "primaryImage" | "inStock"
>;

function imageLabel(_: ProductImage, index: number) {
  return `View ${index + 1}`;
}

function galleryFor(product: QuickViewProduct): ProductImage[] {
  if (product.imageDetails?.length) return product.imageDetails;
  return product.images.map((url, index) => ({
    url,
    altText: index === 0 ? `${product.name} front view` : `${product.name} detail ${index + 1}`,
    displayOrder: index,
    isPrimary: index === 0
  }));
}

function compareSize(left: string, right: string) {
  const leftAge = left.match(/^(\d+)-(\d+)y$/i);
  const rightAge = right.match(/^(\d+)-(\d+)y$/i);
  if (leftAge && rightAge) return Number(leftAge[1]) - Number(rightAge[1]) || Number(leftAge[2]) - Number(rightAge[2]);
  return left.localeCompare(right, undefined, { numeric: true });
}

function sizeOptionsFor(variants: ProductVariant[]) {
  const bySize = new Map<string, ProductVariant>();
  for (const variant of variants) {
    if (variant.stockQuantity > 0 && !bySize.has(variant.size)) bySize.set(variant.size, variant);
  }
  return [...bySize.values()].sort((left, right) => compareSize(left.size, right.size));
}

export function ProductQuickView({ product }: { product: QuickViewTriggerProduct }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<QuickViewProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | number>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogId = `quick-view-${product.slug}`;
  const gallery = details ? galleryFor(details) : [];
  const sizeOptions = details ? sizeOptionsFor(details.variants) : [];
  const activeImage = gallery[activeImageIndex] || gallery[0];
  const selectedVariant = sizeOptions.find((variant) => String(variant.id) === String(selectedVariantId));

  const openQuickView = useCallback(() => {
    setOpen(true);
    if (details || isLoading) return;

    setIsLoading(true);
    setLoadError(null);
    void fetch(`/api/products/${encodeURIComponent(product.slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("We couldn't load this style right now.");
        return response.json() as Promise<QuickViewProduct>;
      })
      .then(setDetails)
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "We couldn't load this style right now.");
      })
      .finally(() => setIsLoading(false));
  }, [details, isLoading, product.slug]);
  const closeQuickView = useCallback(() => setOpen(false), []);
  const handleVariantSelection = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    setSelectedVariantId(event.currentTarget.value);
  }, []);
  const handleImageSelection = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    setActiveImageIndex(Number(event.currentTarget.value));
  }, []);
  const handleBackdropMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeQuickView();
  }, [closeQuickView]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeQuickView();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      trigger?.focus();
    };
  }, [closeQuickView, open]);

  useEffect(() => {
    if (!open) return;
    setSelectedVariantId(undefined);
    setActiveImageIndex(0);
  }, [open, product.slug]);

  const activeImageUrl = activeImage?.url || product.primaryImage;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="focus-ring absolute bottom-3 left-3 z-10 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-maroon shadow-sm transition hover:bg-white"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={openQuickView}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Quick view
      </button>

      {open ? createPortal(
        <div
          className="fixed inset-0 z-[120] overflow-y-auto bg-charcoal/80 p-3 backdrop-blur-sm sm:p-8"
          role="presentation"
          onMouseDown={handleBackdropMouseDown}
        >
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="mx-auto flex h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-y-auto bg-white shadow-2xl sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)] sm:grid sm:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.92fr)] sm:overflow-hidden"
          >
            <div className="relative min-h-[22rem] bg-[#21160e] sm:min-h-0">
              <Image
                src={activeImageUrl}
                alt={activeImage?.altText || product.name}
                fill
                unoptimized={activeImageUrl.startsWith("/images/") || activeImageUrl.startsWith("https://cdn.amzira.com/")}
                sizes="(max-width: 640px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent px-5 pb-5 pt-16">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">The AMZIRA edit</p>
                {gallery.length > 1 ? (
                  <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Product views">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        value={index}
                        onClick={handleImageSelection}
                        aria-pressed={activeImageIndex === index}
                        aria-label={`View product image ${index + 1}`}
                        className={`focus-ring shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${activeImageIndex === index ? "border-white bg-white text-charcoal" : "border-white/55 bg-black/20 text-white hover:border-white"}`}
                      >
                        {imageLabel(image, index)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-charcoal/10 pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep">AMZIRA quick view</p>
                  <h2 id={`${dialogId}-title`} className="mt-2 max-w-xl font-display text-3xl font-semibold leading-tight text-maroon-deep">{product.name}</h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-charcoal/20 text-charcoal hover:border-maroon hover:text-maroon"
                  aria-label="Close quick view"
                  onClick={closeQuickView}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-6 pr-2">
                {isLoading ? <p className="text-sm leading-7 text-charcoal/70">Loading style details…</p> : null}
                {loadError ? <p className="text-sm leading-7 text-maroon">{loadError}</p> : null}
                {details ? <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl font-bold text-maroon">{formatMoney(details.salePrice + (selectedVariant?.additionalPrice || 0))}</span>
                    {details.basePrice > details.salePrice ? <span className="text-sm text-charcoal/60 line-through">{formatMoney(details.basePrice)}</span> : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${details.inStock ? "bg-emerald/10 text-emerald" : "bg-maroon/10 text-maroon"}`}>
                    {details.inStock ? "In stock" : "Sold out"}
                  </span>
                </div>
                {details.description ? <p className="text-sm leading-7 text-charcoal/70">{details.description}</p> : null}

                {sizeOptions.length ? (
                  <section className="border-y border-charcoal/10 py-5" aria-labelledby={`${dialogId}-sizes`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p id={`${dialogId}-sizes`} className="text-xs font-bold uppercase tracking-[0.14em] text-charcoal/75">Select age / size</p>
                        <p className="mt-1 text-xs text-charcoal/55">{selectedVariant ? `${selectedVariant.size} selected · ${selectedVariant.stockQuantity} ready to ship` : "Choose a size to add this style to bag."}</p>
                      </div>
                      <Ruler className="h-5 w-5 text-gold-deep" aria-hidden="true" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sizeOptions.map((variant) => {
                        const selected = String(selectedVariantId) === String(variant.id);
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            value={variant.id}
                            onClick={handleVariantSelection}
                            aria-pressed={selected}
                            className={`focus-ring min-w-14 rounded-full border px-3 py-2 text-xs font-bold transition ${selected ? "border-maroon bg-maroon text-white shadow-sm" : "border-charcoal/15 bg-ivory text-charcoal hover:border-maroon hover:text-maroon"}`}
                          >
                            {variant.size}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  {details.fabric ? <div><dt className="text-charcoal/55">Fabric</dt><dd className="mt-1 font-semibold text-charcoal">{details.fabric}</dd></div> : null}
                  {details.ageRecommendation ? <div><dt className="text-charcoal/55">Recommended age</dt><dd className="mt-1 font-semibold text-charcoal">{details.ageRecommendation}</dd></div> : null}
                  {details.includedPieces?.length ? <div><dt className="text-charcoal/55">Set includes</dt><dd className="mt-1 font-semibold text-charcoal">{details.includedPieces.join(", ")}</dd></div> : null}
                  <div><dt className="text-charcoal/55">Availability</dt><dd className="mt-1 font-semibold text-charcoal">{details.inStock ? `${details.stockQuantity ?? "Available"} pieces in stock` : "Currently sold out"}</dd></div>
                </dl>
                </> : null}
              </div>

              <div className="mt-auto grid gap-3 border-t border-charcoal/10 pt-5">
                {details ? <AddToCartButton product={details} variantId={selectedVariantId} requireVariantSelection className="w-full py-3" /> : null}
                <Link href={`/product/${product.slug}`} className="focus-ring inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-maroon hover:text-maroon-deep" onClick={closeQuickView}>
                  View fit, measurements &amp; details
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
