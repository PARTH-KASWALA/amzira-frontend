"use client";

import dynamic from "next/dynamic";
import type { QuickViewTriggerProduct } from "@/components/product-quick-view";

const ProductQuickView = dynamic(
  () => import("@/components/product-quick-view").then((module) => module.ProductQuickView),
  { ssr: false, loading: () => null }
);

export function ProductQuickViewLoader({ product }: { product: QuickViewTriggerProduct }) {
  return <ProductQuickView product={product} />;
}
