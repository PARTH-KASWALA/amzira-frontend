import type { Product } from "@/lib/catalog";

type CommerceProduct = Pick<
  Product,
  "id" | "slug" | "categorySlug" | "subcategorySlug" | "salePrice" | "inStock" | "stockQuantity"
>;

export type CommerceEventName =
  | "view_item"
  | "select_size"
  | "check_pincode"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "checkout_paused_view"
  | "sign_in_required"
  | "payment_started"
  | "payment_succeeded"
  | "payment_failed";

export type CommerceEventPayload = {
  product_id?: string;
  product_slug?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  currency?: "INR";
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
  selected_size?: string;
  item_count?: number;
  cart_total?: number;
  delivery_days_min?: number;
  delivery_days_max?: number;
  has_shipping_charge?: boolean;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function hasAnalyticsConsent() {
  return document.documentElement.dataset.analyticsConsent === "granted";
}

export function productAnalyticsPayload(product: CommerceProduct): CommerceEventPayload {
  const stockStatus = !product.inStock
    ? "out_of_stock"
    : product.stockQuantity !== undefined && product.stockQuantity <= 5
      ? "low_stock"
      : "in_stock";

  return {
    product_id: String(product.id),
    product_slug: product.slug,
    category: product.categorySlug,
    subcategory: product.subcategorySlug || undefined,
    price: product.salePrice,
    currency: "INR",
    stock_status: stockStatus
  };
}

export function trackCommerceEvent(event: CommerceEventName, payload: CommerceEventPayload = {}) {
  if (typeof window === "undefined") return;

  const detail = { event, ...payload };
  window.dispatchEvent(new CustomEvent("amzira-commerce-event", { detail }));

  // Third-party analytics must only receive commerce events after the site's
  // consent layer has explicitly enabled non-essential analytics.
  if (hasAnalyticsConsent()) {
    window.dataLayer?.push(detail);
  }
}
