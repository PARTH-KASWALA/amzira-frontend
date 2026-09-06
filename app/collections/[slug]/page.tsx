import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid } from "@/components/product-grid";
import { getProducts } from "@/lib/api";
import { collectionJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { collectionLandingPages, getCollectionLandingPage } from "@/lib/landing-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collectionLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getCollectionLandingPage(slug);
  if (!page) return buildMetadata({ title: "Collection not found", path: `/collections/${slug}`, noIndex: true });
  return buildMetadata({ title: page.title, description: page.description, path: `/collections/${page.slug}` });
}

export default async function CollectionLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getCollectionLandingPage(slug);
  if (!page) notFound();

  const products = await getProducts({
    category: page.categorySlug,
    subcategory: page.subcategory,
    occasion: page.occasion,
    sort_by: "popular"
  });

  return (
    <>
      <JsonLd data={collectionJsonLd({ name: page.title, description: page.description, path: `/collections/${page.slug}`, products })} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: page.title, path: `/collections/${page.slug}` }
      ])} />

      <section className="bg-sandal/70 py-14 sm:py-20">
        <div className="container-page">
          <p className="section-kicker">AMZIRA collection</p>
          <h1 className="mt-3 max-w-5xl font-display text-5xl font-semibold leading-[0.98] text-maroon-deep sm:text-7xl">{page.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-charcoal/70">{page.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/guides/pattu-pavadai-size-guide">View the size guide</Link>
            <Link className="btn-secondary" href="/category/kids-pattu-pavadai">Browse all girls’ styles</Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <div className="mb-7 flex flex-col gap-2 border-y border-charcoal/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-charcoal/70">{products.length} styles in this edit</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-maroon">South Indian girls’ occasionwear</p>
        </div>
        <ProductGrid products={products} />

        <article className="mt-14 max-w-4xl border-t border-charcoal/10 pt-9 leading-8 text-charcoal/70">
          <h2 className="font-display text-4xl text-maroon-deep">{page.supportingHeading}</h2>
          {page.supportingParagraphs.map((paragraph) => <p className="mt-4" key={paragraph}>{paragraph}</p>)}
        </article>
      </section>
    </>
  );
}
