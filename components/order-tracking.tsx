"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Check,
  Lock,
  MapPin,
  Package,
  PackageCheck,
  PackageSearch,
  Ruler,
  ShieldCheck,
  Truck
} from "lucide-react";
import { getOrderTracking } from "@/lib/api/orders";

type TrackingStep = { status: string; label: string; completed: boolean; current: boolean };
type TrackingResult = {
  orderNumber: string;
  status: string;
  courier: string;
  location: string;
  expectedDelivery: string;
  trackingUrl: string;
  timeline: TrackingStep[];
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapTracking(value: Record<string, unknown>): TrackingResult {
  const timeline = Array.isArray(value.timeline)
    ? value.timeline.map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          status: stringValue(record.status),
          label: stringValue(record.label) || stringValue(record.status).replaceAll("_", " "),
          completed: Boolean(record.completed),
          current: Boolean(record.current)
        };
      })
    : [];
  return {
    orderNumber: stringValue(value.order_number),
    status: stringValue(value.status),
    courier: stringValue(value.courier_name || value.courier),
    location: stringValue(value.location),
    expectedDelivery: stringValue(value.expected_delivery),
    trackingUrl: stringValue(value.tracking_url),
    timeline
  };
}

export function OrderTracking() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const [reference, setReference] = useState(initialOrder);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function track(orderReference: string) {
    if (!orderReference.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      setResult(mapTracking(await getOrderTracking(orderReference.trim())));
    } catch (error) {
      setResult(null);
      setMessage(error instanceof Error ? error.message : "Order tracking is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialOrder) void track(initialOrder);
  }, [initialOrder]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void track(reference);
  }

  return (
    <div className="space-y-12">
      {/* Primary Card Container */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-900/15 bg-[#fffaf4]/80 p-6 shadow-[0_20px_70px_rgba(105,62,35,0.08)] backdrop-blur-[2px] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_1.1fr] lg:items-center">
          {/* Left Column: Form */}
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-2xl font-semibold text-maroon-deep sm:text-3xl">
              Enter your order reference
            </h2>
            <p className="mt-2 text-sm text-charcoal/65">
              Enter your order ID from confirmation email or invoice.
            </p>

            <form className="mt-6" onSubmit={submit}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-maroon/60">
                  <Package className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  autoComplete="off"
                  placeholder="Enter order ID (e.g. AMZ-123456)"
                  required
                  className="w-full rounded-xl border border-charcoal/20 bg-white py-3.5 pl-11 pr-4 text-sm text-charcoal shadow-sm transition-colors placeholder:text-charcoal/40 focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#580B26] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#43071c] active:scale-[0.99] disabled:opacity-70"
              >
                <PackageSearch className="h-4 w-4" aria-hidden="true" />
                {loading ? "Checking..." : "TRACK ORDER"}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-charcoal/60">
                <Lock className="h-3.5 w-3.5 text-maroon/70" aria-hidden="true" />
                Secure & private tracking
              </p>
            </form>
          </div>

          {/* Middle Column: Vertical Divider with "or" badge */}
          <div className="relative flex items-center justify-center py-2 lg:h-full lg:py-4">
            <div className="h-px w-full bg-amber-900/10 lg:h-full lg:w-px" />
            <span className="absolute rounded-full border border-amber-900/15 bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-charcoal/50">
              or
            </span>
          </div>

          {/* Right Column: 3D Illustration / Active Tracking Details */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/60 bg-white/72 p-4 backdrop-blur-sm sm:p-6">
            {message ? (
              <p
                className="rounded-xl bg-maroon-soft p-4 text-sm font-semibold text-maroon-deep"
                role="alert"
              >
                {message}
              </p>
            ) : null}

            {result ? (
              <section aria-live="polite" className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-charcoal/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-maroon">
                      {result.status.replaceAll("_", " ")}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-maroon-deep sm:text-3xl">
                      Order {result.orderNumber}
                    </h3>
                  </div>
                  {result.expectedDelivery ? (
                    <div className="rounded-lg bg-maroon-soft px-3 py-1.5 text-right">
                      <p className="text-xs text-charcoal/60">Expected Delivery</p>
                      <p className="text-sm font-bold text-maroon-deep">
                        {new Date(result.expectedDelivery).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  ) : null}
                </div>

                <ol className="space-y-3">
                  {result.timeline.map((step, index) => (
                    <li className="grid grid-cols-[36px_1fr] gap-4" key={step.status}>
                      <div className="flex flex-col items-center">
                        <span
                          className={`grid h-9 w-9 place-items-center rounded-full border ${
                            step.completed
                              ? "border-maroon bg-maroon text-white"
                              : "border-charcoal/20 bg-white text-charcoal/35"
                          }`}
                        >
                          {step.completed ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        {index < result.timeline.length - 1 ? (
                          <span
                            className={`h-8 w-px ${
                              step.completed ? "bg-maroon" : "bg-charcoal/15"
                            }`}
                          />
                        ) : null}
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`text-sm font-semibold capitalize ${
                            step.current ? "text-maroon font-bold" : "text-charcoal"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.current ? (
                          <p className="mt-0.5 text-xs text-charcoal/70">Current order status</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>

                {result.courier || result.location ? (
                  <div className="flex flex-wrap gap-5 border-t border-charcoal/10 pt-4 text-sm text-charcoal/70">
                    {result.courier ? (
                      <p className="flex items-center gap-2 font-medium">
                        <Truck className="h-4 w-4 text-maroon" aria-hidden="true" />
                        {result.courier}
                      </p>
                    ) : null}
                    {result.location ? (
                      <p className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-maroon" aria-hidden="true" />
                        {result.location}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {result.trackingUrl ? (
                  <a
                    className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                    href={result.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open courier tracking
                  </a>
                ) : null}
              </section>
            ) : !message ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-2xl shadow-inner">
                  <Image
                    src="/images/order-tracking-3d-illustration.jpg"
                    alt="3D Order tracking presentation"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-maroon-deep">
                  Order progress will appear here.
                </h3>
                <p className="mt-1.5 max-w-xs text-xs text-charcoal/65 leading-relaxed">
                  Enter your order reference to see real-time updates on your delivery.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <div className="flex items-center gap-4 rounded-2xl border border-amber-900/10 bg-[#FAF7F2]/60 p-4 transition-all hover:bg-[#FAF7F2]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10">
            <ShieldCheck className="h-6 w-6 text-maroon" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-maroon-deep">Secure & Trusted</h4>
            <p className="text-xs text-charcoal/65">100% secure payments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-900/10 bg-[#FAF7F2]/60 p-4 transition-all hover:bg-[#FAF7F2]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10">
            <PackageCheck className="h-6 w-6 text-maroon" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-maroon-deep">Easy Returns</h4>
            <p className="text-xs text-charcoal/65">Hassle-free 36-hour returns</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-900/10 bg-[#FAF7F2]/60 p-4 transition-all hover:bg-[#FAF7F2]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10">
            <Ruler className="h-6 w-6 text-maroon" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-maroon-deep">Fit Guidance</h4>
            <p className="text-xs text-charcoal/65">Expert guidance for growing kids</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-900/10 bg-[#FAF7F2]/60 p-4 transition-all hover:bg-[#FAF7F2]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10">
            <Award className="h-6 w-6 text-maroon" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-maroon-deep">Premium Quality</h4>
            <p className="text-xs text-charcoal/65">Crafted with care & tradition</p>
          </div>
        </div>
      </div>
    </div>
  );
}
