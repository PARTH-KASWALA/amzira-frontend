import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api/config";
import { absoluteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CommerceStatus = { checkout_enabled?: boolean };

function tsv(value: string | number | null | undefined) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
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
    "mpn",
    "identifier_exists",
    "gender",
    "age_group",
    "color",
    "size"
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
      product.description,
      absoluteUrl(`/product/${product.slug}`),
      absoluteUrl(product.primaryImage),
      variant.stockQuantity > 0 ? "in_stock" : "out_of_stock",
      `${product.salePrice.toFixed(2)} INR`,
      "new",
      "AMZIRA",
      variant.sku || `${product.id}-${variant.id}`,
      "no",
      "female",
      "kids",
      variant.color || product.color || "",
      variant.size
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
