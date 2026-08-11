"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Gem } from "lucide-react";
import { useState } from "react";
import { navGroups, utilityLinks } from "@/lib/navigation";

const announcementItems = [
  "Free shipping above Rs. 1,999",
  "36-hour returns",
  "Fit guidance for growing kids"
];

export function SiteHeader() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const activeGroup = navGroups.find((group) => group.label === activeLabel);

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/95 backdrop-blur">
      <div className="announcement-marquee bg-maroon-deep text-white" aria-label="Store announcements">
        <div className="announcement-marquee__track">
          {Array.from({ length: 4 }).map((_, groupIndex) => (
            <div className="announcement-marquee__group" aria-hidden={groupIndex > 0} key={groupIndex}>
              {announcementItems.map((item, itemIndex) => (
                <span className="announcement-marquee__item" key={`${groupIndex}-${item}`}>
                  {itemIndex === 0 ? <Gem className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> : null}
                  {item}
                  <span className="announcement-marquee__dot" aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
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
            <div key={group.label} className="relative">
              <Link
                href={group.href}
                className={`focus-ring flex min-h-11 items-center gap-1 rounded-sm text-sm font-semibold uppercase tracking-[0.14em] transition hover:text-maroon ${
                  activeLabel === group.label ? "text-maroon" : "text-charcoal"
                }`}
                aria-expanded={group.status === "live" ? activeLabel === group.label : undefined}
                onFocus={() => setActiveLabel(group.status === "live" ? group.label : null)}
                onMouseEnter={() => setActiveLabel(group.status === "live" ? group.label : null)}
              >
                {group.label}
                {group.status === "live" ? <ChevronDown aria-hidden="true" className="h-4 w-4" /> : null}
                {group.status === "coming-soon" ? (
                  <span className="text-[0.58rem] font-bold normal-case tracking-normal text-gold-dark">Soon</span>
                ) : null}
              </Link>
            </div>
          ))}
          <Link
            href="/heritage"
            className="focus-ring flex min-h-11 items-center rounded-sm text-sm font-semibold uppercase tracking-[0.14em] text-charcoal transition hover:text-maroon"
            onFocus={() => setActiveLabel(null)}
            onMouseEnter={() => setActiveLabel(null)}
          >
            Heritage
          </Link>
        </nav>

        <div className="flex items-center gap-1" onMouseEnter={() => setActiveLabel(null)}>
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
      {activeGroup ? (
        <div
          className="fixed left-1/2 top-[106px] z-50 w-[calc(100vw-2rem)] max-w-[1320px] -translate-x-1/2 pt-4"
          onMouseEnter={() => setActiveLabel(activeGroup.label)}
          onMouseLeave={() => setActiveLabel(null)}
        >
          <div className="grid min-h-[430px] grid-cols-[210px_minmax(0,1fr)_300px] overflow-hidden rounded-md border border-charcoal/10 bg-[#fbf3e4] shadow-sari">
            <div className="flex flex-col justify-between bg-[#f6ead5] p-8">
              <div>
                <p className="section-kicker">{activeGroup.label}</p>
                <p className="mt-4 font-display text-[2.15rem] leading-[1.05] text-maroon-deep">
                  {activeGroup.intro}
                </p>
              </div>
              <ul className="space-y-4">
                {activeGroup.quickLinks.map(([label, href], index) => (
                  <li key={label}>
                    <Link
                      className={`focus-ring inline-flex rounded-sm text-sm font-extrabold uppercase tracking-[0.08em] transition hover:translate-x-1 ${
                        index === 0 ? "text-lotus" : "text-charcoal"
                      }`}
                      href={href}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid content-start gap-x-8 gap-y-7 bg-[#fff8ea] p-8 lg:grid-cols-3 xl:grid-cols-4">
              {activeGroup.columns.map((column) => (
                <div key={column.title} className="min-w-0">
                  <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.24em] text-gold-dark">
                    {column.title}
                  </h3>
                  <ul className="space-y-3.5">
                    {column.links.map(([label, href]) => (
                      <li key={label}>
                        <Link
                          className="focus-ring block rounded-sm text-[0.95rem] font-medium leading-5 text-charcoal/80 transition hover:translate-x-1 hover:text-maroon"
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
            <div className="grid content-center gap-5 bg-[#f3e4c7] p-7">
              {activeGroup.promos.map((promo) => (
                <Link
                  key={promo.title}
                  href={promo.href}
                  className="focus-ring group/promo relative block min-h-[170px] overflow-hidden rounded-sm bg-maroon-deep text-white shadow-soft"
                >
                  <Image
                    src={promo.image}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover transition duration-500 group-hover/promo:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-maroon-deep/88 via-maroon-deep/42 to-transparent" />
                  <span className="absolute left-5 top-5 max-w-[11rem] font-display text-3xl font-semibold leading-none">
                    {promo.title}
                  </span>
                  <span className="absolute bottom-5 left-5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-gold-pale">
                    {promo.cta}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
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
        <Link
          href="/heritage"
          className="focus-ring min-h-11 shrink-0 rounded-full border border-charcoal/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Heritage
        </Link>
      </nav>
    </header>
  );
}
