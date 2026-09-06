import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck, RotateCcw, Star, Store } from "lucide-react";
import type { Product } from "@/lib/catalog";

function dispatchCopy(product: Product) {
  if (product.dispatchDaysMin === null || product.dispatchDaysMin === undefined || product.dispatchDaysMax === null || product.dispatchDaysMax === undefined) {
    return "Ready-to-ship orders are normally dispatched in 1-3 business days";
  }
  return product.dispatchDaysMin === product.dispatchDaysMax
    ? `Dispatches in ${product.dispatchDaysMin} day${product.dispatchDaysMin === 1 ? "" : "s"}`
    : `Dispatches in ${product.dispatchDaysMin}-${product.dispatchDaysMax} days`;
}

function returnCopy(product: Product) {
  if (product.isReturnEligible === null || product.isReturnEligible === undefined) {
    return "Standard 36-hour return window from recorded delivery; product exceptions apply";
  }
  if (!product.isReturnEligible) return "This style is not eligible for return";
  return product.returnWindowHours
    ? `Return eligible within ${product.returnWindowHours} hours of delivery`
    : "Return eligibility shown before ordering";
}

function marketplaceSignalCopy(product: Product) {
  const signal = product.marketplaceSignal;
  if (!signal) return null;
  const date = signal.observedAt ? new Date(signal.observedAt) : null;
  const observed = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date)
    : "the recorded snapshot date";
  const units = signal.units && signal.units > 0 ? `: ${signal.units} unit${signal.units === 1 ? "" : "s"} recorded` : "";
  return `${signal.label}${units} in AMZIRA’s ${signal.source}, observed ${observed}. This is not a customer rating or review.`;
}

export function ProductConfidence({ product }: { product: Product }) {
  const facts = [
    product.reviewCount > 0
      ? { icon: Star, title: `${product.avgRating.toFixed(1)} / 5 from ${product.reviewCount} customer review${product.reviewCount === 1 ? "" : "s"}` }
      : null,
    marketplaceSignalCopy(product)
      ? { icon: Store, title: marketplaceSignalCopy(product)! }
      : null,
    product.includedPieces?.length
      ? { icon: PackageCheck, title: `Included: ${product.includedPieces.join(", ")}` }
      : null,
    dispatchCopy(product)
      ? { icon: Clock3, title: dispatchCopy(product)! }
      : null,
    returnCopy(product)
      ? { icon: RotateCcw, title: returnCopy(product)! }
      : null,
    product.isExchangeEligible === true
      ? { icon: CheckCircle2, title: "Exchange eligible, subject to policy and stock" }
      : product.isExchangeEligible === false
        ? { icon: CheckCircle2, title: "This style is not eligible for exchange" }
        : null
  ].filter(Boolean) as Array<{ icon: typeof Star; title: string }>;

  if (!facts.length) return null;

  return (
    <section className="mt-7 rounded-2xl border border-charcoal/10 bg-white p-4" aria-label="Purchase confidence details">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-maroon-deep">Before you order</p>
      <ul className="mt-3 grid gap-2 text-xs leading-5 text-charcoal/70">
        {facts.map(({ icon: Icon, title }) => (
          <li className="flex gap-2" key={title}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />
            <span>{title}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-maroon">
        <Link className="focus-ring rounded-sm" href="/shipping-policy">Shipping policy</Link>
        <Link className="focus-ring rounded-sm" href="/returns-refund-policy">Returns & exchanges</Link>
        <Link className="focus-ring rounded-sm" href="/faqs">FAQs</Link>
      </div>
    </section>
  );
}
