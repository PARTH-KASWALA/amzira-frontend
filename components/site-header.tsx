"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Flower2,
  Gem,
  Grid2X2,
  Shirt,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { CartCountBadge } from "@/components/cart-count-badge";
import { navGroups, utilityLinks } from "@/lib/navigation";

const announcementItems = [
  "Free shipping above Rs. 1,999",
  "36-hour returns",
  "Fit guidance for growing kids"
];

const sidebarIcons = [Flower2, Sparkles, Shirt, CalendarDays, Grid2X2];
const columnIcons = [Flower2, Gem, Sparkles];
const linkIcons = [Shirt, Flower2, Sparkles, Gem];

function isCurrentDepartment(pathname: string, label: string, href: string) {
  if (label === "Kids") {
    return pathname === "/kids" || pathname.startsWith("/category/");
  }

  return pathname === href || pathname.endsWith(`/${label.toLowerCase()}`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const activeGroup = navGroups.find((group) => group.label === activeLabel && group.status === "live");

  useEffect(() => {
    setActiveLabel(null);
  }, [pathname]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveLabel(null);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header
      className="site-header sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/95 backdrop-blur"
      onMouseLeave={() => setActiveLabel(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveLabel(null);
      }}
    >
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

      <div className="container-page flex min-h-[78px] items-center justify-between gap-4">
        <Link href="/" className="focus-ring group flex min-w-0 items-center gap-3 rounded-sm" aria-label="AMZIRA home">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/55 bg-white shadow-soft">
            <Image
              src="/images/logo/amzira_logo.webp"
              alt=""
              fill
              sizes="48px"
              className="object-contain p-1.5"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="relative block h-7 w-32 sm:w-40">
              <Image
                src="/images/logo/Amzira_name.webp"
                alt="AMZIRA"
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-gold sm:text-[10px]">
              South Indian Luxury
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 xl:flex" aria-label="Primary navigation">
          {navGroups.map((group) => {
            const current = isCurrentDepartment(pathname, group.label, group.href);
            const open = activeLabel === group.label;

            if (group.status === "live") {
              return (
                <button
                  key={group.label}
                  type="button"
                  className={`nav-department focus-ring ${current || open ? "nav-department--active" : ""}`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  aria-controls="kids-mega-menu"
                  onClick={() => setActiveLabel(group.label)}
                  onMouseEnter={() => setActiveLabel(group.label)}
                >
                  {group.label}
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                </button>
              );
            }

            return (
              <Link
                key={group.label}
                href={group.href}
                className={`nav-department focus-ring ${current ? "nav-department--active" : ""}`}
                onFocus={() => setActiveLabel(null)}
                onMouseEnter={() => setActiveLabel(null)}
              >
                {group.label}
                <span className="nav-department__soon">Soon</span>
              </Link>
            );
          })}
          <Link
            href="/heritage"
            className={`nav-department focus-ring ${pathname === "/heritage" ? "nav-department--active" : ""}`}
            onFocus={() => setActiveLabel(null)}
            onMouseEnter={() => setActiveLabel(null)}
          >
            Heritage
          </Link>
        </nav>

        <div className="flex items-center gap-0.5" onMouseEnter={() => setActiveLabel(null)}>
          {utilityLinks.filter((item) => ["Search", "Wishlist", "Account", "Cart"].includes(item.label)).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`focus-ring relative min-h-11 min-w-11 place-items-center rounded-full text-charcoal transition hover:bg-maroon-soft hover:text-maroon ${
                item.label === "Account" || item.label === "Cart" ? "grid" : "hidden md:grid"
              }`}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label === "Cart" ? <CartCountBadge /> : null}
            </Link>
          ))}
        </div>
      </div>

      {activeGroup ? (
        <div
          className="mega-menu-shell"
          onMouseEnter={() => setActiveLabel(activeGroup.label)}
        >
          <span className="mega-menu-pointer" aria-hidden="true" />
          <div id="kids-mega-menu" className="mega-menu" aria-label="Kids collections">
            <aside className="mega-menu__side">
              <div className="mega-menu__side-copy">
                <p>Kids</p>
                <Flower2 aria-hidden="true" />
                <h2>{activeGroup.intro}</h2>
                <Link href={activeGroup.introCta[1]} onClick={() => setActiveLabel(null)}>
                  {activeGroup.introCta[0]} <ArrowRight aria-hidden="true" />
                </Link>
              </div>

              <nav aria-label="Kids collection shortcuts">
                <ul className="mega-menu__quick-links">
                  {activeGroup.quickLinks.map(([label, href], index) => {
                    const Icon = sidebarIcons[index] ?? Sparkles;
                    return (
                      <li key={label}>
                        <Link
                          className={index === 0 ? "is-selected" : ""}
                          href={href}
                          onClick={() => setActiveLabel(null)}
                        >
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="mega-menu__columns">
              {activeGroup.columns.map((column, columnIndex) => {
                const ColumnIcon = columnIcons[columnIndex] ?? Sparkles;
                return (
                  <section className="mega-menu__column" key={column.title}>
                    <div className="mega-menu__column-heading">
                      <ColumnIcon aria-hidden="true" />
                      <h2>{column.title}</h2>
                    </div>
                    <div className="mega-menu__column-rule" aria-hidden="true"><span /></div>
                    <ul>
                      {column.links.map((item, itemIndex) => {
                        const ItemIcon = linkIcons[itemIndex] ?? Sparkles;
                        return (
                          <li key={item.label}>
                            <Link href={item.href} onClick={() => setActiveLabel(null)}>
                              <ItemIcon aria-hidden="true" />
                              <span>
                                <strong>{item.label}</strong>
                                <small>{item.description}</small>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <Link className="mega-menu__column-cta" href={column.cta[1]} onClick={() => setActiveLabel(null)}>
                      {column.cta[0]} <ArrowRight aria-hidden="true" />
                    </Link>
                  </section>
                );
              })}
            </div>

            <div className="mega-menu__promos">
              {activeGroup.promos.map((promo) => (
                <Link
                  key={promo.title}
                  href={promo.href}
                  className="mega-menu__promo group focus-ring"
                  onClick={() => setActiveLabel(null)}
                >
                  <Image
                    src={promo.image}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                  <span className="mega-menu__promo-shade" aria-hidden="true" />
                  <span className="mega-menu__promo-copy">
                    <strong>{promo.title}</strong>
                    <small>{promo.cta} <ArrowRight aria-hidden="true" /></small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="container-page flex gap-2 overflow-x-auto pb-3 xl:hidden" aria-label="Mobile navigation">
        {navGroups.map((group) => {
          const current = isCurrentDepartment(pathname, group.label, group.href);
          return (
            <Link
              key={group.label}
              href={group.href}
              className={`focus-ring min-h-11 shrink-0 rounded-sm border px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                current ? "border-maroon bg-maroon text-white" : "border-charcoal/10 bg-white text-charcoal"
              }`}
            >
              {group.label}
            </Link>
          );
        })}
        <Link
          href="/heritage"
          className={`focus-ring min-h-11 shrink-0 rounded-sm border px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
            pathname === "/heritage" ? "border-maroon bg-maroon text-white" : "border-charcoal/10 bg-white text-charcoal"
          }`}
        >
          Heritage
        </Link>
      </nav>
    </header>
  );
}
