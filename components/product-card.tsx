import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product, ProductImage } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { AddToCartButton, type CartProduct } from "@/components/cart-button";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductQuickViewLoader } from "@/components/product-quick-view-loader";

function observedDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function isBackView(image: ProductImage) {
  return /(?:^|[^a-z])back(?:[^a-z]|$)/.test(`${image.altText || ""} ${image.url}`.toLowerCase());
}

function hoverImageFor(product: Product) {
  return product.imageDetails?.find((image) => image.url !== product.primaryImage && isBackView(image)) || null;
}

function quickViewProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    primaryImage: product.primaryImage,
    inStock: product.inStock
  };
}

function productCardCartItem(product: Product): CartProduct {
  const defaultVariant = product.variants.find((variant) => variant.stockQuantity > 0);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug,
    primaryImage: product.primaryImage,
    salePrice: product.salePrice,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    variants: defaultVariant ? [defaultVariant] : []
  };
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const hoverImage = hoverImageFor(product);
  const quickView = quickViewProduct(product);
  const cartItem = productCardCartItem(product);

  return (
    <article className="group rounded-md border border-charcoal/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-sari">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="focus-ring block rounded-t-md" aria-label={`View ${product.name}`}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-md bg-sandal">
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            unoptimized={product.primaryImage.startsWith("/images/") || product.primaryImage.startsWith("https://cdn.amzira.com/")}
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {hoverImage ? (
            <>
              <Image
                src={hoverImage.url}
                alt=""
                aria-hidden="true"
                fill
                unoptimized={hoverImage.url.startsWith("/images/") || hoverImage.url.startsWith("https://cdn.amzira.com/")}
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100 group-focus-within:opacity-100"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-charcoal/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                Back view
              </span>
            </>
          ) : null}
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon">
              {product.badge}
            </span>
          ) : null}
          </div>
        </Link>
        <ProductQuickViewLoader product={quickView} />
        <WishlistButton productId={product.id} productName={product.name} className="absolute right-3 top-3" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-maroon">
            {product.subcategoryName || product.categoryName}
          </p>
          {product.marketplaceSignal ? (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal/70">
              Marketplace sales signal{observedDate(product.marketplaceSignal.observedAt) ? ` · observed ${observedDate(product.marketplaceSignal.observedAt)}` : ""}
            </p>
          ) : null}
          <h3 className="mt-2 min-h-[3.2rem] font-display text-xl font-semibold leading-tight text-charcoal">
            <Link className="focus-ring rounded-sm hover:text-maroon" href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>
        {product.reviewCount > 0 ? (
          <div className="flex items-center gap-2 text-xs text-charcoal/65">
            <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
            <span>{product.avgRating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        ) : null}
        {product.inStock ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-charcoal/60">
            {product.availableSizeCount ? <span>{product.availableSizeCount} sizes available</span> : null}
            {product.stockQuantity !== undefined && product.stockQuantity <= 5 ? (
              <span className="text-maroon">Only {product.stockQuantity} left</span>
            ) : (
              <span className="text-emerald">In stock</span>
            )}
          </div>
        ) : (
          <p className="text-[11px] font-semibold text-maroon">Currently sold out</p>
        )}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-maroon">{formatMoney(product.salePrice)}</span>
          {product.basePrice > product.salePrice ? (
            <>
              <span className="text-sm text-charcoal/70 line-through">{formatMoney(product.basePrice)}</span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald">
                {product.discountPercentage}% off
              </span>
            </>
          ) : null}
        </div>
        <AddToCartButton product={cartItem} className="w-full" />
      </div>
    </article>
  );
}
