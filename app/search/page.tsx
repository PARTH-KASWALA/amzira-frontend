import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { getProducts } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Search", path: "/search", noIndex: true });

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = await getProducts({ search: q, limit: 24 });
  return (
    <section className="container-page py-12">
      <p className="section-kicker">Search</p>
      <h1 className="mt-3 font-display text-6xl text-maroon-deep">Find her celebration look</h1>
      <form className="mt-6 flex max-w-2xl gap-2" action="/search">
        <input
          className="min-h-11 flex-1 rounded-md border border-charcoal/15 bg-white px-4"
          name="q"
          defaultValue={q}
          placeholder="Search girls' lehenga choli or pattu pavadai..."
        />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
