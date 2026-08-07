import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <section className="container-page py-16 text-center">
      <p className="section-kicker">Payment not completed</p>
      <h1 className="mx-auto mt-3 max-w-3xl font-display text-6xl text-maroon-deep">Your cart is still safe.</h1>
      <p className="mx-auto mt-5 max-w-xl leading-8 text-charcoal/70">No payment was captured. Review your cart and try checkout again when ready.</p>
      <Link href="/checkout" className="btn-primary mt-8">Retry checkout</Link>
    </section>
  );
}
