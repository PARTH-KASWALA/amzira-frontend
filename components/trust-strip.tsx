import { BadgeCheck, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const items = [
  ["Made in India", BadgeCheck],
  ["Assured quality", ShieldCheck],
  ["Secure payments", ShieldCheck],
  ["Easy returns", RotateCcw],
  ["Styling support", Headphones],
  ["Fast shipping", Truck]
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-charcoal/10 bg-white">
      <div className="container-page grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-3 text-sm font-semibold text-charcoal/75">
            <Icon className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
