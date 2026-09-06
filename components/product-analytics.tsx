"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/catalog";
import { productAnalyticsPayload, trackCommerceEvent } from "@/lib/analytics";

export function ProductAnalytics({ product }: { product: Product }) {
  useEffect(() => {
    trackCommerceEvent("view_item", productAnalyticsPayload(product));
  }, [product]);

  return null;
}
