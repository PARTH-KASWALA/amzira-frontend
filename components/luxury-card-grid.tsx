"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const sectionEase = [0.16, 1, 0.3, 1] as const;

const luxuryCards = [
  {
    title: "Ceremony styling",
    description: "Curated looks for weddings, rituals, and celebrations",
    cta: "Explore styles",
    href: "/appointments",
    image: "/images/occasions/bride_side.webp"
  },
  {
    title: "Design archives",
    description: "Timeless weaves and intricate details",
    cta: "Discover more",
    href: "/heritage",
    image: "/images/occasions/reception.webp"
  },
  {
    title: "Family coordination",
    description: "Looks that bring every generation together",
    cta: "Explore now",
    href: "/appointments",
    image: "/images/occasions/team-bride.webp"
  }
];

export function LuxuryCardGrid() {
  const shouldReduceMotion = useReducedMotion();

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
          <p className="atelier-kicker">The Amzira atelier</p>
          <h2>Where tradition becomes celebration.</h2>
          <div className="atelier-divider" aria-hidden="true" />
          <p>
            From heirloom silks to careful handwork, every edit is shaped for South Indian ceremonies and family memories.
          </p>
          <p>For little ones, bridal moments, and coordinated looks that feel considered from the first fitting.</p>
          <Link className="atelier-button focus-ring" href="/women">
            Explore collections <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
