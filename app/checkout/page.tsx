import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { CartView } from "@/components/cart-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Secure Checkout",
  description: "Complete your AMZIRA checkout with delivery address, contact details, and secure payment.",
  path: "/checkout"
});

export default function CheckoutPage() {
  return (
    <section className="container-page py-12">
      <p className="section-kicker">Checkout</p>
      <h1 className="mt-3 font-display text-6xl text-maroon-deep">Secure checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <CheckoutForm />
        <CartView checkout />
      </div>
    </section>
  );
}
