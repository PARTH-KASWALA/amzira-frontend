import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.amzira.com";
  const [categories, products] = await Promise.all([getCategories(), getProducts({ limit: 100 })]);
  const staticPaths = [
    "/",
    "/cart",
    "/checkout",
    "/account",
    "/login",
    "/signup",
    "/forgot-password",
    "/contact-support",
    "/appointments",
    "/stores",
    "/faqs",
    "/shipping-policy",
    "/returns-refund-policy",
    "/privacy-policy",
    "/terms-and-conditions"
  ];

  return [
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...categories.map((category) => ({ url: `${siteUrl}/category/${category.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.85 })),
    ...products.map((product) => ({ url: `${siteUrl}/product/${product.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 }))
  ];
}
