"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const sectionEase = [0.16, 1, 0.3, 1] as const;

export type LuxuryCard = {
  title: string;
  description: string;
  cta: string;
  href: string;
  image: string;
};

const defaultLuxuryCards: LuxuryCard[] = [
  {
    title: "Temple border silks",
    description: "Rich color and zari details made for little ceremony moments",
    cta: "Explore the edit",
    href: "/category/kids-pattu-pavadai",
    image: "/images/hero-upgrade/green-kids-lehenga-front.webp"
  },
  {
    title: "Comfort in every layer",
    description: "Soft linings and celebration-ready movement",
    cta: "Shop girls' styles",
    href: "/category/kids-pattu-pavadai",
    image: "/images/hero-upgrade/green-kids-lehenga-side.webp"
  },
  {
    title: "Kanchipuram-inspired color",
    description: "A vivid blue edit with antique gold detail",
    cta: "View the collection",
    href: "/category/kids-pattu-pavadai",
    image: "/images/hero-upgrade/blue-kids-lehenga-front.webp"
  }
];

export function LuxuryCardGrid({ cards = defaultLuxuryCards }: { cards?: LuxuryCard[] }) {
  const shouldReduceMotion = useReducedMotion();
  const luxuryCards = cards.length >= 3 ? cards.slice(0, 3) : defaultLuxuryCards;

  return (
    <section className="atelier-section">
      <div className="container-page grid gap-7 py-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-center lg:py-14">
        <motion.div
          className="atelier-intro"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: 0.7, ease: sectionEase }}
        >
          <p className="atelier-kicker">Made for little celebrations</p>
          <h2>South Indian silk, sized for her.</h2>
          <div className="atelier-divider" aria-hidden="true" />
          <p>
            Our first collection focuses on girls&apos; lehenga choli and pattu pavadai for South Indian ceremonies.
          </p>
          <p>Soft linings, expressive color, and traditional details make long celebration days feel easier.</p>
          <Link className="atelier-button focus-ring" href="/category/kids-pattu-pavadai">
            Shop the kids edit <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.div
          className="atelier-media-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 }
            }
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.66, ease: sectionEase }
              }
            }}
            className="atelier-feature-wrap"
          >
            <Link href={luxuryCards[0].href} className="luxury-card luxury-card--feature group focus-ring">
              <Image
                src={luxuryCards[0].image}
                alt=""
                fill
                unoptimized={luxuryCards[0].image.startsWith("/images/") || luxuryCards[0].image.startsWith("https://cdn.amzira.com/")}
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.045]"
              />
              <div className="luxury-card__overlay" />
              <div className="luxury-card__content">
                <h3>{luxuryCards[0].title}</h3>
                <p>{luxuryCards[0].description}</p>
                <span>
                  {luxuryCards[0].cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </motion.div>

          <div className="atelier-side-stack">
            {luxuryCards.slice(1).map((card) => (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.66, ease: sectionEase }
                  }
                }}
              >
                <Link href={card.href} className="luxury-card luxury-card--side group focus-ring">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    unoptimized={card.image.startsWith("/images/") || card.image.startsWith("https://cdn.amzira.com/")}
                    sizes="(min-width: 1024px) 27vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.055]"
                  />
                  <div className="luxury-card__overlay" />
                  <div className="luxury-card__content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <span>
                      {card.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
