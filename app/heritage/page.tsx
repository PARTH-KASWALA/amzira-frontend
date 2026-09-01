import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarHeart,
  Clock3,
  Gem,
  HandHeart,
  Landmark,
  LineChart,
  RefreshCcw,
  Ruler,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Truck
} from "lucide-react";
import { HeritageInventoryRotator } from "@/components/heritage-inventory-rotator";
import { getFeaturedProducts, getProduct, getProducts } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { LIVE_CATEGORY_PATH } from "@/lib/storefront";

export const metadata: Metadata = buildMetadata({
  title: "Our Heritage",
  description:
    "Discover AMZIRA's South Indian ceremony wear heritage, artisan craft, textile archives, and kids' lehenga choli story.",
  path: "/heritage",
  image: "/images/heritage/heritage-hero-backdrop.webp"
});

type Pillar = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const pillars: Pillar[] = [
  {
    icon: Landmark,
    title: "Temple border memory",
    copy: "Zari lines, jewel tones, and carved-arch geometry guide the house language."
  },
  {
    icon: HandHeart,
    title: "Hand-finished detail",
    copy: "Each edit is checked for lining, fall, blouse finish, and ceremony movement."
  },
  {
    icon: Sprout,
    title: "Made for childhood",
    copy: "Soft linings, easy movement, and ceremony detail shape every girls' style in our first collection."
  }
];

const scaleSignals = [
  {
    value: "Focused",
    label: "Focused launch",
    copy: "One clear kids' category, built deep before it grows wide."
  },
  {
    value: "Fit-led",
    label: "Size-led buying",
    copy: "Age bands, fit help, and comfort details support repeat orders."
  },
  {
    value: "Clear",
    label: "Fast decision loop",
    copy: "Shipping, returns, and styling paths are visible before checkout."
  }
];

const craftSteps = [
  {
    title: "Archive",
    detail: "We begin with heirloom drapes, pattu pavadai color stories, and Kanjeevaram-inspired border studies."
  },
  {
    title: "Sketch",
    detail: "Silhouettes are shaped around the ritual: muhurtham, haldi, sangeet, reception, and family portraits."
  },
  {
    title: "Embroider",
    detail: "Zari, mirror, bead, and thread accents are placed where they catch light without weighing down the garment."
  },
  {
    title: "Style",
    detail: "The final look is finished with blouse pairing, dupatta drape, jewelry tone, and movement checks."
  }
];

const heritageInventoryLooks = {
  green: {
    name: "Kiara Green Maroon Peacock Work Pattu Pavadai",
    slug: "kiara-green-maroon-peacock-work-pattu-pavadai",
    image: "/images/catalog/kiara-green-maroon-peacock-work-pattu-pavadai/01.webp",
    alt: "Girl wearing the Kiara green and maroon peacock work pattu pavadai from the AMZIRA inventory"
  },
  blue: {
    name: "Aadhya Royal Blue Mustard Temple Border Lehenga Choli",
    slug: "aadhya-royal-blue-mustard-temple-border-lehenga-choli",
    image: "/images/catalog/aadhya-royal-blue-mustard-temple-border-lehenga-choli/01.webp",
    alt: "Girl wearing the Aadhya royal blue and mustard temple border lehenga choli from the AMZIRA inventory"
  }
};

const gallery = [
  {
    label: "Heritage weaves",
    title: "Festive heirlooms for the next generation.",
    cta: "View outfit",
    href: `/product/${heritageInventoryLooks.green.slug}`,
    image: heritageInventoryLooks.green.image,
    alt: heritageInventoryLooks.green.alt,
    className: "md:col-span-2"
  },
  {
    label: "Celebration edits",
    title: "Colors that carry tradition forward.",
    cta: "View outfit",
    href: `/product/${heritageInventoryLooks.blue.slug}`,
    image: heritageInventoryLooks.blue.image,
    alt: heritageInventoryLooks.blue.alt,
    className: ""
  },
  {
    label: "Atelier archive",
    title: "Signature ceremony edits.",
    cta: "Explore collection",
    href: LIVE_CATEGORY_PATH,
    image: "/images/heritage/heritage-atelier-archive.webp",
    alt: "South Indian silk fabrics, blouse embroidery, and atelier sketches arranged on a worktable",
    className: ""
  }
];

