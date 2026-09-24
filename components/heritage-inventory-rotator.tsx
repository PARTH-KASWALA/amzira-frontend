"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";

type HeritageInventoryRotatorProps = {
  products: Product[];
  intervalMs?: number;
};

const DEFAULT_ROTATION_MS = 5000;
const MOBILE_ROTATION_MS = 3000;
const MOBILE_VISIBLE_PRODUCT_COUNT = 3;

function shuffleProducts(products: Product[]) {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentProduct = shuffled[index]!;
    shuffled[index] = shuffled[randomIndex]!;
    shuffled[randomIndex] = currentProduct;
  }

  return shuffled;
}

function chooseMobileProducts(products: Product[], previous: Product[]) {
  const count = Math.min(products.length, MOBILE_VISIBLE_PRODUCT_COUNT);

  if (count < 2) {
    return products.slice(0, count);
  }

  const next = shuffleProducts(products).slice(0, count);
  const previousSlugs = new Set(previous.map((product) => product.slug));
  const sameSelection = next.length === previous.length && next.every((product) => previousSlugs.has(product.slug));

  if (!sameSelection) {
    return next;
  }

  if (products.length > count) {
    const replacement = shuffleProducts(products.filter((product) => !previousSlugs.has(product.slug)))[0];

    if (replacement) {
      next[count - 1] = replacement;
    }

    return next;
  }

  return [...next.slice(1), next[0]!];
}

export function HeritageInventoryRotator({
  products,
  intervalMs = DEFAULT_ROTATION_MS
}: HeritageInventoryRotatorProps) {
  const inventory = useMemo(
    () => products.filter((product) => product.inStock !== false && product.primaryImage),
    [products]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileProducts, setMobileProducts] = useState(() => inventory.slice(0, MOBILE_VISIBLE_PRODUCT_COUNT));
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [inventory.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (isMobileViewport || inventory.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % inventory.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, inventory.length, isMobileViewport]);

  useEffect(() => {
    if (!isMobileViewport || inventory.length < 2) return;

    setMobileProducts((current) => chooseMobileProducts(inventory, current));

    const timer = window.setInterval(() => {
      setMobileProducts((current) => chooseMobileProducts(inventory, current));
    }, MOBILE_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [inventory, isMobileViewport]);

  const activeProduct = inventory[activeIndex];

  if (!activeProduct) {
    return null;
  }

  return (
    <>
      <Link
        href={`/product/${activeProduct.slug}`}
        className="heritage-inventory-outfit heritage-inventory-outfit--desktop group relative overflow-hidden rounded-md border border-gold/40 shadow-sari focus-ring"
        aria-label={`View ${activeProduct.name}`}
      >
        <Image
          key={activeProduct.slug}
          src={activeProduct.primaryImage}
          alt={activeProduct.name}
          fill
          unoptimized={activeProduct.primaryImage.startsWith("/images/") || activeProduct.primaryImage.startsWith("https://cdn.amzira.com/")}
          sizes="(min-width: 1024px) 16vw, 34vw"
          className="heritage-inventory-outfit-image object-contain"
        />
        <span className="heritage-inventory-count absolute left-3 top-3 rounded-full border border-gold/45 bg-white/88 px-2.5 py-1 text-[10px] font-bold text-maroon">
          {String(activeIndex + 1).padStart(2, "0")} / {String(inventory.length).padStart(2, "0")}
        </span>
        <span className="sr-only" aria-live="polite">
          Showing {activeProduct.name}
        </span>
      </Link>

      <div className="heritage-inventory-mobile-grid" role="group" aria-label="Featured heritage looks">
        {mobileProducts.map((product) => (
          <Link
            key={product.slug}
            href={`/product/${product.slug}`}
            className="heritage-inventory-mobile-item group focus-ring"
          >
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              unoptimized={product.primaryImage.startsWith("/images/") || product.primaryImage.startsWith("https://cdn.amzira.com/")}
              sizes="30vw"
              className="heritage-inventory-outfit-image object-contain"
            />
          </Link>
        ))}
      </div>
    </>
  );
}
