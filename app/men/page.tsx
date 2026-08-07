import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Men's Wedding Wear",
  description: "Shop AMZIRA men's sherwanis, kurta jacket sets, and wedding guest occasion wear.",
  path: "/men"
});

export default function MenPage() {
  return (
    <section className="container-page py-16">
      <p className="section-kicker">Men</p>
      <h1 className="mt-3 max-w-3xl font-display text-6xl text-maroon-deep">Wedding wear for groom, family, and guests.</h1>
      <p className="mt-5 max-w-2xl leading-8 text-charcoal/70">
        The men&apos;s catalog is ready for backend inventory expansion. Start with sherwani, kurta jacket, and Indo Western ceremony edits.
      </p>
      <Link href="/appointments" className="btn-primary mt-8">Plan men&apos;s looks</Link>
    </section>
  );
}
