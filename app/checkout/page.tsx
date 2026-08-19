import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { CartView } from "@/components/cart-view";
import { buildMetadata } from "@/lib/seo";
import { Award, CheckCircle2, Lock, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Secure Checkout",
  description: "Complete your AMZIRA checkout with delivery address, contact details, and secure payment.",
  path: "/checkout"
});

export default function CheckoutPage() {
  return (
    <div className="bg-[#FDFAF5] py-8 sm:py-12 min-h-[calc(100vh-200px)]">
      <section className="container-page space-y-8">
        {/* Checkout Stepper */}
        <div className="mx-auto max-w-2xl">
          <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
            <li className="flex items-center gap-2 text-emerald">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald text-white text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="hidden sm:inline">1. Bag</span>
            </li>
            <li className="h-0.5 flex-1 bg-gradient-to-r from-emerald to-maroon" />
            <li className="flex items-center gap-2 text-maroon-deep font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#580B26] text-white text-xs font-bold shadow-xs">
                2
              </span>
              <span>2. Delivery Address</span>
            </li>
            <li className="h-0.5 flex-1 bg-amber-900/15" />
            <li className="flex items-center gap-2 text-charcoal/40">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-charcoal/20 bg-white text-xs">
                3
              </span>
              <span className="hidden sm:inline">3. Payment</span>
            </li>
            <li className="h-0.5 flex-1 bg-amber-900/15" />
            <li className="flex items-center gap-2 text-charcoal/40">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-charcoal/20 bg-white text-xs">
                4
              </span>
              <span className="hidden sm:inline">4. Confirmation</span>
            </li>
          </ol>
        </div>

        {/* Royal Page Header & Lotus Ornament */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-800" /> AMZIRA Royal Atelier Checkout
          </div>
          <h1 className="font-display text-4xl font-semibold text-maroon-deep sm:text-5xl lg:text-6xl tracking-tight">
            Secure checkout
          </h1>

          {/* Lotus Line Art Ornament Divider */}
          <div className="flex items-center gap-3 my-3 w-48">
            <div className="h-px bg-gradient-to-r from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5 text-amber-800/60 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 3C12 3 8.5 7.5 8.5 12C8.5 14.5 10 16.5 12 17C14 16.5 15.5 14.5 15.5 12C15.5 7.5 12 3 12 3Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C9.5 17 4 14 4 11C4 9.5 5.5 8.5 7 9C9 9.5 10.5 11.5 12 17Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C14.5 17 20 14 20 11C20 9.5 18.5 8.5 17 9C15 9.5 13.5 11.5 12 17Z"
                stroke="currentColor"
              />
            </svg>
            <div className="h-px bg-gradient-to-l from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
          </div>

          <p className="text-sm sm:text-base leading-6 text-charcoal/70">
            Handcrafted South Indian Silk & Zari for your little princess. Verified stock & instant secure payment.
          </p>
        </div>

        {/* Royal Trust Assurances Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-amber-900/10 bg-[#FAF7F2] p-4 text-xs font-semibold text-charcoal/80">
          <div className="flex items-center justify-center gap-2.5 text-center sm:text-left">
            <Award className="h-4 w-4 text-maroon shrink-0" />
            <span>Pure Handcrafted South Indian Silk & Zari</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-center sm:text-left border-y sm:border-y-0 sm:border-x border-amber-900/10 py-2 sm:py-0 px-2">
            <Truck className="h-4 w-4 text-maroon shrink-0" />
            <span>Free Express Shipping on Orders Above ₹1,999</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-center sm:text-left">
            <Lock className="h-4 w-4 text-maroon shrink-0" />
            <span>36-Hour Returns & Fit Guidance for Growing Kids</span>
          </div>
        </div>

        {/* Main Checkout Form & Summary Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <CheckoutForm />
          <CartView checkout />
        </div>
      </section>
    </div>
  );
}
