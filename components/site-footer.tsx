import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["Women", "/women"],
      ["Men", "/men"],
      ["Kids", "/kids"],
      ["Bridal", "/category/bridal-lehenga"]
    ]
  },
  {
    title: "Support",
    links: [
      ["Track Order", "/order-tracking"],
      ["Contact Support", "/contact-support"],
      ["Shipping Policy", "/shipping-policy"],
      ["Returns & Refund", "/returns-refund-policy"]
    ]
  },
  {
    title: "Company",
    links: [
      ["Stores", "/stores"],
      ["Appointments", "/appointments"],
      ["FAQs", "/faqs"],
      ["Privacy Policy", "/privacy-policy"]
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-white">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="section-kicker text-gold-pale">AMZIRA</p>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-tight">
            South Indian ceremony wear, crafted for the days people remember.
          </h2>
          <div className="mt-8 space-y-3 text-sm text-white/70">
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gold-pale" /> care@amzira.com
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gold-pale" /> 10 am - 7 pm, Monday to Saturday
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gold-pale" /> India-wide shipping
            </p>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gold-pale">{group.title}</h3>
              <ul className="space-y-3 text-sm text-white/72">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link className="focus-ring rounded-sm transition hover:text-white" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AMZIRA. All rights reserved.</p>
          <p>Secure payments · Assured quality · Made in India</p>
        </div>
      </div>
    </footer>
  );
}
