import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cart",
  description: "Review your AMZIRA cart before secure checkout.",
  path: "/cart",
  noIndex: true
});

export default function CartPage() {
  return (
    <section className="container-page py-12">
      <p className="section-kicker">Cart</p>
      <h1 className="mt-3 font-display text-6xl text-maroon-deep">Your ceremony bag</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </section>
  );
}
