import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Send,
  ShieldAlert,
  Youtube
} from "lucide-react";

const footerColumns = [
  {
    title: "Top categories",
    links: [
      ["Bridal Lehengas", "/category/bridal-lehenga"],
      ["Kanjeevaram Lehengas", "/category/kanjeevaram-lehenga"],
      ["Half Sarees", "/category/half-saree"],
      ["Tissue & Organza", "/category/tissue-organza"],
      ["Kids Pattu Pavadai", "/category/kids-pattu-pavadai"],
      ["Men's Kurta", "/men?style=kurta"],
      ["Sherwani", "/men?style=sherwani"],
      ["Wedding Guest Wear", "/women?occasion=wedding-guest"]
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
      ["Gift Styling", "/appointments"],
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

const socialLinks = [
  ["Instagram", Instagram],
  ["Facebook", Facebook],
  ["YouTube", Youtube],
  ["LinkedIn", Linkedin]
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#edd9d2] bg-[#fff1ec] text-[#56504f]">
      <Image
        src="/images/footer/heritage-illustration-footer.webp"
        alt=""
        fill
        sizes="100vw"
        quality={75}
        className="absolute inset-0 object-cover object-center saturate-[1.08] contrast-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff9f0]/62 via-[#fff0e4]/28 to-[#fff0e4]/8" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/88 via-white/32 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-[1480px] gap-10 px-4 pb-[28rem] pt-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1fr_0.9fr_0.9fr_1.15fr_1.45fr] lg:px-8 lg:pb-[24rem]">
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
            Join our mailing list for ceremony edits, bridal styling notes, and new collection updates.
          </p>

          <form action="/contact-support" className="mt-8 flex max-w-md items-center border-b-2 border-[#5f5b5a]">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="min-h-12 flex-1 border-0 bg-transparent px-0 text-[15px] font-medium text-charcoal placeholder:text-[#6f6765] focus:ring-0"
            />
            <button
              type="submit"
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-sm text-[#5f5b5a] transition hover:text-maroon"
              aria-label="Join mailing list"
            >
              <Mail className="h-6 w-6" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-4 text-[#df7778]" aria-label="Social links">
            {socialLinks.map(([label, Icon]) => (
              <Link
                key={label as string}
                href="/contact-support"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-sm transition hover:text-maroon"
                aria-label={`${label} updates`}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-10 text-sm font-medium text-[#65605e] sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
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
        href="/contact-support"
        className="focus-ring absolute bottom-8 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#df6668] text-white shadow-sari transition hover:bg-maroon"
        aria-label="Contact support"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
      </Link>
    </footer>
  );
}
