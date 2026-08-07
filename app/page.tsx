import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Scissors, Sparkles } from "lucide-react";
import { CategoryShowcase } from "@/components/category-showcase";
import { ProductGrid } from "@/components/product-grid";
import { TrustStrip } from "@/components/trust-strip";
import { getCategories, getFeaturedProducts } from "@/lib/api";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-3.webp"
            alt="South Indian bridal lehenga choli with antique gold embroidery"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/72 to-charcoal/10" />
        </div>
        <div className="container-page relative grid min-h-[calc(100svh-120px)] items-end gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl temple-rule">
            <p className="section-kicker text-gold-pale">Bridal · Festive · Ceremony</p>
            <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.9] tracking-wide sm:text-7xl lg:text-8xl">
              Kanjivaram richness, made for modern celebrations.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
              Discover South Indian lehenga choli, half sarees, bridal pattu sets, and family occasion wear with
              premium craft, clear fit guidance, and secure checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary bg-gold text-charcoal hover:bg-gold-bright" href="/women">
                Shop women
              </Link>
              <Link className="btn-secondary border-white/35 bg-white/10 text-white hover:border-white hover:text-white" href="/appointments">
                Book bridal styling
              </Link>
            </div>
          </div>
          <div className="hidden rounded-md border border-white/15 bg-white/10 p-5 backdrop-blur md:block">
            <div className="grid grid-cols-3 gap-3">
              {["Temple zari", "Custom fit", "Ready to ship"].map((label) => (
                <div key={label} className="rounded-md border border-white/15 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-pale">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 font-display text-3xl">A ceremony closet for the bride, family, and guests.</p>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="container-page py-16 lg:py-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="temple-rule">
            <p className="section-kicker">Shop by craft</p>
            <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Signature ceremony edits</h2>
          </div>
          <Link className="btn-secondary w-fit gap-2" href="/women">
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <CategoryShowcase categories={categories} />
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Bestsellers</p>
              <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Wedding-ready pieces</h2>
            </div>
            <Link className="btn-secondary w-fit" href="/category/bridal-lehenga">
              Bridal edit
            </Link>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            [Sparkles, "Craft-first catalog", "Filter by ceremony, fabric, color, fit, and ready-to-ship status."],
            [Scissors, "Fit clarity", "Select stitched, unstitched, kids sizing, or custom blouse support with confidence."],
            [CalendarCheck, "Styling appointments", "Bring your bridal date, event list, and family looks into one guided session."]
          ].map(([Icon, title, body]) => (
            <div key={String(title)} className="rounded-md border border-charcoal/10 bg-white p-7 shadow-sm">
              <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
              <h3 className="mt-5 font-display text-3xl text-maroon-deep">{String(title)}</h3>
              <p className="mt-3 text-sm leading-7 text-charcoal/65">{String(body)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
