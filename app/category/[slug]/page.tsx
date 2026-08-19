import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Flower2, Search, SlidersHorizontal } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid } from "@/components/product-grid";
import { getCategory, getProducts, getSubcategories } from "@/lib/api";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { comingSoonPath, unavailableCategoryDepartments } from "@/lib/storefront";

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
  const unavailableDepartment = unavailableCategoryDepartments[slug];
  if (unavailableDepartment) redirect(comingSoonPath(unavailableDepartment));

  const [category, products, subcategories] = await Promise.all([
    getCategory(slug),
    getProducts({
      category: slug,
      subcategory: query.subcategory,
      search: query.search,
      occasion: query.occasion,
      min_price: query.min_price,
      max_price: query.max_price,
      sort_by: query.sort_by
    }),
    getSubcategories(slug)
  ]);
  if (!category) notFound();
  const isKidsCatalog = ["kids-pattu-pavadai", "girls-lehenga-choli", "pattu-pavadai"].includes(category.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: category.name, path: `/category/${category.slug}` }
        ])}
      />
      <section className={isKidsCatalog ? "kids-catalog-hero" : "bg-sandal/70 py-12"}>
        <div className={isKidsCatalog ? "container-page kids-catalog-hero__inner" : "container-page"}>
          <div className={isKidsCatalog ? "kids-catalog-hero__copy" : undefined}>
          <p className="section-kicker">Category</p>
          <h1 className={isKidsCatalog ? "kids-catalog-hero__title" : "mt-3 max-w-4xl font-display text-6xl font-semibold leading-none text-maroon-deep"}>
            {category.name}
          </h1>
          {!isKidsCatalog ? <p className="mt-5 max-w-3xl text-base leading-8 text-charcoal/70">{category.description}</p> : null}
          </div>
          {isKidsCatalog ? (
            <div className="kids-catalog-hero__rule" aria-hidden="true">
              <span />
              <Flower2 />
              <span />
            </div>
          ) : null}
        </div>
      </section>

      <section className={isKidsCatalog ? "container-page kids-catalog-layout" : "container-page grid gap-8 py-12 lg:grid-cols-[280px_1fr]"}>
        <aside className={isKidsCatalog ? "kids-catalog-filters" : "h-fit border-t border-charcoal/10 bg-white pt-5 lg:sticky lg:top-32"}>
          <div className="flex items-center gap-3 border-b border-charcoal/10 pb-4">
            <SlidersHorizontal className="h-5 w-5 text-gold" aria-hidden="true" />
            <h2 className="font-semibold uppercase tracking-[0.16em]">Filters</h2>
          </div>
          <form className="mt-5 grid gap-4" action={`/category/${category.slug}`}>
            <label className="form-field">Search<span className={isKidsCatalog ? "kids-catalog-search" : undefined}><input name="search" defaultValue={query.search} placeholder="Lehenga, pattu pavadai..." />{isKidsCatalog ? <Search aria-hidden="true" /> : null}</span></label>
            {subcategories.length ? (
              <label className="form-field">
                Shop by style
                <select name="subcategory" defaultValue={query.subcategory || ""}>
                  <option value="">All styles</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.slug} value={subcategory.slug}>
                      {subcategory.name} ({subcategory.productCount})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="form-field">Occasion<select name="occasion" defaultValue={query.occasion || ""}><option value="">All occasions</option><option value="wedding">Wedding</option><option value="festival">Festival</option><option value="puja">Puja</option><option value="sangeet">Sangeet</option></select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="form-field">Min price<input name="min_price" type="number" min="0" step="500" defaultValue={query.min_price} /></label>
              <label className="form-field">Max price<input name="max_price" type="number" min="0" step="500" defaultValue={query.max_price} /></label>
            </div>
            <label className="form-field">Sort<select name="sort_by" defaultValue={query.sort_by || "newest"}><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="popular">Popular</option></select></label>
            <button className="btn-primary" type="submit">Apply filters</button>
            <Link className="btn-secondary" href={`/category/${category.slug}`}>Clear filters</Link>
          </form>
        </aside>
        <div className={isKidsCatalog ? "kids-catalog-results" : undefined}>
          <div className={isKidsCatalog ? "kids-catalog-results__bar" : "mb-6 flex flex-col gap-3 border-y border-charcoal/10 bg-white py-4 sm:flex-row sm:items-center sm:justify-between"}>
            <p className="text-sm text-charcoal/70">{products.length} styles available</p>
            <p className="text-xs font-semibold text-charcoal/70">Filters are reflected in the page URL.</p>
          </div>
          <ProductGrid products={products} className={isKidsCatalog ? "kids-catalog-grid" : undefined} />
          <article className="mt-12 border-t border-charcoal/10 pt-8 leading-8 text-charcoal/70">
            <h2 className="font-display text-4xl text-maroon-deep">Shop {category.name} at AMZIRA</h2>
            <p className="mt-4">
              AMZIRA curates {category.name.toLowerCase()} for South Indian weddings, festive gatherings,
              pujas, and family ceremonies. Each product page includes fabric notes, size options,
              delivery guidance, and styling support for confident family shopping.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
