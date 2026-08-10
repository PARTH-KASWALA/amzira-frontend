import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Gem,
  HandHeart,
  Music2,
  Search,
  Sparkles,
  UsersRound
} from "lucide-react";
import { CategoryShowcase } from "@/components/category-showcase";
import { CinematicSection } from "@/components/cinematic-section";
import { HeroCarousel } from "@/components/hero-carousel";
import { LuxuryCardGrid } from "@/components/luxury-card-grid";
import { ParentsLoveSection } from "@/components/parents-love-section";
import { ProcessionGifSection } from "@/components/procession-gif-section";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getFeaturedProducts } from "@/lib/api";

const occasionEdits = [
  {
    name: "Muhurtham bride",
    copy: "Crimson silk, antique zari, and heirloom blouse work.",
    href: "/category/bridal-lehenga",
    image: "/images/occasions/bride_side.webp",
    icon: Crown
  },
  {
    name: "Haldi and mehendi",
    copy: "Turmeric, emerald, mirror accents, and easy movement.",
    href: "/category/half-saree",
    image: "/images/occasions/haldi.webp",
    icon: Sparkles
  },
  {
    name: "Sangeet shimmer",
    copy: "Tissue, organza, and reception-ready drape.",
    href: "/category/tissue-organza",
    image: "/images/occasions/reception.webp",
    icon: Music2
  },
  {
    name: "Festival silk",
    copy: "Kanjeevaram-inspired color for puja and family gatherings.",
    href: "/category/kanjeevaram-lehenga",
    image: "/images/occasions/celebrating_festivals.webp",
    icon: UsersRound
  }
];

const shoppingPaths = [
  { label: "Bridal lehenga choli", icon: Crown },
  { label: "Kanjeevaram silk lehenga", icon: Gem },
  { label: "Half saree and langa voni", icon: Sparkles },
  { label: "Wedding guest outfits", icon: UsersRound },
  { label: "Reception and sangeet wear", icon: Music2 },
  { label: "Pattu pavadai for girls", icon: HandHeart }
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      <HeroCarousel />

      <LuxuryCardGrid />

      <CinematicSection />

      <section className="pattern-section py-16 lg:py-24">
        <div className="container-page pattern-section__content">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="temple-rule">
              <p className="section-kicker">Featured collections</p>
              <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Signature ceremony edits</h2>
            </div>
            <Link className="btn-secondary w-fit gap-2 bg-white" href="/women">
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <CategoryShowcase categories={categories} />
        </div>
      </section>

      <section className="craft-home-section overflow-hidden py-14 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-charcoal shadow-sari sm:min-h-[520px] lg:min-h-[560px]">
            <Image
              src="/images/occasions/team-bride.webp"
              alt="Wedding party styled in coordinated South Indian ceremony outfits"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover brightness-[1.04] saturate-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/36 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 max-w-sm rounded-lg border border-white/60 bg-white/88 p-5 shadow-soft backdrop-blur-md sm:bottom-8 sm:left-8">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-sm">
                  <HandHeart className="h-8 w-8" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-2xl font-semibold leading-tight text-maroon-deep">
                    Crafted for moments that become memories.
                  </p>
                  <p className="mt-2 text-xs font-medium leading-5 text-charcoal/68">
                    Rooted in tradition. Designed for today.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="craft-title-rule mb-6" aria-hidden="true">
              <span />
            </div>
            <p className="section-kicker">Our craft</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.06] text-maroon-deep sm:text-5xl lg:text-6xl">
              Where heritage meets a modern wedding closet.
            </h2>
            <div className="my-7 h-px w-56 bg-gradient-to-r from-gold via-maroon to-transparent" />
            <p className="max-w-2xl text-base leading-8 text-charcoal/70">
              A curated world of bridal silks, groom edits, and coordinated celebration wear for every ceremony moment.
            </p>
            <Link
              href="/search"
              className="focus-ring mt-8 flex min-h-[64px] min-w-0 items-center gap-4 rounded-full border border-charcoal/10 bg-white px-5 text-charcoal shadow-soft transition hover:border-maroon/35 hover:shadow-sari"
            >
              <Search className="h-6 w-6 shrink-0 text-maroon" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm text-charcoal/58 sm:text-base">
                Search bridal lehengas, sarees, wedding outfits...
              </span>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-maroon-deep text-white">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </Link>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-maroon-deep">
              Popular searches
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shoppingPaths.map((path) => (
                <Link
                  key={path.label}
                  href="/search"
                  className="focus-ring flex min-h-12 items-center gap-3 rounded-full border border-charcoal/10 bg-white/78 px-4 text-sm font-semibold text-charcoal shadow-[0_12px_34px_rgba(42,7,17,0.07)] transition hover:-translate-y-0.5 hover:border-maroon/28 hover:text-maroon"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-maroon-soft text-maroon">
                    <path.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{path.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="occasion-section pattern-section py-16 lg:py-24">
        <div className="container-page pattern-section__content">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="temple-rule">
                <p className="section-kicker">Shop by occasion</p>
                <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">
                  Every event gets its own edit
                </h2>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-charcoal/68 sm:text-base">
                Handpicked looks for every celebration, tradition, and moment.
              </p>
            </div>
            <Link className="btn-secondary w-fit gap-2" href="/women">
              Explore edits <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {occasionEdits.map((edit) => (
              <Link
                key={edit.name}
                href={edit.href}
                className="group overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-sari focus-ring"
              >
                <div className="relative aspect-[1.02/1] overflow-hidden bg-sandal">
                  <Image
                    src={edit.image}
                    alt={`${edit.name} ethnic wear edit`}
                    fill
                    sizes="(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-white bg-white text-maroon shadow-soft">
                    <edit.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-3xl font-semibold text-maroon-deep">{edit.name}</h3>
                  <span className="mt-3 block h-px w-16 bg-gradient-to-r from-gold via-gold to-transparent" />
                  <p className="mt-2 text-sm leading-6 text-charcoal/64">{edit.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-maroon">
                    Explore edit
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProcessionGifSection />

      <section className="pattern-section py-16 lg:py-24">
        <div className="container-page pattern-section__content">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Bestsellers</p>
              <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Wedding-ready pieces</h2>
            </div>
            <Link className="btn-secondary w-fit bg-white" href="/category/bridal-lehenga">
              Bridal edit
            </Link>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      <ParentsLoveSection />

    </>
  );
}
