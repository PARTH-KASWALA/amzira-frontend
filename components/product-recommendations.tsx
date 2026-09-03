import { Product } from "@/lib/catalog";
import { getRecommendedProducts } from "@/lib/api";
import { ProductGrid } from "@/components/product-grid";

export async function ProductRecommendations({ product }: { product: Product }) {
  const products = await getRecommendedProducts(product, 4);
  if (!products.length) return null;

  return (
    <section className="container-page border-t border-charcoal/10 py-14 sm:py-18" aria-labelledby="recommended-products-heading">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Curated for the occasion</p>
          <h2 id="recommended-products-heading" className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-maroon-deep sm:text-5xl">
            More to love
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-charcoal/65">
            A few considered pairings from the same AMZIRA edit, selected by craft, occasion, and fit.
          </p>
        </div>
        <span className="border-b border-gold/60 pb-1 text-xs font-bold uppercase tracking-[0.18em] text-maroon">
          The AMZIRA edit
        </span>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
