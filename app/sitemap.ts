import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { siteOrigin } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteOrigin();
  // getProducts() follows backend pagination so every live product is covered.
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const staticPaths = [
    "/",
    "/contact-support",
    "/appointments",
    "/stores",
    "/faqs",
    "/shipping-policy",
    "/returns-refund-policy",
    "/privacy-policy",
    "/terms-and-conditions",
    "/order-tracking"
  ];

  return [
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...categories.map((category) => ({ url: `${siteUrl}/category/${category.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.85 })),
    ...products.map((product) => ({ url: `${siteUrl}/product/${product.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 }))
  ];
}
