import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarCheck,
  Gem,
  Heart,
  MapPin,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Truck
} from "lucide-react";
import { CategoryShowcase } from "@/components/category-showcase";
import { ProductGrid } from "@/components/product-grid";
import { TrustStrip } from "@/components/trust-strip";
import { getCategories, getFeaturedProducts } from "@/lib/api";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const heroRoles = [
  {
    title: "I'm the bride",
    body: "Pattu lehengas, half sarees, and temple zari for the muhurtham moment.",
    href: "/category/bridal-lehenga",
    image: "/images/occasions/bride.webp"
  },
  {
    title: "I'm the groom",
    body: "Sherwani, kurta jackets, and coordinated family looks for the mandap.",
    href: "/men",
    image: "/images/occasions/sherwani.webp"
  },
  {
    title: "I'm celebrating",
    body: "Sangeet, mehendi, reception, and festive edits ready for every guest.",
    href: "/category/tissue-organza",
    image: "/images/occasions/sangeet.webp"
  },
  {
    title: "I'm shopping for kids",
    body: "Soft pattu pavadai and ceremony outfits sized for long wedding days.",
    href: "/kids",
    image: "/images/Bestsellers/womens/product-1-front.webp"
  }
];

const occasionEdits = [
  {
    name: "Muhurtham bride",
    copy: "Crimson silk, antique zari, and heirloom blouse work.",
    href: "/category/bridal-lehenga",
    image: "/images/occasions/bride_side.webp"
  },
  {
    name: "Haldi and mehendi",
    copy: "Turmeric, emerald, mirror accents, and easy movement.",
    href: "/category/half-saree",
    image: "/images/occasions/haldi.webp"
  },
  {
    name: "Sangeet shimmer",
    copy: "Tissue, organza, and reception-ready drape.",
    href: "/category/tissue-organza",
    image: "/images/occasions/reception.webp"
  },
  {
    name: "Festival silk",
    copy: "Kanjeevaram-inspired color for puja and family gatherings.",
    href: "/category/kanjeevaram-lehenga",
    image: "/images/occasions/celebrating_festivals.webp"
  }
];

const trustDetails: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Assured quality",
    body: "Every product page is structured around fabric, lining, care, stock, and occasion clarity."
  },
  {
    icon: Truck,
    title: "Delivery ready",
    body: "Ready-to-ship discovery and pincode delivery checks are part of the commerce roadmap."
  },
  {
    icon: CalendarCheck,
    title: "Styling appointments",
    body: "A guided bridal session can plan the bride, groom, family, and guest closet together."
  }
];

