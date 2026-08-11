import type { Metadata } from "next";
import { Product } from "@/lib/catalog";
import { absoluteUrl, formatMoney } from "@/lib/format";

export const siteName = "AMZIRA";
export const defaultDescription =
  "Shop South Indian girls' lehenga choli and pattu pavadai with silk color, temple borders, and celebration-ready comfort at AMZIRA.";

export function buildMetadata({
  title,
  description = defaultDescription,
  path = "/",
  image = "/images/hero/hero-3.webp"
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  return {
    title: fullTitle,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.amzira.com"),
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: fullTitle }],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(image)]
    }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo/amzira_logo.webp"),
    sameAs: []
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map(absoluteUrl),
    description: product.description,
    sku: String(product.id),
    brand: { "@type": "Brand", name: siteName },
    category: product.categoryName,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avgRating || 4.8,
            reviewCount: product.reviewCount
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "INR",
      price: product.salePrice,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: siteName },
      description: `${formatMoney(product.salePrice)} with secure checkout, delivery estimate, and easy returns.`
    }
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}
