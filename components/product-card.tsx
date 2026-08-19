import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "@/components/cart-button";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group rounded-md border border-charcoal/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-sari">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="focus-ring block rounded-t-md" aria-label={`View ${product.name}`}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-md bg-sandal">
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon">
              {product.badge}
            </span>
          ) : null}
          </div>
        </Link>
        <WishlistButton productId={product.id} productName={product.name} className="absolute right-3 top-3" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-maroon">
            {product.subcategoryName || product.categoryName}
          </p>
          <h3 className="mt-2 min-h-[3.2rem] font-display text-xl font-semibold leading-tight text-charcoal">
            <Link className="focus-ring rounded-sm hover:text-maroon" href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal/65">
          <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
          <span>{product.avgRating ? product.avgRating.toFixed(1) : "New"}</span>
          <span>({product.reviewCount})</span>
        </div>
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
        <AddToCartButton product={product} className="w-full" />
      </div>
    </article>
  );
}
