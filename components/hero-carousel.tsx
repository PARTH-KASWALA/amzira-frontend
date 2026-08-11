"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ProductSlide, type HeroProduct } from "@/components/product-slide";

const products: HeroProduct[] = [
  {
    id: "royal-blue-kids",
    title: "Royal Kanchipuram Lehenga Choli",
    price: "₹6,499",
    theme: "blue",
    badge: "New arrival",
    eyebrow: "Kids pattu pavadai",
    description:
      "Royal blue pattu lehenga choli with Kanchipuram-inspired checks, antique gold borders, and ceremony-ready movement.",
    href: "/product/sri-valli-girls-traditional-pattu-pavadai",
    cta: "Shop kids wear",
    modelImage: "/images/hero-upgrade/blue-kids-lehenga-front.webp",
    modelAlt: "Child wearing a royal blue South Indian lehenga choli in a decorated temple corridor",
    gradient:
      "linear-gradient(110deg, #2b1209 0%, #6e3b1f 38%, #0e2a71 72%, #130a08 100%)",
    accent: "#154ed6",
    details: [
      {
        label: "Choli front",
        image: "/images/hero-upgrade/blue-choli-front.webp",
        alt: "Royal blue choli front detail with gold zari work",
        tone: "blue"
      },
      {
        label: "Back detail",
        image: "/images/hero-upgrade/blue-choli-back.webp",
        alt: "Royal blue choli back detail with open back and gold bands",
        tone: "blue"
      },
      {
        label: "Lehenga flare",
        image: "/images/hero-upgrade/blue-lehenga-skirt.webp",
        alt: "Royal blue lehenga skirt with pleats and gold border",
        tone: "blue"
      }
    ]
  },
  {
    id: "emerald-temple-kids",
    title: "Emerald Temple Silk Lehenga",
    price: "₹5,999",
    theme: "emerald",
    badge: "Festive edit",
    eyebrow: "Temple border story",
    description:
      "Emerald silk, maroon temple borders, and gold elephant motifs shaped for puja mornings, weddings, and family portraits.",
    href: "/category/kids-pattu-pavadai",
    cta: "View festive edit",
    modelImage: "/images/hero-upgrade/green-dress-full.webp",
    modelAlt: "Child wearing an emerald and maroon temple silk lehenga choli",
    gradient:
      "linear-gradient(110deg, #1c1008 0%, #5f230f 32%, #0f5a3e 72%, #261006 100%)",
    accent: "#0f6b49",
    details: [
      {
        label: "Full set",
        image: "/images/hero-upgrade/green-dress-product.webp",
        alt: "Emerald temple silk lehenga product cutout",
        tone: "emerald"
      },
      {
        label: "Side fall",
        image: "/images/hero-upgrade/green-dress-side.webp",
        alt: "Emerald temple silk lehenga side view",
        fit: "cover",
        tone: "emerald"
      },
      {
        label: "Back view",
        image: "/images/hero-upgrade/green-dress-back.webp",
        alt: "Emerald temple silk lehenga back view",
        fit: "cover",
        tone: "emerald"
      }
    ]
  }
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 80, damping: 24, mass: 0.6 });
  const parallaxY = useSpring(mouseY, { stiffness: 80, damping: 24, mass: 0.6 });
  const activeProduct = products[activeIndex];

  const goTo = useCallback((nextIndex: number) => {
    setActiveIndex((nextIndex + products.length) % products.length);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % products.length);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + products.length) % products.length);
  }, []);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) {
      return;
    }

    const timer = window.setInterval(goNext, 6500);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, shouldReduceMotion]);

  const heroStyle = useMemo(
    () =>
      ({
        "--hero-accent": activeProduct.accent
      }) as CSSProperties,
    [activeProduct.accent]
  );

  return (
    <motion.section
      className="hero-story relative overflow-hidden text-white"
      style={heroStyle}
      animate={{ background: activeProduct.gradient }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.92, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={(event) => {
        if (shouldReduceMotion) {
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(((event.clientX - rect.left) / rect.width - 0.5) * 18);
        mouseY.set(((event.clientY - rect.top) / rect.height - 0.5) * 14);
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="hero-story-noise" aria-hidden="true" />
      <div className="hero-story-light" aria-hidden="true" />
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        style={{ x: dragX }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70 || info.velocity.x < -450) {
            goNext();
          }
          if (info.offset.x > 70 || info.velocity.x > 450) {
            goPrev();
          }
        }}
      >
        <AnimatePresence mode="wait">
          <ProductSlide
            key={activeProduct.id}
            product={activeProduct}
            activeIndex={activeIndex}
            count={products.length}
            dragX={dragX}
            parallaxX={parallaxX}
            parallaxY={parallaxY}
          />
        </AnimatePresence>
      </motion.div>

      <div className="hero-story-controls" aria-label="Product story carousel controls">
        <button className="hero-story-arrow focus-ring" type="button" onClick={goPrev} aria-label="Previous product story">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="hero-story-dots" role="tablist" aria-label="Choose product story">
          {products.map((product, index) => (
            <button
              key={product.id}
              className="focus-ring"
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show ${product.title}`}
              onClick={() => goTo(index)}
            >
              <span>{product.eyebrow}</span>
            </button>
          ))}
        </div>
        <button className="hero-story-arrow focus-ring" type="button" onClick={goNext} aria-label="Next product story">
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </motion.section>
  );
}
