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
import { type HeroProduct } from "@/components/product-slide";
import { type LuxuryCard } from "@/components/luxury-card-grid";
import { getCategories, getFeaturedProducts, getProduct, getProducts } from "@/lib/api";
import { type Product, type ProductImage } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { comingSoonPath, LIVE_CATEGORY_PATH } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const defaultOccasionEdits = [
  {
    name: "Wedding day silk",
    copy: "Temple borders and soft layers for a full day of celebration.",
    href: LIVE_CATEGORY_PATH,
    image: "/images/hero-upgrade/green-kids-lehenga-front.webp",
    icon: Crown
  },
  {
    name: "Puja morning",
    copy: "Emerald silk and maroon detail made for comfortable movement.",
    href: LIVE_CATEGORY_PATH,
    image: "/images/hero-upgrade/green-kids-lehenga-side.webp",
    icon: Sparkles
  },
  {
    name: "Festival color",
    copy: "Royal blue checks and antique gold for family festivities.",
    href: LIVE_CATEGORY_PATH,
    image: "/images/hero-upgrade/blue-kids-lehenga-front.webp",
    icon: Music2
  },
  {
    name: "Family celebrations",
    copy: "A graceful flare for photos, play, and every happy ritual.",
    href: LIVE_CATEGORY_PATH,
    image: "/images/hero-upgrade/blue-kids-lehenga-side.webp",
    icon: UsersRound
  }
];

const shoppingPaths = [
  { label: "South Indian girls' lehenga", icon: Crown, href: LIVE_CATEGORY_PATH },
  { label: "Kanjeevaram-inspired kids' silk", icon: Gem, href: LIVE_CATEGORY_PATH },
  { label: "Temple border lehenga choli", icon: Sparkles, href: LIVE_CATEGORY_PATH },
  { label: "Wedding outfits for girls", icon: UsersRound, href: LIVE_CATEGORY_PATH },
  { label: "Pattu pavadai sets", icon: Music2, href: LIVE_CATEGORY_PATH },
  { label: "Boys' festive wear", icon: HandHeart, href: comingSoonPath("kids-boys") }
];

const heroThemes: HeroProduct["theme"][] = ["peacock", "maroon", "gold", "emerald", "rose", "blue"];
const detailTones = ["maroon", "emerald", "blue"] as const;
const heroGradients = [
  {
    gradient: "linear-gradient(110deg, #24080f 0%, #7f1735 34%, #0c6c70 70%, #18080a 100%)",
    accent: "#0c6c70"
  },
  {
    gradient: "linear-gradient(110deg, #21090c 0%, #8c1b2f 38%, #b68a2e 74%, #17090a 100%)",
    accent: "#8c1b2f"
  },
  {
    gradient: "linear-gradient(110deg, #261006 0%, #95640e 38%, #182b63 74%, #130a08 100%)",
    accent: "#b68a2e"
  },
  {
    gradient: "linear-gradient(110deg, #160d07 0%, #6b2416 34%, #0f6548 72%, #120a08 100%)",
    accent: "#0f6548"
  }
];

function uniqueInventory(products: Product[]) {
  const seenImages = new Set<string>();
  return products.filter((product) => {
    if (product.inStock === false || !product.primaryImage || seenImages.has(product.primaryImage)) {
      return false;
    }
    seenImages.add(product.primaryImage);
    return true;
  });
}

function shuffleInventory<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function diversifyInventory(products: Product[]) {
  const groups = new Map<string, Product[]>();

  shuffleInventory(products).forEach((product) => {
    const designFamily = product.subcategorySlug || product.subcategoryName || product.categorySlug;
    const group = groups.get(designFamily) || [];
    group.push(product);
    groups.set(designFamily, group);
  });

  const randomizedGroups = shuffleInventory([...groups.values()]);
  const diversified: Product[] = [];
  const largestGroupSize = Math.max(0, ...randomizedGroups.map((group) => group.length));

  for (let productIndex = 0; productIndex < largestGroupSize; productIndex += 1) {
    randomizedGroups.forEach((group) => {
      const product = group[productIndex];
      if (product) diversified.push(product);
    });
  }

  return diversified;
}

function homeProductAt(products: Product[], index: number) {
  return products[index % products.length];
}

const heroTitlePriorityWords = [
  "Jacquard",
  "Temple",
  "Peacock",
  "Koti",
  "Checked",
  "Heritage",
  "Festive",
  "Gold",
  "Satin"
];

