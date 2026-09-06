import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Girls’ Lehenga Choli Fit Guide",
  description: "Learn how to choose a comfortable South Indian girls’ lehenga choli by age, measurements, lining, length, waist, and occasion.",
  path: "/guides/girls-lehenga-fit-guide"
});

export default function GirlsLehengaFitGuidePage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Girls’ Lehenga Fit Guide", path: "/guides/girls-lehenga-fit-guide" }
      ])} />
      <section className="container-page py-14 sm:py-20">
        <div className="max-w-4xl">
          <p className="section-kicker">Fit guide</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.02] text-maroon-deep sm:text-7xl">Girls’ Lehenga Choli Fit Guide</h1>
          <p className="mt-6 text-base leading-8 text-charcoal/70">
            A comfortable lehenga choli should give a child room to sit, walk, play, and enjoy the ceremony. Use age as a starting point, then confirm the garment measurements and the product’s size recommendation.
          </p>
        </div>

        <div className="mt-10 grid max-w-5xl gap-8 md:grid-cols-2">
          {[
            ["Start with the waist", "The lehenga waist should sit comfortably without digging in. Check whether the style uses an elastic, drawstring, hook, or adjustable closure."],
            ["Check choli measurements", "Compare chest, shoulder, and choli length with a well-fitting garment your child already wears. This is more reliable than age alone."],
            ["Allow movement", "For weddings and festivals, choose a fit that allows sitting and walking. A little ease is usually more comfortable than a close fit."],
            ["Review the lining", "Look for the product’s lining and fabric notes, especially when the outfit will be worn for several hours or by a child with sensitive skin."],
            ["Match the occasion", "Temple ceremonies may suit a classic border and lighter construction, while weddings and receptions may call for richer zari or layered detail."],
            ["Confirm delivery and returns", "Before adding to cart, check the pincode estimate, dispatch timing, exchange eligibility, and the return policy shown for the product." ]
          ].map(([title, body]) => (
            <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-soft" key={title}>
              <h2 className="font-display text-2xl text-maroon-deep">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/70">{body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-gold/30 bg-sandal/60 p-6 sm:p-8">
          <h2 className="font-display text-3xl text-maroon-deep">Still unsure between two sizes?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-charcoal/70">Use the exact measurements on the product page and contact the AMZIRA support team before ordering. A clear fit conversation is better than guessing from age alone.</p>
        </div>
        <Link className="btn-primary mt-10" href="/collections/south-indian-girls-lehenga-choli">Shop South Indian girls’ lehenga choli</Link>
      </section>
    </>
  );
}
