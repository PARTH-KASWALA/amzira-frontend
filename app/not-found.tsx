import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-page grid min-h-[55svh] place-items-center py-16">
      <div className="max-w-2xl border-y border-charcoal/10 py-12 text-center">
        <p className="text-sm font-semibold text-maroon">404</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-maroon-deep sm:text-6xl">This style has moved.</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-charcoal/68">
          Explore the current girls&apos; ceremony collection or search for a specific lehenga choli.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" href="/category/kids-pattu-pavadai">Shop girls&apos; styles</Link>
          <Link className="btn-secondary gap-2" href="/search">
            <Search className="h-4 w-4" aria-hidden="true" /> Search
          </Link>
        </div>
      </div>
    </section>
  );
}
