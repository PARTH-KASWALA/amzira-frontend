import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api/config";
import type { Product, ProductVariant } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CommerceStatus = { checkout_enabled?: boolean };

// Keep these values aligned with the backend commerce settings. The detail
// API supplies the product-specific rate for schema.org; list responses used
// by this feed do not, so the feed uses the published store-wide rule.
const FREE_SHIPPING_THRESHOLD = 2000;
const DEFAULT_SHIPPING_CHARGE = 100;
const merchantReturnPolicyLabel = process.env.MERCHANT_CENTER_RETURN_POLICY_LABEL?.trim();

function tsv(value: string | number | null | undefined) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
}

function variantPrice(product: Product, variant: ProductVariant) {
  return product.salePrice + (variant.additionalPrice || 0);
}

function productDescription(product: Product) {
  const description = product.description?.trim();
  return description || `${product.name}. Shop this AMZIRA South Indian occasionwear style online with current size, price, availability, shipping, and return details.`;
}

function shippingValue(price: number) {
  const shippingRate = price >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_CHARGE;
  return `IN::Standard:${shippingRate.toFixed(2)} INR:1:3:2:8`;
}

async function checkoutIsEnabled() {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/status`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return false;
    const payload = await response.json() as { data?: CommerceStatus } | CommerceStatus;
    const wrapped = payload as { data?: CommerceStatus };
    const status = wrapped.data || (payload as CommerceStatus);
    return status.checkout_enabled === true;
  } catch {
    return false;
  }
}

/**
 * Google Merchant Center scheduled-fetch feed. One row is emitted for every
 * product/size variant so availability and apparel sizing stay accurate.
 *
 * Merchant Center requires a working purchase flow. The feed therefore stays
 * unavailable while the storefront's checkout flag is off; enabling checkout
 * makes this endpoint immediately usable without another code release.
 */
export async function GET() {
  if (!(await checkoutIsEnabled())) {
    return NextResponse.json(
      {
        error: "Merchant feed is paused while AMZIRA checkout is unavailable.",
        help: "Enable checkout before adding this URL to Google Merchant Center."
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" }
      }
    );
  }

  const products = await getProducts();
  const header = [
    "id",
    "item_group_id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "condition",
    "brand",
    "identifier_exists",
    "google_product_category",
    "gender",
    "age_group",
    "color",
    "size",
    "shipping(country:region:service:price:min_handling_time:max_handling_time:min_transit_time:max_transit_time)",
    ...(merchantReturnPolicyLabel ? ["return_policy_label"] : [])
  ];
  const rows = products.flatMap((product) => {
    const variants = product.variants.length ? product.variants : [{
      id: product.id,
      sku: String(product.id),
      size: "",
      color: product.color || "",
      stockQuantity: product.inStock ? 1 : 0
    }];
    return variants.map((variant) => [
      variant.sku || `${product.id}-${variant.id}`,
      product.id,
      variant.size ? `${product.name} – ${variant.size}` : product.name,
      productDescription(product),
      absoluteUrl(`/product/${product.slug}`),
      absoluteUrl(product.primaryImage),
      variant.stockQuantity > 0 ? "in_stock" : "out_of_stock",
      `${variantPrice(product, variant).toFixed(2)} INR`,
      "new",
      "AMZIRA",
      "no",
      "Apparel & Accessories > Clothing > Dresses",
      "female",
      "kids",
      variant.color || product.color || "",
      variant.size,
      shippingValue(variantPrice(product, variant)),
      ...(merchantReturnPolicyLabel ? [merchantReturnPolicyLabel] : [])
    ].map(tsv).join("\t"));
  });

  return new NextResponse([header.join("\t"), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex"
    }
  });
}
