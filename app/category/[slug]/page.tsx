import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid } from "@/components/product-grid";
import { getCategory, getProducts } from "@/lib/api";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return buildMetadata({ title: "Category not found", path: `/category/${slug}` });
  return buildMetadata({
    title: `${category.name} Online`,
    description: category.description,
    path: `/category/${category.slug}`,
    image: category.imageUrl
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [category, products] = await Promise.all([
    getCategory(slug),
    getProducts({
      category: slug,
      search: query.search,
      min_price: query.min_price,
      max_price: query.max_price,
      sort_by: query.sort_by
    })
  ]);
  if (!category) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: category.name, path: `/category/${category.slug}` }
        ])}
      />
      <section className="bg-sandal/70 py-12">
        <div className="container-page">
          <p className="section-kicker">Category</p>
          <h1 className="mt-3 max-w-4xl font-display text-6xl font-semibold leading-none text-maroon-deep">
            {category.name}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-charcoal/70">{category.description}</p>
        </div>
      </section>

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-md border border-charcoal/10 bg-white p-5 shadow-sm lg:sticky lg:top-32">
          <div className="flex items-center gap-3 border-b border-charcoal/10 pb-4">
            <SlidersHorizontal className="h-5 w-5 text-gold" aria-hidden="true" />
            <h2 className="font-semibold uppercase tracking-[0.16em]">Filters</h2>
          </div>
          {[
            ["Occasion", ["Wedding", "Reception", "Sangeet", "Festival"]],
            ["Fabric", ["Kanjeevaram Silk", "Tissue", "Organza", "Brocade"]],
            ["Price", ["Under Rs. 10,000", "Rs. 10,000 - Rs. 25,000", "Above Rs. 25,000"]]
          ].map(([title, options]) => (
            <div key={String(title)} className="border-b border-charcoal/10 py-5 last:border-b-0">
              <h3 className="mb-3 text-sm font-bold text-charcoal">{String(title)}</h3>
              <div className="space-y-3">
                {(options as string[]).map((option) => (
                  <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-charcoal/70">
                    <input type="checkbox" className="h-4 w-4 accent-maroon" />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <div>
          <div className="mb-6 flex flex-col gap-3 rounded-md border border-charcoal/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-charcoal/70">{products.length} styles available</p>
            <div className="flex flex-wrap gap-2">
              {["Ready to ship", "Custom stitch", "Bridal", "Bestsellers"].map((chip) => (
                <Link
                  key={chip}
                  href={`/category/${category.slug}`}
                  className="focus-ring rounded-full border border-charcoal/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:border-maroon hover:text-maroon"
                >
                  {chip}
                </Link>
              ))}
            </div>
          </div>
          <ProductGrid products={products} />
          <article className="mt-12 rounded-md border border-charcoal/10 bg-white p-7 leading-8 text-charcoal/70">
            <h2 className="font-display text-4xl text-maroon-deep">Shop {category.name} at AMZIRA</h2>
            <p className="mt-4">
              AMZIRA curates {category.name.toLowerCase()} for South Indian weddings, festive gatherings,
              engagement functions, and family ceremonies. Each product page includes fabric notes, size options,
              delivery guidance, and styling support so shoppers and AI search systems can understand the catalog clearly.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