const growthCards = [
  {
    icon: Boxes,
    title: "Category depth",
    copy: "Temple borders, pattu pavadai sets, and ceremony edits can expand without changing the browsing pattern."
  },
  {
    icon: BadgeCheck,
    title: "Trust signals",
    copy: "Fit guidance, delivery checks, secure payment, and return policy stay close to purchase moments."
  },
  {
    icon: LineChart,
    title: "Search-ready structure",
    copy: "Every section reinforces the category language shoppers already use: kids' lehenga choli, pattu pavadai, and wedding outfits."
  }
];

const craftsmanshipStandards = [
  {
    icon: ScrollText,
    title: "Heritage craftsmanship",
    copy: "Temple-border traditions and artisan-led details shape every AMZIRA celebration edit."
  },
  {
    icon: Sparkles,
    title: "Premium quality fabrics",
    copy: "Silk-rich surfaces, zari accents, and soft linings are chosen for ceremony and movement."
  },
  {
    icon: Truck,
    title: "Trusted delivery",
    copy: "Clear order tracking and careful packaging keep every celebration outfit protected in transit."
  },
  {
    icon: RefreshCcw,
    title: "Easy returns & styling",
    copy: "36-hour returns and complimentary fit guidance keep the decision simple for growing children."
  }
];

const craftsmanshipProofs = [
  { icon: Clock3, value: "36-hour", label: "Returns window" },
  { icon: Ruler, value: "Fit-led", label: "Size guidance" },
  { icon: ShieldCheck, value: "Secure", label: "Purchase protection" },
  { icon: CalendarHeart, value: "Personal", label: "Ceremony styling" }
];

