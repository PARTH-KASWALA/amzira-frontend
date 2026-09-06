import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { sizeChartRows } from "@/lib/size-chart";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pattu Pavadai Size Guide for Girls",
  description: "Use AMZIRA’s girls’ pattu pavadai size guide to compare age bands, choli measurements, lehenga length, waist, and ghera before ordering.",
  path: "/guides/pattu-pavadai-size-guide"
});

export default function PattuPavadaiSizeGuidePage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Pattu Pavadai Size Guide", path: "/guides/pattu-pavadai-size-guide" }
      ])} />
      <section className="container-page py-14 sm:py-20">
        <div className="max-w-4xl">
          <p className="section-kicker">Fit guide</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.02] text-maroon-deep sm:text-7xl">Pattu Pavadai Size Guide for Girls</h1>
          <p className="mt-6 text-base leading-8 text-charcoal/70">
            Start with your child’s measurements, then compare them with the product’s available variant and garment measurements. Age is a helpful starting point, but children grow at different rates, so chest, waist, shoulder, and length are the better final check.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-charcoal/10 bg-white shadow-soft">
          <table className="min-w-[980px] w-full border-collapse text-left text-sm">
            <caption className="sr-only">AMZIRA girls’ pattu pavadai size chart in inches</caption>
            <thead className="bg-sandal text-xs uppercase tracking-[0.12em] text-maroon-deep">
              <tr>
                <th className="p-4">Size</th><th className="p-4">Age</th><th className="p-4">Choli length</th><th className="p-4">Choli chest</th><th className="p-4">Shoulder</th><th className="p-4">Choli waist</th><th className="p-4">Lehenga length</th><th className="p-4">Lehenga waist</th><th className="p-4">Ghera</th>
              </tr>
            </thead>
            <tbody>
              {sizeChartRows.map((row) => (
                <tr className="border-t border-charcoal/10" key={row.size}>
                  <td className="p-4 font-semibold text-maroon">{row.size}</td><td className="p-4">{row.age}</td><td className="p-4">{row.choliLength}&quot;</td><td className="p-4">{row.choliChest}&quot;</td><td className="p-4">{row.choliShoulder}&quot;</td><td className="p-4">{row.choliWaist}&quot;</td><td className="p-4">{row.lehengaLength}&quot;</td><td className="p-4">{row.lehengaWaist}&quot;</td><td className="p-4">{row.lehengaGhera}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid max-w-5xl gap-8 border-t border-charcoal/10 pt-9 md:grid-cols-3">
          <section><h2 className="font-display text-2xl text-maroon-deep">Measure the child</h2><p className="mt-3 text-sm leading-7 text-charcoal/70">Measure over a thin garment. Keep the tape level and comfortable, without pulling it tight.</p></section>
          <section><h2 className="font-display text-2xl text-maroon-deep">Compare the product</h2><p className="mt-3 text-sm leading-7 text-charcoal/70">Product pages should be checked for the live size options, exact measurements, lining, and fit notes for that particular style.</p></section>
          <section><h2 className="font-display text-2xl text-maroon-deep">Need help?</h2><p className="mt-3 text-sm leading-7 text-charcoal/70">If the child falls between sizes, contact AMZIRA support before ordering and share the measurements needed for a recommendation.</p></section>
        </div>

        <Link className="btn-primary mt-10" href="/category/kids-pattu-pavadai">Shop girls’ pattu pavadai</Link>
      </section>
    </>
  );
}
