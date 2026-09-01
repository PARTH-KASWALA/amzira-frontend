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

export function HeritageInventoryRotator({
  products,
  intervalMs = DEFAULT_ROTATION_MS
}: HeritageInventoryRotatorProps) {
  const inventory = useMemo(
    () => products.filter((product) => product.inStock !== false && product.primaryImage),
    [products]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [inventory.length]);

  useEffect(() => {
    if (inventory.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % inventory.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, inventory.length]);

  const activeProduct = inventory[activeIndex];

  if (!activeProduct) {
    return null;
  }

  return (
    <Link
      href={`/product/${activeProduct.slug}`}
      className="heritage-inventory-outfit group relative overflow-hidden rounded-md border border-gold/40 shadow-sari focus-ring"
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
  );
}