const shoppingPaths = [
  "Bridal lehenga choli",
  "Kanjeevaram silk lehenga",
  "Half saree and langa voni",
  "Pattu pavadai for girls",
  "Wedding guest outfits",
  "Reception and sangeet wear"
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      <section className="relative overflow-hidden bg-ivory text-charcoal">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(212,175,55,0.22),transparent_28rem)]" />
        <div className="container-page relative grid min-h-[calc(100svh-118px)] gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-12">
          <div className="max-w-3xl temple-rule">
            <p className="section-kicker">South Indian bridal and festive wear</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.94] tracking-wide text-maroon-deep sm:text-6xl lg:text-7xl xl:text-8xl">
              I&apos;m the bride. Bring me silk, zari, and ceremony.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-charcoal/72 sm:text-lg">
              Shop premium lehenga choli, Kanjeevaram-inspired half sarees, and family wedding looks built for
              South Indian celebrations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" href="/category/bridal-lehenga">
                Shop bridal lehenga
              </Link>
              <Link className="btn-secondary gap-2" href="/appointments">
                Book styling <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.62fr_0.38fr] lg:min-h-[620px]">
            <Link
              href="/category/bridal-lehenga"
              className="group relative min-h-[460px] overflow-hidden rounded-md bg-charcoal shadow-sari focus-ring md:min-h-[620px]"
            >
              <Image
                src="/images/occasions/bride.webp"
                alt="South Indian bride wearing a red pattu lehenga choli with antique gold embroidery"
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/76 via-charcoal/12 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-pale">Bridal edit</p>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-none sm:text-5xl">
                  Pattu lehengas that hold the whole room.
                </h2>
              </div>
            </Link>

            <div className="grid gap-4">
              {heroRoles.slice(1).map((role) => (
                <Link
                  key={role.title}
                  href={role.href}
                  className="group relative min-h-[190px] overflow-hidden rounded-md bg-charcoal text-white shadow-soft focus-ring"
                >
                  <Image
                    src={role.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 28vw, 100vw"
                    className="object-cover opacity-[0.82] transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/82 via-charcoal/22 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-3xl font-semibold">{role.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/78">{role.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="bg-sandal py-14">
        <div className="container-page">
          <div className="grid gap-4 lg:grid-cols-4">
            {heroRoles.map((role) => (
              <Link
                key={role.title}
                href={role.href}
                className="group flex min-h-[180px] flex-col justify-between overflow-hidden rounded-md border border-maroon/10 bg-white/[0.62] p-5 shadow-soft transition hover:-translate-y-1 hover:border-maroon/30 focus-ring"
              >
                <div>
                  <p className="font-display text-3xl font-semibold text-maroon-deep">{role.title}</p>
                  <p className="mt-2 text-sm leading-6 text-charcoal/66">{role.body}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-maroon">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="temple-rule">
            <p className="section-kicker">Featured collections</p>
            <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Signature ceremony edits</h2>
          </div>
          <Link className="btn-secondary w-fit gap-2" href="/women">
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <CategoryShowcase categories={categories} />
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="container-page grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="relative min-h-[480px] overflow-hidden rounded-md bg-charcoal shadow-sari">
            <Image
              src="/images/occasions/team-bride.webp"
              alt="Wedding party styled in coordinated South Indian ceremony outfits"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="temple-rule">
            <p className="section-kicker">Our craft</p>
            <h2 className="mt-2 font-display text-5xl font-semibold leading-tight text-maroon-deep lg:text-6xl">
              Where heritage meets a modern wedding closet.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-charcoal/70">
              The old AMZIRA homepage carried a bigger story, so the new storefront now restores that sense of
              ceremony: bridal silk, groom edits, family coordination, occasion shopping, and product discovery in one
              long, crawlable page.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {shoppingPaths.map((path) => (
                <Link
                  key={path}
                  href="/search"
                  className="flex min-h-11 items-center gap-3 rounded-md border border-charcoal/10 bg-ivory px-4 text-sm font-semibold text-charcoal transition hover:border-maroon hover:text-maroon focus-ring"
                >
                  <Search className="h-4 w-4 text-maroon" aria-hidden="true" />
                  {path}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="procession-panel py-14 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="procession-glow order-2 flex justify-center lg:order-1">
            <Image
              src="/images/animations/wedding-procession.gif"
              alt=""
              width={480}
              height={270}
              unoptimized
              className="procession-float relative z-10 h-auto w-full max-w-[520px] opacity-95"
              aria-hidden="true"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="section-kicker">The wedding procession</p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight text-maroon-deep">
              A small moving ritual from the old homepage, refined for the new one.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal/70">
              This is the original AMZIRA procession GIF from the legacy index page. It now anchors the midpoint of the
              homepage as an intentional ceremony pause instead of a loose decorative strip.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="mb-8 temple-rule">
          <p className="section-kicker">Shop by occasion</p>
          <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Every event gets its own edit</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {occasionEdits.map((edit) => (
            <Link
              key={edit.name}
              href={edit.href}
              className="group overflow-hidden rounded-md border border-charcoal/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-sari focus-ring"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-sandal">
                <Image
                  src={edit.image}
                  alt={`${edit.name} ethnic wear edit`}
                  fill
                  sizes="(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-3xl font-semibold text-maroon-deep">{edit.name}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/64">{edit.copy}</p>
              </div>
            </Link>
          ))}
        </div>
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
          {trustDetails.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-md border border-charcoal/10 bg-white p-7 shadow-sm">
              <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
              <h3 className="mt-5 font-display text-3xl text-maroon-deep">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-charcoal/65">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-maroon-deep py-16 text-white lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-pale">AI and search visibility</p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-tight">
              Built around the words shoppers actually use.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
              Bridal lehenga choli, Kanjeevaram silk lehenga, South Indian half saree, pattu pavadai, muhurtham outfit,
              mehendi lehenga, and festive family wear all appear as real crawlable content.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [Gem, "Product JSON-LD"],
              [Heart, "Wishlist and cart paths"],
              [MapPin, "Store and appointment routes"],
              [Sparkles, "Occasion-rich copy"],
              [Scissors, "Size and fit language"],
              [Search, "Searchable category terms"]
            ].map(([Icon, label]) => (
              <div key={String(label)} className="rounded-md border border-white/12 bg-white/[0.08] p-4">
                <Icon className="h-5 w-5 text-gold-pale" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-white">{String(label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