function conciseHeroTitle(name: string) {
  const normalizedName = name.replace(/\s+\d+(?:-\d+)?$/, "").trim();
  const words = normalizedName.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return normalizedName;

  const tail =
    normalizedName.endsWith("Lehenga Choli")
      ? "Lehenga Choli"
      : normalizedName.endsWith("Pattu Pavadai")
        ? "Pattu Pavadai"
        : "";
  if (!tail) return normalizedName;

  const prefixWords = normalizedName.slice(0, -tail.length).trim().split(/\s+/).filter(Boolean);
  const firstWord = prefixWords[0];
  if (!firstWord) return normalizedName;

  const descriptorWords = prefixWords.slice(1);
  const priorityDescriptor = heroTitlePriorityWords.find((word) =>
    descriptorWords.some((descriptor) => descriptor.toLowerCase() === word.toLowerCase())
  );
  if (priorityDescriptor) return `${firstWord} ${priorityDescriptor} ${tail}`;

  const colorDescriptor = descriptorWords.slice(0, descriptorWords[0]?.length <= 5 ? 2 : 1).join(" ");
  return [firstWord, colorDescriptor, tail].filter(Boolean).join(" ");
}

type HeroDetailKind = "front" | "closure" | "side" | "back" | "outfit" | "choli" | "lengha" | "detail";

type HeroDetailImage = {
  image: string;
  label: string;
  kind: HeroDetailKind;
};

function imageKind(image: ProductImage, fallbackIndex: number): HeroDetailKind {
  const alt = (image.altText || "").toLowerCase();
  const url = image.url.toLowerCase();
  const descriptor = alt.includes(" - ") ? alt.split(" - ").pop() || alt : alt;
  const source = descriptor || url;

  if (source.includes("front_view") || source.includes("front view")) return "front";
  if (source.includes("closure_view") || source.includes("closure view")) return "closure";
  if (source.includes("side_view") || source.includes("side view")) return "side";
  if (source.includes("back_view") || source.includes("back view")) return "back";
  if (source.includes("outfit")) return "outfit";
  if (source.includes("choli")) return "choli";
  if (source.includes("lengha") || source.includes("lehenga")) return "lengha";

  return fallbackIndex === 0 ? "front" : "detail";
}

function heroDetailLabel(kind: HeroDetailKind) {
  switch (kind) {
    case "closure":
      return "Closure";
    case "side":
      return "Side View";
    case "back":
      return "Back View";
    case "outfit":
      return "Outfit";
    case "choli":
      return "Choli";
    case "lengha":
      return "Lehenga";
    case "front":
      return "Front View";
    default:
      return "Detail";
  }
}

function heroDetailFit(kind: HeroDetailKind) {
  return ["outfit", "choli", "lengha"].includes(kind) ? "contain" as const : "cover" as const;
}

function heroDetailImages(product: Product): HeroDetailImage[] | null {
  const gallery = (product.imageDetails?.length
    ? product.imageDetails
    : product.images.map((url, index) => ({ url, altText: null, displayOrder: index, isPrimary: index === 0 }))
  )
    .filter((image, index, images) => image.url && images.findIndex((candidate) => candidate.url === image.url) === index)
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((image, index) => {
      const kind = imageKind(image, index);
      return {
        image: image.url,
        kind,
        label: heroDetailLabel(kind)
      };
    });

  const choli = gallery.find((image) => image.kind === "choli");
  const lengha = gallery.find((image) => image.kind === "lengha");
  if (choli && lengha) return [choli, lengha];

  const detailCandidates = gallery.filter((image) => !["front", "closure"].includes(image.kind));
  const fallbackCandidates = gallery.filter((image) => image.kind !== "front");
  const selected = detailCandidates.length >= 2 ? detailCandidates.slice(-2) : fallbackCandidates.slice(-2);
  return selected.length ? selected : null;
}

function buildHeroSlides(products: Product[]): HeroProduct[] | undefined {
  if (!products.length) return undefined;
  return products.slice(0, 4).map((product, index) => {
    const visual = heroGradients[index % heroGradients.length];
    const title = conciseHeroTitle(product.name);
    const heroDetails = heroDetailImages(product);
    const fallbackImages = [product.primaryImage, ...product.images]
      .filter((image, imageIndex, images) => image && images.indexOf(image) === imageIndex)
      .slice(0, 2);
    const details = heroDetails
      ? heroDetails.map((detail) => ({
          label: detail.label,
          image: detail.image,
          alt: `${product.name} ${detail.label.toLowerCase()} view`,
          fit: heroDetailFit(detail.kind),
          tone: detailTones[index % detailTones.length]
        }))
      : fallbackImages.map((image, detailIndex) => ({
          label: ["Front view", "Detail view"][detailIndex] || "Product view",
          image,
          alt: `${product.name} ${detailIndex + 1}`,
          fit: detailIndex === 0 ? "cover" as const : "contain" as const,
          tone: detailTones[index % detailTones.length]
        }));
    return {
      id: String(product.id || product.slug),
      title,
      price: formatMoney(product.salePrice),
      theme: heroThemes[index % heroThemes.length],
      badge: product.badge || (product.discountPercentage ? `${product.discountPercentage}% off` : "Available now"),
      eyebrow: product.subcategoryName || product.categoryName || "Girls' ceremony wear",
      description: product.description,
      href: `/product/${product.slug}`,
      cta: "Shop this style",
      modelImage: product.primaryImage,
      modelAlt: product.name,
      gradient: visual.gradient,
      accent: visual.accent,
      details
    };
  });
}

