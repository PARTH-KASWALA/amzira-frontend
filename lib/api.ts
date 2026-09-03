import {
  CatalogSubcategory,
  Category,
  ProductImage,
  Product,
  ProductVariant,
  fallbackCategories,
  fallbackProducts,
  findFallbackCategory,
  findFallbackProduct
} from "@/lib/catalog";
import { API_BASE_URL, CATALOG_FALLBACK_ENABLED } from "@/lib/api/config";
import {
  apiCategorySlug,
  categorySubcategorySlugs,
  isLiveCategory,
  LIVE_CATEGORY_SLUG,
  publicCategorySlug
} from "@/lib/storefront";

type Envelope<T> = { success?: boolean; data?: T; message?: string };
type BackendRecord = Record<string, unknown>;

const API_BASE = API_BASE_URL;

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

function boolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function identifier(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function assetUrl(url: string | null | undefined) {
  if (!url) return "";
  const catalogUpload = url.match(/\/static\/uploads\/products\/catalog\/(.+)$/);
  if (catalogUpload) return `/images/catalog/${catalogUpload[1]}`;
  if (/^https?:\/\//.test(url)) return url;
  const apiOrigin = API_BASE.replace(/\/api\/v1\/?$/, "");
  if (url.startsWith("/")) return `${apiOrigin}${url}`;
  return url;
}

function isFrontView(image: ProductImage) {
  const label = `${image.altText || ""} ${image.url}`.toLowerCase();
  return /(?:^|[^a-z])front(?:[^a-z]|$)/.test(label);
}

function preferredImage(images: ProductImage[]) {
  return [...images].sort(
    (left, right) =>
      Number(!isFrontView(left)) - Number(!isFrontView(right)) ||
      Number(!left.isPrimary) - Number(!right.isPrimary) ||
      left.displayOrder - right.displayOrder
  )[0];
}

function toProduct(input: unknown): Product | null {
  if (!isRecord(input)) return null;
  const category = record(input.category);
  const subcategory = record(input.subcategory);
  const imageDetails: ProductImage[] = Array.isArray(input.images)
    ? input.images.map<ProductImage | null>((image, index) => {
        const imageRecord = record(image);
        const url = assetUrl(text(imageRecord.image_url || imageRecord.url || image));
        return url
          ? {
              url,
              altText: text(imageRecord.alt_text || imageRecord.altText || imageRecord.alt) || null,
              displayOrder: number(imageRecord.display_order ?? imageRecord.displayOrder, index),
              isPrimary: boolean(imageRecord.is_primary ?? imageRecord.isPrimary)
            }
          : null;
      }).filter((image): image is ProductImage => image !== null)
        .sort((left, right) => left.displayOrder - right.displayOrder)
    : [];
  const images = imageDetails.map((image) => image.url);
  const variants: ProductVariant[] = Array.isArray(input.variants)
    ? input.variants.map((variant) => {
        const variantRecord = record(variant);
        return {
        id: identifier(variantRecord.id || variantRecord.variant_id || variantRecord.sku, "variant"),
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
            id: identifier(input.default_variant.variant_id, "default"),
            size: text(input.default_variant.size, "Free"),
            color: text(input.default_variant.color) || null,
            stockQuantity: number(input.default_variant.stock_quantity)
          }
        ]
      : [];
  const backendCategorySlug = text(category.slug || input.category_slug || input.category, LIVE_CATEGORY_SLUG);
  const categorySlug = publicCategorySlug(backendCategorySlug);
  const categoryName = text(category.name || input.category_name, categorySlug);
  const salePrice = number(input.sale_price ?? input.salePrice ?? input.price ?? input.base_price);
  const basePrice = number(input.base_price ?? input.basePrice, salePrice);
  const primaryImage =
    assetUrl(
      text(preferredImage(imageDetails)?.url || input.primary_image || input.image_url || images[0])
    ) || fallbackProducts[0].primaryImage;
  const occasions = Array.isArray(input.occasions)
    ? input.occasions
        .map((occasion) => {
          const occasionRecord = record(occasion);
          return text(occasionRecord.name || occasion);
        })
        .filter(Boolean)
    : [];

  return {
    id: identifier(input.id, "product"),
    name: text(input.name, "Amzira outfit"),
    slug: text(input.slug || input.id, "amzira-outfit"),
    description: text(input.description || input.meta_description),
    categorySlug,
    categoryName,
    subcategorySlug: text(subcategory.slug) || null,
    subcategoryName: text(subcategory.name) || null,
    basePrice,
    salePrice,
    discountPercentage:
      number(input.discount_percentage) ||
      (basePrice > salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0),
    primaryImage,
    images: images.length ? images : [primaryImage],
    imageDetails: imageDetails.length ? imageDetails : undefined,
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
  const backendSlug = text(input.slug || input.name).toLowerCase();
  const slug = publicCategorySlug(backendSlug);
  if (!slug) return null;
  const fallbackCategory = fallbackCategories.find((category) => category.slug === slug);
  return {
    id: identifier(input.id, slug),
    name: text(input.name, slug),
    slug,
    description: text(input.description, fallbackCategory?.description || `Explore ${text(input.name, "AMZIRA")} styles for every celebration.`),
    imageUrl: assetUrl(text(input.image_url || input.imageUrl)) || fallbackCategories[0].imageUrl,
    parentId: typeof input.parent_id === "number" ? input.parent_id : null,
    displayOrder: number(input.display_order ?? input.displayOrder, 999)
  };
}

function productList(input: unknown): Product[] {
  const inputRecord = record(input);
  const list = Array.isArray(input)
    ? input
    : Array.isArray(inputRecord.products)
      ? inputRecord.products
      : [];

  return list.map(toProduct).filter(Boolean) as Product[];
}

function productPayload(input: unknown) {
  const inputRecord = record(input);
  return inputRecord.product ?? input;
}

function hasProductDetailPayload(input: unknown) {
  const product = productPayload(input);
  return isRecord(product) && Array.isArray(product.images) && Array.isArray(product.variants);
}

function productDetail(input: unknown): Product | null {
  return toProduct(productPayload(input));
}

function normalizeFilterValue(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function numericFilterValue(value: unknown) {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function productMatchesFilters(product: Product, params: Record<string, string | number | boolean | undefined>) {
  const subcategory = normalizeFilterValue(params.subcategory);
  const search = normalizeFilterValue(params.search);
  const occasion = normalizeFilterValue(params.occasion);
  const minPrice = numericFilterValue(params.min_price);
  const maxPrice = numericFilterValue(params.max_price);

  if (subcategory && product.subcategorySlug !== subcategory) return false;
  if (occasion && !product.occasions.some((item) => normalizeFilterValue(item) === occasion)) return false;
  if (minPrice !== null && product.salePrice < minPrice) return false;
  if (maxPrice !== null && product.salePrice > maxPrice) return false;
  if (!search) return true;

  const searchableText = [
    product.name,
    product.description,
    product.categoryName,
    product.subcategoryName,
    product.fabric,
    ...product.occasions
  ].filter(Boolean).join(" ").toLowerCase();

  return searchableText.includes(search);
}

function sortProducts(products: Product[], sortBy: unknown) {
  switch (sortBy) {
    case "price_asc":
      return [...products].sort((a, b) => a.salePrice - b.salePrice);
    case "price_desc":
      return [...products].sort((a, b) => b.salePrice - a.salePrice);
    case "popular":
      return [...products].sort((a, b) => (b.reviewCount + b.avgRating) - (a.reviewCount + a.avgRating));
    default:
      return products;
  }
}

function applyProductFilters(products: Product[], params: Record<string, string | number | boolean | undefined>) {
  const categorySubcategories = categorySubcategorySlugs(String(params.category || ""));
  const categoryFilteredProducts = categorySubcategories.length
    ? products.filter((product) => product.subcategorySlug && categorySubcategories.includes(product.subcategorySlug))
    : products;

  return sortProducts(categoryFilteredProducts.filter((product) => productMatchesFilters(product, params)), params.sort_by);
}

async function apiGet<T>(path: string, { fresh = false }: { fresh?: boolean } = {}): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
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
  const publicCategories = (categories as Category[]).filter((category) => isLiveCategory(category.slug));
  return publicCategories.length
    ? publicCategories.sort((a, b) => a.displayOrder - b.displayOrder)
    : CATALOG_FALLBACK_ENABLED
      ? fallbackCategories.filter((category) => isLiveCategory(category.slug))
      : [];
}

export async function getProducts(params: Record<string, string | number | boolean | undefined> = {}): Promise<Product[]> {
  const search = new URLSearchParams();
  const categorySubcategories = categorySubcategorySlugs(String(params.category || ""));
  const shouldFilterClientSide = Boolean(
    params.category &&
    (categorySubcategories.length ||
      params.subcategory ||
      params.search ||
      params.occasion ||
      params.min_price ||
      params.max_price ||
      params.sort_by)
  );
  if (params.limit === undefined) search.set("limit", "100");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      if (shouldFilterClientSide && ["subcategory", "search", "occasion", "min_price", "max_price", "sort_by"].includes(key)) {
        return;
      }
      search.set(key, key === "category" ? apiCategorySlug(String(value)) : String(value));
    }
  });
  const suffix = search.toString() ? `?${search.toString()}` : "";
  // Filtered catalog pages must see inventory/category imports immediately.
  // Keeping the unfiltered homepage/search payload on a short ISR window is
  // fine, but caching a filtered empty result can hide newly imported stock.
  const firstPage = await apiGet<unknown>(`/products${suffix}`, { fresh: shouldFilterClientSide });
  const firstPageRecord = record(firstPage);
  const pages = [firstPage];
  const totalPages = number(firstPageRecord.total_pages, 1);
  if (params.limit === undefined && params.page === undefined && totalPages > 1) {
    for (let page = 2; page <= totalPages; page += 1) {
      const nextSearch = new URLSearchParams(search);
      nextSearch.set("page", String(page));
      pages.push(await apiGet<unknown>(`/products?${nextSearch.toString()}`, { fresh: shouldFilterClientSide }));
    }
  }
  const products = pages.flatMap(productList).filter((product) =>
    isLiveCategory(product.categorySlug)
  );
  if (products.length) {
    const uniqueProducts = [...new Map(products.map((product) => [product.slug, product])).values()];
    return shouldFilterClientSide ? applyProductFilters(uniqueProducts, params) : uniqueProducts;
  }
  if (!CATALOG_FALLBACK_ENABLED) return [];
  if (params.category && !isLiveCategory(String(params.category))) return [];
  const fallbackCatalog = fallbackProducts.filter((product) => isLiveCategory(product.categorySlug));
  return shouldFilterClientSide ? applyProductFilters(fallbackCatalog, params) : fallbackCatalog;
}

export async function getSubcategories(categorySlug: string): Promise<CatalogSubcategory[]> {
  if (!isLiveCategory(categorySlug)) return [];
  const data = await apiGet<unknown[]>("/categories?include_children=true");
  if (!Array.isArray(data)) return [];

  const backendSlug = apiCategorySlug(categorySlug);
  const roots = data.map(record);
  const root = roots.find((item) => text(item.slug) === backendSlug);
  let nodes: BackendRecord[] = [];

  if (root) {
    nodes = Array.isArray(root.children)
      ? root.children.flatMap((child) => {
          const childRecord = record(child);
          return Array.isArray(childRecord.children) ? childRecord.children.map(record) : [];
        })
      : [];
  } else {
    for (const candidate of roots) {
      const children = Array.isArray(candidate.children) ? candidate.children.map(record) : [];
      const category = children.find((child) => text(child.slug) === backendSlug);
      if (category) {
        nodes = Array.isArray(category.children) ? category.children.map(record) : [];
        break;
      }
    }
  }

  return nodes.map((item) => ({
    id: identifier(item.id, text(item.slug, "subcategory")),
    name: text(item.name, "Collection"),
    slug: text(item.slug),
    productCount: number(item.product_count)
  })).filter((item) => item.slug && item.productCount > 0);
}

export async function getCategory(slug: string): Promise<Category | null> {
  if (!isLiveCategory(slug)) return null;
  const categories = await getCategories();
  return categories.find((category) => category.slug === publicCategorySlug(slug)) ||
    (CATALOG_FALLBACK_ENABLED ? findFallbackCategory(publicCategorySlug(slug)) : null);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await apiGet<unknown>(`/products/${encodeURIComponent(slug)}`, { fresh: true });
  const directProduct = productDetail(data);
  if (
    hasProductDetailPayload(data) &&
    directProduct &&
    directProduct.slug === slug &&
    isLiveCategory(directProduct.categorySlug)
  ) {
    return directProduct;
  }

  // Some catalog deployments expose slugs in category lists but accept only
  // numeric IDs on the detail endpoint. Reuse the exact live-category source.
  const liveCategory = encodeURIComponent(apiCategorySlug(LIVE_CATEGORY_SLUG));
  const [categoryData, featuredData, catalogData] = await Promise.all([
    apiGet<unknown>(`/products?limit=100&category=${liveCategory}`),
    apiGet<unknown>("/products?featured=true&limit=100"),
    apiGet<unknown>("/products?limit=100")
  ]);
  const listedProduct = [...productList(categoryData), ...productList(featuredData), ...productList(catalogData)]
    .find((product) => product.slug === slug);

  if (listedProduct && String(listedProduct.id) !== "product") {
    const idData = await apiGet<unknown>(`/products/${encodeURIComponent(String(listedProduct.id))}`, { fresh: true });
    const idProduct = productDetail(idData);
    if (
      hasProductDetailPayload(idData) &&
      idProduct &&
      idProduct.slug === slug &&
      isLiveCategory(idProduct.categorySlug)
    ) {
      return idProduct;
    }
  }

  // A list response only contains primary_image/default_variant and is not enough
  // to render a PDP. Never downgrade a product page to that partial shape.
  const product = CATALOG_FALLBACK_ENABLED ? findFallbackProduct(slug) : null;
  return product && isLiveCategory(product.categorySlug) ? product : null;
}

function recommendationText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function recommendationScore(source: Product, candidate: Product) {
  if (source.slug === candidate.slug || !candidate.inStock) return Number.NEGATIVE_INFINITY;

  let score = 0;
  if (source.categorySlug === candidate.categorySlug) score += 6;
  if (source.subcategorySlug && source.subcategorySlug === candidate.subcategorySlug) score += 8;

  const sourceOccasions = new Set(source.occasions.map(recommendationText));
  const sharedOccasions = candidate.occasions.filter((occasion) => sourceOccasions.has(recommendationText(occasion))).length;
  score += Math.min(sharedOccasions * 2, 6);

  if (source.fabric && candidate.fabric && recommendationText(source.fabric) === recommendationText(candidate.fabric)) score += 2;

  const highestPrice = Math.max(source.salePrice, candidate.salePrice);
  const lowestPrice = Math.min(source.salePrice, candidate.salePrice);
  if (highestPrice > 0) score += Math.round((lowestPrice / highestPrice) * 3);

  // Keep popular, well-reviewed pieces useful as tie-breakers without letting
  // popularity overpower an obvious style/category match.
  score += Math.min(candidate.avgRating, 5) * 0.4;
  score += Math.min(candidate.reviewCount, 100) / 100;
  return score;
}

/**
 * Return explainable, deterministic recommendations for a PDP. This is a
 * server-side content-based baseline: it uses catalog metadata only, avoids
 * tracking or personal data, and remains useful before enough events exist to
 * train a behavioral model.
 */
export async function getRecommendedProducts(source: Product, limit = 4): Promise<Product[]> {
  const sameCategory = await getProducts({ category: source.categorySlug, limit: 100 });
  const broadCatalog = sameCategory.length >= limit ? [] : await getProducts({ limit: 100 });
  const candidates = [...new Map([...sameCategory, ...broadCatalog].map((product) => [product.slug, product])).values()];

  return candidates
    .map((product) => ({ product, score: recommendationScore(source, product) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((left, right) =>
      right.score - left.score ||
      Number(right.product.inStock) - Number(left.product.inStock) ||
      right.product.reviewCount - left.product.reviewCount ||
      left.product.slug.localeCompare(right.product.slug)
    )
    .slice(0, Math.max(0, limit))
    .map(({ product }) => product);
}

export async function getFeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 8 });
  return products.length || !CATALOG_FALLBACK_ENABLED ? products : fallbackProducts.slice(0, 6);
}
