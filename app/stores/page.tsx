import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Store } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Atelier Stores & Boutiques",
  description: "Discover upcoming AMZIRA luxury flagship stores and private styling ateliers across South India.",
  path: "/stores"
});

const storesList = [
  {
    city: "Chennai Flagship Atelier",
    location: "Mylapore Cultural District",
    details: "Private bridal & kids occasionwear styling suite, featuring pure Kanjeevaram weaves and temple border collections.",
    status: "Opening Late 2026",
    highlight: "Primary Flagship"
  },
  {
    city: "Bengaluru Experience Lounge",
    location: "Indiranagar 100ft Road",
    details: "Interactive handloom silk gallery, live drape demonstrations, and kids' comfortable fitting salon.",
    status: "Opening Early 2027",
    highlight: "Experience Lounge"
  },
  {
    city: "Hyderabad Heritage House",
    location: "Jubilee Hills",
    details: "Zari craftsmanship studio, royal kids' lehenga fitting suite, and customized festive wardrobe consultation.",
    status: "Opening Spring 2027",
    highlight: "Custom Studio"
  }
];

export default function StoresPage() {
  return (
    <div className="bg-[#FDFAF5] py-10 sm:py-16 min-h-[calc(100vh-200px)]">
      <section className="container-page space-y-12">
        {/* Page Header & Lotus Ornament */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2">
            <Store className="h-3.5 w-3.5 text-amber-800" /> Physical Boutiques & Experience Centers
          </div>
          <h1 className="font-display text-4xl font-semibold text-maroon-deep sm:text-5xl lg:text-6xl tracking-tight">
            AMZIRA Atelier Stores
          </h1>

          {/* Lotus Line Art Ornament Divider */}
          <div className="flex items-center gap-3 my-3 w-48">
            <div className="h-px bg-gradient-to-r from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5 text-amber-800/60 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 3C12 3 8.5 7.5 8.5 12C8.5 14.5 10 16.5 12 17C14 16.5 15.5 14.5 15.5 12C15.5 7.5 12 3 12 3Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C9.5 17 4 14 4 11C4 9.5 5.5 8.5 7 9C9 9.5 10.5 11.5 12 17Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C14.5 17 20 14 20 11C20 9.5 18.5 8.5 17 9C15 9.5 13.5 11.5 12 17Z"
                stroke="currentColor"
              />
            </svg>
            <div className="h-px bg-gradient-to-l from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
          </div>

          <p className="text-sm sm:text-base leading-6 text-charcoal/70">
            Our flagship experience stores and private appointment ateliers are preparing to welcome you across key South Indian cultural capitals.
          </p>
        </div>

        {/* Flagship Stores Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {storesList.map((store) => (
            <article
              key={store.city}
              className="flex flex-col justify-between rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-6 sm:p-8 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-maroon-soft px-3 py-1 text-[11px] font-bold text-maroon-deep border border-maroon/20">
                    {store.highlight}
                  </span>
                  <span className="text-xs font-semibold text-emerald">
                    {store.status}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-semibold text-maroon-deep">
                    {store.city}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <MapPin className="h-3.5 w-3.5 text-maroon" /> {store.location}
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-charcoal/70">
                  {store.details}
                </p>
              </div>

              <div className="mt-6 border-t border-amber-900/10 pt-4">
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-2 text-xs font-bold text-maroon hover:underline"
                >
                  Book virtual styling instead <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Virtual Atelier Callout Box */}
        <div className="rounded-3xl border border-amber-900/10 bg-gradient-to-r from-[#580B26] via-[#700018] to-[#580B26] p-8 text-white text-center shadow-lg space-y-4 max-w-3xl mx-auto">
          <Sparkles className="mx-auto h-8 w-8 text-amber-300" />
          <h2 className="font-display text-3xl font-semibold">
            Can&apos;t wait for store opening?
          </h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Our virtual boutique concierge brings the physical store experience to your home. Connect with an AMZIRA stylist for live video drapes and fabric previews.
          </p>
          <div className="pt-2">
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-xs font-bold uppercase tracking-wider text-maroon-deep shadow-md transition hover:bg-amber-50"
            >
              <CalendarDays className="h-4 w-4" /> Book Virtual Appointment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
