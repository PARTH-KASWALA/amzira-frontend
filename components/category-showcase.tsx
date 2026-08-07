import Image from "next/image";
import Link from "next/link";
import { Category } from "@/lib/catalog";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {categories.slice(0, 4).map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="focus-ring group relative min-h-[420px] overflow-hidden rounded-md bg-charcoal text-white shadow-soft"
        >
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="section-kicker text-gold-pale">Shop the edit</p>
            <h3 className="mt-3 font-display text-4xl leading-none">{category.name}</h3>
            <p className="mt-3 line-clamp-2 text-sm text-white/78">{category.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
