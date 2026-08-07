import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <section className="container-page py-16 text-center">
      <p className="section-kicker">Order placed</p>
      <h1 className="mx-auto mt-3 max-w-3xl font-display text-6xl text-maroon-deep">Your celebration look is reserved.</h1>
      <p className="mx-auto mt-5 max-w-xl leading-8 text-charcoal/70">We will send order updates and delivery information to your registered contact details.</p>
      <Link href="/account" className="btn-primary mt-8">View account</Link>
    </section>
  );
}
