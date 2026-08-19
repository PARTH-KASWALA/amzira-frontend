import Image from "next/image";
import Link from "next/link";
import { Mail, Send, ShieldAlert } from "lucide-react";
import { GIRLS_LEHENGA_CATEGORY_PATH, PATTU_PAVADAI_CATEGORY_PATH } from "@/lib/storefront";

const footerColumns = [
  {
    title: "Top categories",
    links: [
      ["Girls' Lehenga Choli", GIRLS_LEHENGA_CATEGORY_PATH],
      ["Pattu Pavadai", PATTU_PAVADAI_CATEGORY_PATH],
      ["Temple Border Lehenga", GIRLS_LEHENGA_CATEGORY_PATH],
      ["Kanjeevaram-Inspired Kids' Silk", GIRLS_LEHENGA_CATEGORY_PATH],
      ["Women's Collection - Coming Soon", "/coming-soon/women"],
      ["Men's Collection - Coming Soon", "/coming-soon/men"],
      ["Boys' Collection - Coming Soon", "/coming-soon/kids-boys"]
    ]
  },
  {
    title: "Discover",
    links: [
      ["Our Heritage", "/heritage"],
      ["Craftsmanship", "/heritage#craft"],
      ["Stores", "/stores"],
      ["Appointments", "/appointments"],
      ["Customer Support", "/contact-support"],
      ["Search", "/search"]
    ]
  },
  {
    title: "Support",
    links: [
      ["Fraud Alert", "/contact-support"],
      ["Track Order", "/order-tracking"],
      ["Exchange Request", "/returns-refund-policy"],
      ["Sitemap", "/sitemap.xml"],
      ["Contact Us", "/contact-support"]
    ]
  },
  {
    title: "Policies",
    links: [
      ["Shipping Policy", "/shipping-policy"],
      ["Privacy Policy", "/privacy-policy"],
      ["Cancellation, Return & Exchange Policy", "/returns-refund-policy"],
      ["Terms of Services", "/terms-and-conditions"]
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-[#edd9d2] bg-[#fff1ec] text-[#56504f]">
      <Image
        src="/images/footer/heritage-illustration-footer.webp"
        alt=""
        fill
        sizes="100vw"
        quality={75}
        className="pointer-events-none absolute inset-0 object-cover object-center saturate-[1.08] contrast-[1.02]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fff9f0]/88 via-[#fff0e4]/58 to-[#fff0e4]/18" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/92 via-white/45 to-transparent" />

      <div className="site-footer__columns relative mx-auto grid w-full max-w-[1480px] gap-10 px-4 pb-[28rem] pt-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1fr_0.9fr_0.9fr_1.15fr_1.45fr] lg:px-8 lg:pb-[24rem]">
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-[#df7778]">{column.title}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="focus-ring rounded-sm text-[15px] font-medium leading-6 text-[#5f5b5a] underline-offset-4 transition hover:text-maroon hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-[#df7778]">Connect with us</h2>
          <p className="mt-5 max-w-sm text-[15px] font-medium leading-7 text-[#5f5b5a]">
            Join our mailing list for girls&apos; ceremony edits, fit guidance, and new collection updates.
          </p>

          <a href="mailto:care@amzira.com?subject=AMZIRA%20collection%20updates" className="btn-secondary mt-8 w-fit gap-2 bg-white/85">
            <Mail className="h-4 w-4" aria-hidden="true" /> Email for updates
          </a>
        </div>
      </div>

      <div className="site-footer__meta relative mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-10 text-sm font-medium text-[#65605e] sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-sm" aria-label="AMZIRA home">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/70 bg-white/80 shadow-soft">
            <Image src="/images/logo/amzira_logo.webp" alt="" fill sizes="48px" className="object-contain p-1.5" />
          </span>
          <span>
            <span className="block text-3xl font-bold leading-none tracking-tight text-charcoal">amzira</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8f5d4b]">
              South Indian Luxury
            </span>
          </span>
        </Link>
        <p>© 2026 AMZIRA Atelier. All Rights Reserved.</p>
        <p className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#df7778]" aria-hidden="true" />
          Secure checkout · Fast support
        </p>
      </div>

      <Link
        href="mailto:care@amzira.com?subject=AMZIRA%20support%20request"
        className="focus-ring absolute bottom-8 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#df6668] text-white shadow-sari transition hover:bg-maroon"
        aria-label="Contact support"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
      </Link>
    </footer>
  );
}
