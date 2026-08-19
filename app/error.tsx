"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page grid min-h-[55svh] place-items-center py-16">
      <div className="max-w-2xl border-y border-charcoal/10 py-12 text-center">
        <AlertCircle className="mx-auto h-9 w-9 text-maroon" aria-hidden="true" />
        <h1 className="mt-5 font-display text-5xl font-semibold text-maroon-deep">We could not finish that stitch.</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-charcoal/68">
          Your cart and selections are still safe. Try this page again, or return to the girls&apos; collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary gap-2" onClick={reset}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
          <Link className="btn-secondary" href="/category/kids-pattu-pavadai">Browse collection</Link>
        </div>
      </div>
    </section>
  );
}
