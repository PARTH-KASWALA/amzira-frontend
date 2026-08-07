import {
  Category,
  Product,
  ProductVariant,
  fallbackCategories,
  fallbackProducts,
  findFallbackCategory,
  findFallbackProduct
} from "@/lib/catalog";

type Envelope<T> = { success?: boolean; data?: T; message?: string };
type BackendRecord = Record<string, unknown>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function isRecord(value: unknown): value is BackendRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function record(value: unknown): BackendRecord {
  return isRecord(value) ? value : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function assetUrl(url: string | null | undefined) {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  const apiOrigin = API_BASE.replace(/\/api\/v1\/?$/, "");
  if (url.startsWith("/")) return `${apiOrigin}${url}`;
  return url;
}

function toProduct(input: unknown): Product | null {
  if (!isRecord(input)) return null;
  const category = record(input.category);
  const images = Array.isArray(input.images)
    ? input.images.map((image) => {
        const imageRecord = record(image);
        return assetUrl(text(imageRecord.image_url || imageRecord.url || image));
      }).filter(Boolean)
    : [];
  const variants: ProductVariant[] = Array.isArray(input.variants)
    ? input.variants.map((variant) => {
        const variantRecord = record(variant);
        return {
        id: text(variantRecord.id || variantRecord.variant_id || variantRecord.sku, "variant"),
        size: text(variantRecord.size, "Free"),
        color: text(variantRecord.color) || null,
        sku: text(variantRecord.sku) || undefined,
        stockQuantity: number(variantRecord.stock_quantity ?? variantRecord.stockQuantity),
        additionalPrice: number(variantRecord.additional_price)
      };
      })
    : isRecord(input.default_variant)
      ? [
          {
            id: text(input.default_variant.variant_id, "default"),
            size: text(input.default_variant.size, "Free"),
            color: text(input.default_variant.color) || null,
            stockQuantity: number(input.default_variant.stock_quantity)
          }
        ]
      : [];
  const categorySlug = text(category.slug || input.category_slug || input.category, "women");
  const categoryName = text(category.name || input.category_name, categorySlug);
  const salePrice = number(input.sale_price ?? input.salePrice ?? input.price ?? input.base_price);
  const basePrice = number(input.base_price ?? input.basePrice, salePrice);
  const primaryImage = assetUrl(text(input.primary_image || input.image_url || images[0])) || fallbackProducts[0].primaryImage;
  const occasions = Array.isArray(input.occasions)
    ? input.occasions
        .map((occasion) => {
          const occasionRecord = record(occasion);
          return text(occasionRecord.name || occasion);
        })
        .filter(Boolean)
    : [];

  return {
    id: text(input.id, "product"),
    name: text(input.name, "Amzira outfit"),
    slug: text(input.slug || input.id, "amzira-outfit"),
    description: text(input.description || input.meta_description),
    categorySlug,
    categoryName,
    basePrice,
    salePrice,
    discountPercentage:
      number(input.discount_percentage) ||
      (basePrice > salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0),
    primaryImage,
    images: images.length ? images : [primaryImage],
    fabric: text(input.fabric) || null,
    careInstructions: text(input.care_instructions) || null,
    occasions,
    variants,
    avgRating: number(input.avg_rating || input.rating),
    reviewCount: number(input.review_count || input.reviews),
    inStock:
      input.in_stock !== false &&
      input.inStock !== false &&
      (variants.length === 0 || variants.some((variant) => variant.stockQuantity > 0)),
    badge: text(input.badge) || (input.is_featured ? "Featured" : null),
    metaTitle: text(input.meta_title) || null,
    metaDescription: text(input.meta_description) || null
  };
}

function toCategory(input: unknown): Category | null {
  if (!isRecord(input)) return null;
  const slug = text(input.slug || input.name).toLowerCase();
  if (!slug) return null;
  return {
    id: text(input.id, slug),
    name: text(input.name, slug),
    slug,
    description: text(input.description),
    imageUrl: assetUrl(text(input.image_url || input.imageUrl)) || fallbackCategories[0].imageUrl,
    parentId: typeof input.parent_id === "number" ? input.parent_id : null,
    displayOrder: number(input.display_order ?? input.displayOrder, 999)
  };
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Envelope<T> | T;
    return (payload as Envelope<T>).data ?? (payload as T);
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiGet<unknown[]>("/categories");
  const categories = Array.isArray(data) ? data.map(toCategory).filter(Boolean) : [];
  return categories.length
    ? (categories as Category[]).sort((a, b) => a.displayOrder - b.displayOrder)
    : fallbackCategories;
}

export async function getProducts(params: Record<string, string | number | boolean | undefined> = {}): Promise<Product[]> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const data = await apiGet<unknown>(`/products${suffix}`);
  const dataRecord = record(data);
  const list = Array.isArray(data) ? data : Array.isArray(dataRecord.products) ? dataRecord.products : [];
  const products = list.map(toProduct).filter(Boolean) as Product[];
  if (products.length) return products;
  if (params.category) return fallbackProducts.filter((product) => product.categorySlug === params.category);
  return fallbackProducts;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) || findFallbackCategory(slug);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await apiGet<unknown>(`/products/${encodeURIComponent(slug)}`);
  return toProduct(data) || findFallbackProduct(slug);
}

export async function getFeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 8 });
  return products.length ? products : fallbackProducts.slice(0, 6);
}
