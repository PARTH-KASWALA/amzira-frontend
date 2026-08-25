import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Order confirmed", path: "/order-success", noIndex: true });

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <section className="container-page py-16 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald" aria-hidden="true" />
      <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl font-semibold text-maroon-deep sm:text-6xl">Your celebration look is reserved.</h1>
      <p className="mx-auto mt-5 max-w-xl leading-8 text-charcoal/70">Payment was verified and your order is now in AMZIRA&apos;s care.</p>
      {order ? <p className="mx-auto mt-5 w-fit rounded-md bg-sandal px-5 py-3 text-sm font-bold text-charcoal">Order {order}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={order ? `/order-tracking?order=${encodeURIComponent(order)}` : "/account"} className="btn-primary">Track order</Link>
        <Link href="/account" className="btn-secondary">View account</Link>
      </div>
    </section>
  );
}
