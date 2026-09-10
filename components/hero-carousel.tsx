"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ProductSlide, type HeroProduct } from "@/components/product-slide";

const minimumHeroSlides = 7;
const heroAutoplayIntervalMs = 5_000;

type CatalogFallbackProduct = Omit<HeroProduct, "modelImage" | "modelAlt" | "details"> & {
  catalogSlug: string;
  tone: "maroon" | "emerald" | "blue";
};

function catalogFallbackProduct({ catalogSlug, tone, ...product }: CatalogFallbackProduct): HeroProduct {
  const imageBase = `/images/catalog/${catalogSlug}`;

  return {
    ...product,
    modelImage: `${imageBase}/01.webp`,
    modelAlt: product.title,
    details: [
      { label: "Choli", image: `${imageBase}/05.webp`, alt: `${product.title} choli photoshoot`, fit: "contain", tone },
      { label: "Lengha", image: `${imageBase}/06.webp`, alt: `${product.title} lengha photoshoot`, fit: "contain", tone }
    ]
  };
}

const defaultProducts: HeroProduct[] = [
  catalogFallbackProduct({
    id: "anika-emerald-purple-temple",
    title: "Anika Emerald Purple Temple Lehenga",
    price: "₹1,399",
    theme: "rose",
    badge: "New arrival",
    eyebrow: "Temple work lehenga choli",
    description: "Emerald and purple silk with temple-inspired zari work, made for weddings, pujas, and joyful family celebrations.",
    href: "/product/anika-emerald-purple-temple-work-lehenga-choli",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #2d0b15 0%, #8f2848 38%, #9c641b 74%, #19090d 100%)",
    accent: "#9c641b",
    catalogSlug: "anika-emerald-purple-temple-work-lehenga-choli",
    tone: "maroon"
  }),
  catalogFallbackProduct({
    id: "meera-royal-blue-peach-peacock",
    title: "Meera Royal Blue Peach Lehenga",
    price: "₹1,499",
    theme: "peacock",
    badge: "Festive favorite",
    eyebrow: "Ceremony lehenga choli",
    description: "Royal blue and peach silk with peacock-inspired detail for birthdays, temple visits, and wedding celebrations.",
    href: "/product/meera-royal-blue-peach-peacock-lehenga-choli",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #1a1028 0%, #4d2c75 36%, #3a7897 72%, #110b19 100%)",
    accent: "#3a7897",
    catalogSlug: "meera-royal-blue-peach-peacock-lehenga-choli",
    tone: "blue"
  }),
  catalogFallbackProduct({
    id: "navika-heritage-multi-pattu-pavadai",
    title: "Navika Heritage Pattu Pavadai",
    price: "₹1,139",
    theme: "gold",
    badge: "Wedding edit",
    eyebrow: "Classic pattu pavadai",
    description: "A ready-to-wear South Indian pattu pavadai with traditional detailing and a celebration-ready flare for weddings, festivals, and family gatherings.",
    href: "/product/navika-heritage-multi-pattu-pavadai",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #250b1e 0%, #63305d 40%, #a1721f 74%, #1a0a12 100%)",
    accent: "#a1721f",
    catalogSlug: "navika-heritage-multi-pattu-pavadai",
    tone: "maroon"
  }),
  catalogFallbackProduct({
    id: "ira-emerald-maroon-peacock-work",
    title: "Ira Emerald Maroon Peacock Lehenga",
    price: "₹1,499",
    theme: "blue",
    badge: "Temple edit",
    eyebrow: "Peacock work lehenga choli",
    description: "Emerald and maroon silk with peacock work and temple-inspired borders for meaningful celebration days.",
    href: "/product/ira-emerald-maroon-peacock-work-lehenga-choli",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #102142 0%, #1f4b8c 38%, #b47b18 74%, #120b18 100%)",
    accent: "#1f4b8c",
    catalogSlug: "ira-emerald-maroon-peacock-work-lehenga-choli",
    tone: "blue"
  }),
  catalogFallbackProduct({
    id: "sharvi-purple-sky-blue",
    title: "Sharvi Purple Sky Blue Lehenga",
    price: "₹1,299",
    theme: "rose",
    badge: "Festive edit",
    eyebrow: "Purple sky-blue lehenga choli",
    description: "A purple and sky-blue lehenga choli with bright festive color for festivals, pujas, and family gatherings.",
    href: "/product/sharvi-purple-sky-blue-lehenga-choli",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #310914 0%, #9b2752 40%, #b88c32 72%, #19090d 100%)",
    accent: "#9b2752",
    catalogSlug: "sharvi-purple-sky-blue-lehenga-choli",
    tone: "maroon"
  }),
  catalogFallbackProduct({
    id: "saanvi-yellow-green-tree-deer",
    title: "Saanvi Yellow Green Tree Deer Pattu Pavadai",
    price: "₹1,319",
    theme: "emerald",
    badge: "Festive edit",
    eyebrow: "Tree deer pattu pavadai",
    description: "Yellow and green silk with traditional tree-deer detailing for weddings, temple ceremonies, and family celebrations.",
    href: "/product/saanvi-yellow-green-tree-deer-pattu-pavadai",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #241006 0%, #6d2d13 34%, #176047 72%, #120b08 100%)",
    accent: "#176047",
    catalogSlug: "saanvi-yellow-green-tree-deer-pattu-pavadai",
    tone: "emerald"
  }),
  catalogFallbackProduct({
    id: "amaira-light-green-red-jacquard",
    title: "Amaira Light Green Red Jacquard Lehenga",
    price: "₹1,399",
    theme: "emerald",
    badge: "New arrival",
    eyebrow: "Jacquard lehenga choli",
    description: "Light green and red jacquard silk with a graceful festive border, made for birthdays, pujas, and wedding days.",
    href: "/product/amaira-light-green-red-jacquard-work-lehenga-choli",
    cta: "Shop this style",
    gradient: "linear-gradient(110deg, #210d0d 0%, #76222d 36%, #28715a 74%, #0d1d18 100%)",
    accent: "#28715a",
    catalogSlug: "amaira-light-green-red-jacquard-work-lehenga-choli",
    tone: "emerald"
  })
];

export function HeroCarousel({ products = defaultProducts }: { products?: HeroProduct[] }) {
  const slides = products.length >= minimumHeroSlides
    ? products
    : [...products, ...defaultProducts.filter((product) => !products.some((candidate) => candidate.id === product.id))]
        .slice(0, minimumHeroSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 80, damping: 24, mass: 0.6 });
  const parallaxY = useSpring(mouseY, { stiffness: 80, damping: 24, mass: 0.6 });
  const activeProduct = slides[activeIndex];

  const goTo = useCallback((nextIndex: number) => {
    setActiveIndex((nextIndex + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) {
      return;
    }

    const timer = window.setInterval(goNext, heroAutoplayIntervalMs);
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
      aria-label="Featured AMZIRA styles"
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
            count={slides.length}
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
          {slides.map((product, index) => (
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
