import { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="rounded-md border border-dashed border-charcoal/20 bg-white p-10 text-center">
        <h2 className="font-display text-3xl text-maroon-deep">No pieces found</h2>
        <p className="mx-auto mt-3 max-w-xl text-charcoal/65">
          Try removing a filter or explore the complete girls&apos; lehenga choli collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.slug} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