function buildLuxuryCards(products: Product[]): LuxuryCard[] | undefined {
  if (products.length < 3) return undefined;
  const titles = ["Best of the inventory", "Ready for celebration", "Color-rich favorites"];
  const ctas = ["Shop this style", "View product", "Explore the look"];
  return products.slice(0, 3).map((product, index) => ({
    title: titles[index],
    description: product.name,
    cta: ctas[index],
    href: `/product/${product.slug}`,
    image: product.primaryImage
  }));
}

function buildOccasionEdits(products: Product[]) {
  if (!products.length) return defaultOccasionEdits;
  return defaultOccasionEdits.map((edit, index) => {
    const product = homeProductAt(products, index);
    return {
      ...edit,
      copy: product.name,
      href: `/product/${product.slug}`,
      image: product.primaryImage
    };
  });
}

export default async function HomePage() {
  const [categories, featuredProducts, allProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProducts({ limit: 100 })
  ]);
  const inventoryProducts = diversifyInventory(uniqueInventory([...featuredProducts, ...allProducts]));
  const heroProducts = await Promise.all(
    inventoryProducts.slice(0, 4).map(async (product) => (await getProduct(product.slug)) || product)
  );
  const luxuryProducts = inventoryProducts.slice(4, 7);
  const collectionProduct = inventoryProducts[7] || inventoryProducts[0];
  const craftProduct = inventoryProducts[8] || inventoryProducts[0];
  const occasionEdits = buildOccasionEdits(inventoryProducts.slice(9));
  const bestsellerProducts = diversifyInventory(inventoryProducts).slice(0, 8);

  return (
    <>
      <HeroCarousel products={buildHeroSlides(heroProducts.length ? heroProducts : inventoryProducts)} />

      <LuxuryCardGrid cards={buildLuxuryCards(luxuryProducts.length >= 3 ? luxuryProducts : inventoryProducts)} />

      <CinematicSection />

      <section className="pattern-section py-16 lg:py-24">
        <div className="container-page pattern-section__content">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="temple-rule">
              <p className="section-kicker">Shop by collection</p>
              <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Girls&apos; ceremony wardrobe</h2>
            </div>
            <Link className="btn-secondary w-fit gap-2 bg-white" href={LIVE_CATEGORY_PATH}>
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <CategoryShowcase categories={categories} featuredProduct={collectionProduct} />
        </div>
      </section>

      <section className="craft-home-section overflow-hidden py-14 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-charcoal shadow-sari sm:min-h-[520px] lg:min-h-[560px]">
            <Image
              src={craftProduct?.primaryImage || "/images/hero-upgrade/green-kids-lehenga-front.webp"}
              alt={craftProduct?.name || "Girl wearing an emerald South Indian lehenga choli with a temple border"}
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
                    Crafted for her brightest memories.
                  </p>
                  <p className="mt-2 text-xs font-medium leading-5 text-charcoal/68">
                    Rooted in tradition. Comfortable all day.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="craft-title-rule mb-6" aria-hidden="true">
              <span />
            </div>
            <p className="section-kicker">Her first Amzira</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.06] text-maroon-deep sm:text-5xl lg:text-6xl">
              South Indian heritage for little celebration days.
            </h2>
            <div className="my-7 h-px w-56 bg-gradient-to-r from-gold via-maroon to-transparent" />
            <p className="max-w-2xl text-base leading-8 text-charcoal/70">
              Girls&apos; lehenga choli and pattu pavadai with vivid silk color, traditional borders, and kid-friendly comfort.
            </p>
            <Link
              href="/search"
              className="focus-ring mt-8 flex min-h-[64px] min-w-0 items-center gap-4 rounded-full border border-charcoal/10 bg-white px-5 text-charcoal shadow-soft transition hover:border-maroon/35 hover:shadow-sari"
            >
              <Search className="h-6 w-6 shrink-0 text-maroon" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm text-charcoal/58 sm:text-base">
                Search girls&apos; lehenga choli, pattu pavadai...
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
                  href={path.href}
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

      <ProcessionGifSection />

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
            <Link className="btn-secondary w-fit gap-2" href={LIVE_CATEGORY_PATH}>
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

      <section className="pattern-section py-16 lg:py-24">
        <div className="container-page pattern-section__content">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Bestsellers</p>
              <h2 className="mt-2 font-display text-5xl font-semibold text-maroon-deep">Girls&apos; celebration favorites</h2>
            </div>
            <Link className="btn-secondary w-fit bg-white" href={LIVE_CATEGORY_PATH}>
              Girls&apos; collection
            </Link>
          </div>
          <ProductGrid products={bestsellerProducts} />
        </div>
      </section>

      <ParentsLoveSection />

    </>
  );
}
