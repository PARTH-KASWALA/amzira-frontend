"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const DEFAULT_ROTATION_MS = 5000;

const storyCards = [
  {
    caption: <>Where tradition<br />takes shape</>,
    slides: [
      { src: "/images/catalog/aarika-purple-gold-pattu-pavadai/04.webp", alt: "Gold embroidery detail on a purple AMZIRA pattu pavadai" },
      { src: "/images/catalog/anika-emerald-purple-temple-work-lehenga-choli/03.webp", alt: "Emerald and purple temple-work lehenga detail from AMZIRA" },
      { src: "/images/catalog/aadhya-royal-blue-mustard-temple-border-lehenga-choli/04.webp", alt: "Royal blue and mustard South Indian lehenga detail from AMZIRA" }
    ]
  },
  {
    caption: <>More than outfits<br />memories delivered</>,
    slides: [
      { src: "/images/catalog/amzira-girls-festive-lehenga-choli-1-5/01.webp", alt: "AMZIRA girls festive lehenga choli in a celebration setting" },
      { src: "/images/catalog/aadhya-gold-lehenga-choli/02.webp", alt: "Gold AMZIRA lehenga choli with festive detail" },
      { src: "/images/catalog/anika-rani-pink-gold-pattu-pavadai/03.webp", alt: "Rani pink and gold AMZIRA pattu pavadai detail" }
    ]
  },
  {
    caption: <>For her<br />tomorrow</>,
    slides: [
      { src: "/images/catalog/tara-maroon-gold-pattu-pavadai/01.webp", alt: "Maroon and gold AMZIRA pattu pavadai for a celebration" },
      { src: "/images/catalog/aaradhya-cream-pink-tree-deer-pattu-pavadai/05.webp", alt: "Cream and pink AMZIRA pattu pavadai with traditional motifs" },
      { src: "/images/catalog/aanya-pink-navy-pattu-pavadai/04.webp", alt: "Pink and navy AMZIRA pattu pavadai detail" }
    ]
  }
];

export default function AboutStoryCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => current + 1);
    }, DEFAULT_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <div className="about-story__cards" role="region" aria-roledescription="carousel" aria-label="AMZIRA craft moments" tabIndex={0}>
      {storyCards.map((card, cardIndex) => {
        const slide = card.slides[activeIndex % card.slides.length];

        return (
          <figure className="about-story__card" key={cardIndex}>
            <div className="about-story__card-image">
              <Image
                key={`${cardIndex}-${slide.src}`}
                src={slide.src}
                alt={slide.alt}
                fill
                unoptimized
                sizes="(min-width: 1024px) 22vw, 100vw"
                className="about-story__card-rotating-image object-cover"
              />
            </div>
            <figcaption>{card.caption}</figcaption>
          </figure>
        );
      })}
      <span className="sr-only" aria-live="polite">
        Showing craft moment {activeIndex % storyCards[0].slides.length + 1} of {storyCards[0].slides.length}.
      </span>
    </div>
  );
}
