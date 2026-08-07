import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { navGroups, utilityLinks } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/95 backdrop-blur">
      <div className="bg-maroon-deep px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
        Free shipping above Rs. 1,999 · Easy returns · Bridal styling appointments
      </div>
      <div className="container-page flex min-h-[76px] items-center justify-between gap-4">
        <Link href="/" className="focus-ring group flex min-w-0 items-center gap-3 rounded-sm" aria-label="AMZIRA home">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/50 bg-white shadow-soft">
            <Image
              src="/images/logo/amzira_logo.webp"
              alt=""
              fill
              sizes="44px"
              className="object-contain p-1.5"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="relative block h-7 w-36 sm:w-40">
              <Image
                src="/images/logo/Amzira_name.webp"
                alt="AMZIRA"
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              South Indian Luxury
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="group/nav relative">
              <Link
                href={group.href}
                className="focus-ring flex min-h-11 items-center gap-1 rounded-sm text-sm font-semibold uppercase tracking-[0.14em] text-charcoal transition hover:text-maroon"
              >
                {group.label}
                <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </Link>
              <div className="invisible absolute left-1/2 top-full w-[680px] -translate-x-1/2 pt-4 opacity-0 transition group-hover/nav:visible group-hover/nav:opacity-100">
                <div className="grid grid-cols-[220px_1fr] overflow-hidden rounded-md border border-charcoal/10 bg-white shadow-sari">
                  <div className="bg-sandal/70 p-6">
                    <p className="section-kicker">{group.label}</p>
                    <p className="mt-3 font-display text-3xl leading-tight text-maroon-deep">
                      Shop by ceremony, fabric, and family role.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 p-7">
                    {group.columns.map((column) => (
                      <div key={column.title}>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                          {column.title}
                        </h3>
                        <ul className="space-y-3">
                          {column.links.map(([label, href]) => (
                            <li key={label}>
                              <Link
                                className="focus-ring block rounded-sm text-sm text-charcoal/80 transition hover:translate-x-1 hover:text-maroon"
                                href={href}
                              >
                                {label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {utilityLinks.slice(0, 1).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="focus-ring hidden min-h-11 min-w-11 place-items-center rounded-full text-charcoal transition hover:bg-maroon-soft hover:text-maroon md:grid"
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </Link>
          ))}
          {utilityLinks.slice(2).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`focus-ring min-h-11 min-w-11 place-items-center rounded-full text-charcoal transition hover:bg-maroon-soft hover:text-maroon ${
                item.label === "Account" || item.label === "Cart" ? "grid" : "hidden md:grid"
              }`}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
      <nav className="container-page flex gap-2 overflow-x-auto pb-3 lg:hidden" aria-label="Mobile navigation">
        {navGroups.map((group) => (
          <Link
            key={group.label}
            href={group.href}
            className="focus-ring min-h-11 shrink-0 rounded-full border border-charcoal/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            {group.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