export default async function HeritagePage() {
  const [featuredProducts, inventoryProducts] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ limit: 100 })
  ]);
  const [featuredProduct] = featuredProducts;
  const inventoryHighlight =
    (featuredProduct ? await getProduct(featuredProduct.slug) : null) ??
    (await getProduct("sri-valli-girls-traditional-pattu-pavadai"));
  const rotatingInventory = inventoryProducts.length
    ? inventoryProducts
    : inventoryHighlight
      ? [inventoryHighlight]
      : [];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal text-white">
        <Image
          src="/images/heritage/heritage-hero-backdrop.webp"
          alt="South Indian temple courtyard with silk borders, brass lamps, and heritage architecture"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/76 to-maroon-deep/30" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent" />

        <div className="container-page relative grid min-h-[calc(100svh-7rem)] gap-10 py-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:py-[3.125rem]">
          <div className="temple-rule max-w-3xl">
            <p className="section-kicker text-gold-pale">Our heritage</p>
            <h1 className="mt-5 font-display text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
              South Indian craft, kept in motion.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
              AMZIRA carries temple-border silk and artisan finish into a modern girls&apos; celebration wardrobe, beginning
              with South Indian lehenga choli and pattu pavadai.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="btn-primary gap-2 bg-gold text-charcoal hover:bg-gold-pale" href="/appointments">
                Book a heritage session <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link className="btn-secondary border-white/30 bg-white/10 text-white hover:border-gold hover:text-gold-pale" href="#craft">
                See the craft
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[620px]" aria-label="AMZIRA heritage textile story">
            <div className="absolute left-0 top-8 h-24 w-3/5 border border-gold/35 bg-gradient-to-r from-maroon/28 to-transparent" />
            <div className="absolute right-0 top-0 h-36 w-2/5 border border-white/20 bg-peacock/20" />
            <div className="absolute left-4 top-10 aspect-[4/5] w-[48%] overflow-hidden rounded-md border border-gold/50 bg-sandal shadow-sari sm:w-[42%] lg:left-10">
              <Image
                src={heritageInventoryLooks.green.image}
                alt={heritageInventoryLooks.green.alt}
                fill
                unoptimized={heritageInventoryLooks.green.image.startsWith("/images/") || heritageInventoryLooks.green.image.startsWith("https://cdn.amzira.com/")}
                sizes="(min-width: 1024px) 28vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-0 top-24 aspect-[3/4] w-[54%] overflow-hidden rounded-md border border-white/20 bg-charcoal shadow-sari sm:w-[48%]">
              <Image
                src={heritageInventoryLooks.blue.image}
                alt={heritageInventoryLooks.blue.alt}
                fill
                unoptimized={heritageInventoryLooks.blue.image.startsWith("/images/") || heritageInventoryLooks.blue.image.startsWith("https://cdn.amzira.com/")}
                sizes="(min-width: 1024px) 30vw, 54vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-3 left-[16%] w-[68%] rounded-md border border-gold/60 bg-ivory p-5 text-charcoal shadow-sari sm:w-[54%] lg:left-[22%]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-maroon">House archive</p>
              <p className="mt-2 font-display text-3xl font-semibold leading-tight text-maroon-deep">
                Silk, zari, ritual color, and portrait-ready drape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="heritage-proof-section relative isolate overflow-hidden py-9 lg:py-[3.125rem]">
        <Image
          src="/images/heritage/heritage-proof-courtyard.webp"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="heritage-proof-backdrop pointer-events-none -z-10 object-cover"
        />
        <div className="heritage-proof-wash pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page relative">
          <div className="heritage-proof-intro mb-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
            <div className="temple-rule">
              <p className="section-kicker">Why this category can scale</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-maroon-deep lg:text-5xl">
                A focused kids&apos; ceremony house, built to grow without losing its roots.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-charcoal/68">
                The collection starts with South Indian girls&apos; occasion wear, then grows through fit, service, and
                a recognizable craft language.
              </p>
            </div>
            <div className="heritage-proof-stage">
              <div className="heritage-scale-panel relative overflow-hidden rounded-md border border-gold/40 p-5 shadow-sari">
                <div className="silk-loom" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="relative grid gap-0 sm:grid-cols-3">
                  {scaleSignals.map((signal) => (
                    <div key={signal.label} className="heritage-scale-signal p-4">
                      <p className="font-display text-3xl font-semibold leading-none text-gold-pale">{signal.value}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">{signal.label}</p>
                      <p className="mt-2 text-xs leading-5 text-white/68">{signal.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <HeritageInventoryRotator products={rotatingInventory} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, title, copy }, index) => (
              <article
                key={title}
                className={`heritage-pillar group relative overflow-hidden rounded-md border p-7 transition hover:-translate-y-1 hover:shadow-sari ${index === 0 ? "heritage-pillar--feature md:col-span-2" : ""}`}
              >
                <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
                <h3 className="mt-5 font-display text-3xl font-semibold leading-tight text-maroon-deep">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-charcoal/66">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-amzira" className="heritage-craftsmanship-section relative isolate overflow-hidden py-9 lg:py-[3.125rem]">
        <div className="heritage-craftsmanship-pattern pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-page">
          <div className="heritage-craftsmanship-layout grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <figure className="heritage-weaver-figure relative overflow-hidden rounded-md border border-gold/55 shadow-sari">
              <Image
                src="/images/heritage/heritage-master-weaver.webp"
                alt="A South Indian master weaver crafting maroon and gold silk on a traditional handloom"
                fill
                unoptimized
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
              <div className="heritage-weaver-shade absolute inset-0" />
              <figcaption className="heritage-weaver-plaque absolute bottom-5 left-5 right-5 rounded-md border border-gold/45 p-5 text-white sm:left-8 sm:right-auto sm:max-w-sm sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="heritage-weaver-seal grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/55">
                    <Sprout className="h-7 w-7 text-gold-pale" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-semibold leading-tight">Rooted in tradition. Woven for tomorrow.</p>
                    <p className="mt-2 text-xs leading-5 text-white/76">Celebrating the artistry of South Indian heritage.</p>
                  </div>
                </div>
              </figcaption>
            </figure>

            <div className="heritage-craftsmanship-copy">
              <p className="section-kicker">Why AMZIRA</p>
              <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.04] text-maroon-deep lg:text-6xl">
                Crafted for weddings.<br />Designed for generations.
              </h2>
              <div className="heritage-gold-divider mt-6" aria-hidden="true"><span /></div>
              <p className="mt-6 max-w-2xl text-base leading-8 text-charcoal/72 lg:text-lg">
                A legacy of South Indian craftsmanship, reimagined for modern celebrations.
              </p>

              <div className="heritage-standards-grid mt-7 grid sm:grid-cols-2 xl:grid-cols-4">
                {craftsmanshipStandards.map(({ icon: Icon, title, copy }) => (
                  <article key={title} className="heritage-standard-card">
                    <span className="heritage-standard-icon grid h-14 w-14 place-items-center rounded-full border border-gold/55">
                      <Icon className="h-7 w-7 text-gold-dark" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-maroon-deep">{title}</h3>
                    <span className="heritage-standard-rule mt-3" aria-hidden="true" />
                    <p className="mt-3 text-xs leading-5 text-charcoal/68">{copy}</p>
                  </article>
                ))}
              </div>

              <div className="heritage-craftsmanship-actions mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link href="#craft" className="btn-primary group min-w-64 gap-3 shadow-sari">
                  Explore our craft <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <div className="flex items-center gap-3 text-charcoal">
                  <ShieldCheck className="h-9 w-9 shrink-0 text-gold-dark" aria-hidden="true" />
                  <p className="text-xs leading-5"><strong className="block text-sm">Purchase protection</strong>Secure payments · Easy returns · Order tracking</p>
                </div>
              </div>
            </div>
          </div>

          <div className="heritage-craftsmanship-proof mt-10 grid grid-cols-2 lg:grid-cols-4">
            {craftsmanshipProofs.map(({ icon: Icon, value, label }) => (
              <div key={label} className="heritage-craftsmanship-proof-item flex items-center justify-center gap-4 px-5 py-4">
                <Icon className="h-8 w-8 text-maroon" aria-hidden="true" />
                <p><strong className="block font-display text-xl text-maroon-deep">{value}</strong><span className="text-xs text-charcoal/68">{label}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="craft" className="relative isolate overflow-hidden bg-ivory py-10 lg:py-[3.6rem]">
        <Image
        src="/images/heritage/craft-route-background.webp"
        alt=""
        fill
        unoptimized
        sizes="100vw"
          className="pointer-events-none -z-10 object-cover opacity-95"
        />
        <div className="absolute inset-0 -z-10 bg-white/72" />
        <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-white to-transparent" />

        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="temple-rule lg:sticky lg:top-32">
            <p className="section-kicker">The craft route</p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-tight text-maroon-deep lg:text-6xl">
              Every garment follows the ceremony before it follows the sketch.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-charcoal/70">
              Our process is built around how South Indian celebrations actually unfold: bright morning rituals,
              movement-heavy evenings, heirloom portraits, and coordinated family dressing.
            </p>
            {inventoryHighlight ? (
              <Link
                href={`/product/${inventoryHighlight.slug}`}
                className="group mt-8 grid overflow-hidden rounded-md border border-gold/45 bg-white/88 shadow-sari transition hover:-translate-y-1 hover:shadow-soft focus-ring sm:grid-cols-[150px_minmax(0,1fr)]"
              >
                <div className="relative aspect-[4/5] bg-sandal sm:aspect-auto">
                  <Image
                  src={inventoryHighlight.primaryImage}
                  alt={inventoryHighlight.name}
                  fill
                  unoptimized={inventoryHighlight.primaryImage.startsWith("/images/") || inventoryHighlight.primaryImage.startsWith("https://cdn.amzira.com/")}
                  sizes="(min-width: 640px) 150px, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="min-w-0 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-maroon">Inventory highlight</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-maroon-deep">
                    {inventoryHighlight.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-bold text-maroon">{formatMoney(inventoryHighlight.salePrice)}</span>
                    {inventoryHighlight.basePrice > inventoryHighlight.salePrice ? (
                      <span className="text-sm text-charcoal/55 line-through">{formatMoney(inventoryHighlight.basePrice)}</span>
                    ) : null}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-charcoal transition group-hover:text-maroon">
                    View outfit <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ) : null}
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-gold via-maroon to-peacock md:block" />
            <div className="space-y-5">
              {craftSteps.map((step, index) => (
                <article key={step.title} className="relative rounded-md border border-charcoal/10 bg-white/88 p-6 shadow-sm backdrop-blur-sm md:ml-14">
                  <span className="absolute -left-[4.45rem] top-6 hidden h-10 w-10 place-items-center rounded-full border border-gold bg-white text-xs font-bold text-maroon shadow-sm md:grid">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-4xl font-semibold text-charcoal">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal/68">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-maroon-deep py-10 text-white lg:py-[3.6rem]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.16)_0_1px,transparent_1px_28px),linear-gradient(120deg,rgba(11,79,108,0.34),transparent_58%)]" />
        <div className="container-page relative grid gap-9 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div>
            <p className="section-kicker text-gold-pale">Wedding procession</p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight text-white lg:text-6xl">
              The old homepage ritual, restored as a cinematic pause.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">
              The procession is a reminder that AMZIRA is not only selling occasion wear. It is dressing the public
              memory of a family day.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-md border border-gold/50 bg-charcoal shadow-sari">
            <video
              className="aspect-video h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/images/heritage/heritage-hero-backdrop.webp"
            >
              <source src="/images/animations/royal-wedding-procession-cinematic.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/46 to-transparent" />
          </div>
        </div>
      </section>

      <section className="heritage-archive-section py-10 lg:py-[3.6rem]">
        <div className="heritage-archive-backdrop" aria-hidden="true">
          <Image
            src="/images/heritage/heritage-archive-atelier.webp"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="heritage-archive-wash pointer-events-none absolute inset-0" />
        <div className="container-page">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="temple-rule max-w-3xl">
              <p className="section-kicker">Atelier archive</p>
              <h2 className="mt-3 font-display text-5xl font-semibold leading-tight text-maroon-deep lg:text-6xl">
                A living archive for celebration wardrobes.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal/68">
                Built for customers who compare silhouette, occasion, color, delivery, and styling before they commit.
              </p>
            </div>
            <div className="heritage-growth-rail grid gap-0 sm:grid-cols-3">
              {growthCards.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="heritage-growth-item p-4">
                  <span className="heritage-growth-icon grid h-10 w-10 place-items-center rounded-full">
                    <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-charcoal">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-charcoal/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="heritage-archive-grid grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`heritage-editorial-card group relative overflow-hidden rounded-md border border-gold/35 bg-sandal focus-ring ${item.className}`}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  unoptimized={item.image.startsWith("/images/") || item.image.startsWith("https://cdn.amzira.com/")}
                  sizes={item.className ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 100vw"}
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="heritage-editorial-shade absolute inset-0" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white lg:p-7">
                  <p className="heritage-editorial-label text-[10px] font-bold uppercase tracking-[0.2em] text-gold-pale">{item.label}</p>
                  <span className="heritage-editorial-rule mt-2" aria-hidden="true" />
                  <h3 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-[1.08] lg:text-4xl">{item.title}</h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                    {item.cta} <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      <section className="heritage-promise-section text-white">
        <div className="heritage-promise-image absolute inset-y-0 right-0 w-full lg:w-[40%]">
          <Image
          src="/images/heritage/heritage-hero-backdrop.webp"
          alt="Warm South Indian temple courtyard decorated with brass lamps and ceremonial flowers"
          fill
          unoptimized
          sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover object-[74%_center]"
          />
          <div className="heritage-promise-image-shade absolute inset-0" />
        </div>
        <div className="heritage-promise-green absolute inset-y-0 left-0 w-full lg:w-[68%]" aria-hidden="true">
          <svg
            className="heritage-promise-temple-edge"
            viewBox="0 0 150 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="heritage-promise-temple-edge-fill"
              d="M0 0H38C76 0 86 34 78 58C72 78 98 88 112 110C132 142 112 166 86 182C70 193 72 215 96 228C128 246 138 278 115 302C92 326 70 334 84 365C98 397 126 408 116 443C110 464 84 476 78 500C70 530 64 562 20 600H0Z"
            />
            <path
              className="heritage-promise-temple-edge-line"
              d="M38 0C76 0 86 34 78 58C72 78 98 88 112 110C132 142 112 166 86 182C70 193 72 215 96 228C128 246 138 278 115 302C92 326 70 334 84 365C98 397 126 408 116 443C110 464 84 476 78 500C70 530 64 562 20 600"
            />
          </svg>
        </div>
        <div className="container-page heritage-promise-layout relative grid gap-8 py-9 lg:min-h-[450px] lg:items-center lg:py-7">
          <div className="heritage-promise-card heritage-promise-frame relative p-7 lg:p-9">
            <span className="heritage-promise-inner-frame" aria-hidden="true" />
            <div className="heritage-promise-quote-ornament flex items-center gap-4">
              <Gem className="h-10 w-10 shrink-0 text-gold" aria-hidden="true" />
              <span />
              <i />
              <span />
            </div>
            <p className="mt-7 font-display text-3xl font-semibold leading-[1.23] text-gold-pale">
              Luxury is the quiet confidence that every fold has been considered.
            </p>
            <div className="heritage-promise-quote-footer mt-8" aria-hidden="true"><span /><i /><span /></div>
          </div>
          <div className="heritage-promise-copy">
            <div className="heritage-promise-kicker" aria-label="The promise">
              <span /><p>The promise</p><Sprout className="h-5 w-5" aria-hidden="true" /><span />
            </div>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-[1.08] lg:text-[3.35rem]">
              Heritage should feel<br />wearable, not<br />museum-kept.
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/78 lg:text-base lg:leading-8">
              AMZIRA keeps the codes of South Indian celebration visible while making the shopping experience clear,
              photographed, searchable, and ready for today&apos;s wedding calendar.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
