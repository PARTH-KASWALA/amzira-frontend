import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { OrderTracking } from "@/components/order-tracking";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Track your order", path: "/order-tracking", noIndex: true });

export default function OrderTrackingPage() {
  return (
    <div className="relative isolate min-h-[calc(100vh-200px)] overflow-hidden bg-[#FDFAF5] py-10 sm:py-14">
      <Image
        src="/images/backgrounds/kids-silk-procession.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="pointer-events-none absolute inset-x-0 top-0 z-[-2] h-[42rem] object-cover object-[center_top] opacity-75 sm:h-[47rem]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[-1] h-[44rem] bg-[linear-gradient(180deg,rgba(255,250,241,0.25)_0%,rgba(253,250,245,0.78)_68%,#fdfaf5_100%)] sm:h-[49rem]" />

      <section className="container-page relative">
        {/* Page Title & South Indian Lotus Ornament Header */}
        <div className="flex flex-col items-start max-w-2xl">
          <h1 className="font-display text-4xl font-semibold text-maroon-deep sm:text-5xl lg:text-6xl tracking-tight">
            Track your order
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
            Use the order reference from your confirmation or open an order from your account.
          </p>
        </div>

        {/* Order Tracking Main Card & Features Grid */}
        <div className="mt-8">
          <Suspense
            fallback={
              <div
                className="h-80 animate-pulse rounded-3xl bg-amber-900/5 border border-amber-900/10"
                aria-label="Loading tracking"
              />
            }
          >
            <OrderTracking />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
