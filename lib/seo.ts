import type { Metadata } from "next";
import { Product } from "@/lib/catalog";
import { absoluteUrl, formatMoney, siteOrigin } from "@/lib/format";

export const siteName = "AMZIRA";
export const defaultDescription =
  "Shop South Indian girls' lehenga choli and pattu pavadai with silk color, temple borders, and celebration-ready comfort at AMZIRA.";

export function buildMetadata({
  title,
  description = defaultDescription,
  path = "/",
  image = "/images/hero/hero-3.webp",
  noIndex = false
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteOrigin()),
    alternates: { canonical: absoluteUrl(path) },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
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
  const returnPolicy = product.isReturnEligible === null || product.isReturnEligible === undefined
    ? undefined
    : {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: product.isReturnEligible
          ? "https://schema.org/MerchantReturnFiniteReturnWindow"
          : "https://schema.org/MerchantReturnNotPermitted",
        ...(product.isReturnEligible && product.returnWindowHours
          ? { merchantReturnDays: Math.ceil(product.returnWindowHours / 24) }
          : {})
      };
  const shippingDetails = product.shippingRate === null || product.shippingRate === undefined
    ? undefined
    : {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        shippingRate: { "@type": "MonetaryAmount", value: product.shippingRate, currency: "INR" }
      };
  const offerFor = (sku: string, available: boolean) => ({
    "@type": "Offer",
    url: absoluteUrl(`/product/${product.slug}`),
    priceCurrency: "INR",
    price: product.salePrice,
    availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: siteName },
    sku,
    shippingDetails,
    hasMerchantReturnPolicy: returnPolicy,
    description: `${formatMoney(product.salePrice)} with product-specific size, delivery, and policy details before ordering.`
  });
  const variants = product.variants.map((variant) => ({
    "@type": "Product",
    name: `${product.name} – ${variant.size}`,
    sku: variant.sku || `${product.id}-${variant.id}`,
    size: variant.size,
    color: variant.color || undefined,
    image: product.images.map(absoluteUrl),
    offers: offerFor(variant.sku || `${product.id}-${variant.id}`, variant.stockQuantity > 0),
  }));

  return {
    "@context": "https://schema.org",
    "@type": product.variants.length ? "ProductGroup" : "Product",
    name: product.name,
    image: product.images.map(absoluteUrl),
    description: product.description,
    sku: String(product.id),
    brand: { "@type": "Brand", name: siteName },
    category: product.categoryName,
    aggregateRating:
      product.reviewCount > 0 && product.avgRating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount
          }
        : undefined,
    offers: offerFor(String(product.id), product.inStock),
    ...(variants.length
      ? {
          productGroupID: String(product.id),
          variesBy: ["https://schema.org/size", "https://schema.org/color"],
          hasVariant: variants
        }
      : {})
  };
}

export function collectionJsonLd({
  name,
  description,
  path,
  products
}: {
  name: string;
  description: string;
  path: string;
  products: Product[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 50).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/product/${product.slug}`),
        name: product.name
      }))
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
