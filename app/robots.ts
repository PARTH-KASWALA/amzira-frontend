import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/format";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/account",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/order-success",
        "/payment-failure",
        "/order-tracking",
        "/search"
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
