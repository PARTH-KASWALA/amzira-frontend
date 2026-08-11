import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/lib/catalog";
import { comingSoonPath, LIVE_CATEGORY_PATH } from "@/lib/storefront";

const futureCollections = [
  {
    name: "Women",
    href: comingSoonPath("women"),
    image: "/images/occasions/bride.webp"
  },
  {
    name: "Men",
    href: comingSoonPath("men"),
    image: "/images/occasions/sherwani.webp"
  },
  {
    name: "Boys",
    href: comingSoonPath("kids-boys"),
    image: "/images/footer/heritage-illustration-footer.webp"
  }
];

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const activeCategory = categories[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
      <Link
        href={LIVE_CATEGORY_PATH}
        className="focus-ring group relative min-h-[460px] overflow-hidden rounded-md bg-charcoal text-white shadow-soft md:col-span-2 xl:col-span-6"
      >
        <Image
          src={activeCategory?.imageUrl || "/images/hero-upgrade/green-kids-lehenga-front.webp"}
          alt={activeCategory?.name || "South Indian kids lehenga choli"}
          fill
          sizes="(min-width: 1280px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/92 via-charcoal/18 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="section-kicker text-gold-pale">Available now</p>
          <h3 className="mt-3 max-w-lg font-display text-4xl font-semibold leading-none sm:text-5xl">
            {activeCategory?.name || "South Indian Kids Lehenga Choli"}
          </h3>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-gold-pale">
            Shop the collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>

      {futureCollections.map((collection) => (
        <Link
          key={collection.name}
          href={collection.href}
          className="focus-ring group relative min-h-[300px] overflow-hidden rounded-md bg-charcoal text-white shadow-soft xl:col-span-2 xl:min-h-[460px]"
        >
          <Image
            src={collection.image}
            alt={`${collection.name} collection preview`}
            fill
            sizes="(min-width: 1280px) 17vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-80 grayscale-[18%] transition duration-700 group-hover:scale-[1.04] group-hover:opacity-68"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-pale">Coming soon</p>
            <h3 className="mt-2 font-display text-4xl font-semibold leading-none">{collection.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
