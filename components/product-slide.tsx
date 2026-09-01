"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { AnimatePresence, motion, type MotionValue, type Variants } from "framer-motion";
import { FloatingCard, type FloatingCardData } from "@/components/floating-card";

const luxuryEase = [0.16, 1, 0.3, 1] as const;

export type HeroProduct = {
  id: string;
  title: string;
  price: string;
  theme: "blue" | "maroon" | "gold" | "emerald" | "rose" | "peacock";
  badge: string;
  eyebrow: string;
  description: string;
  href: string;
  cta: string;
  modelImage: string;
  modelAlt: string;
  gradient: string;
  accent: string;
  details: FloatingCardData[];
};

type ProductSlideProps = {
  product: HeroProduct;
  activeIndex: number;
  count: number;
  dragX: MotionValue<number>;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
};

const textVariants: Variants = {
  initial: { opacity: 0, y: 34, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: luxuryEase }
  },
  exit: {
    opacity: 0,
    y: -18,
    filter: "blur(6px)",
    transition: { duration: 0.26, ease: "easeInOut" }
  }
};

export function ProductSlide({ product, activeIndex, count, dragX, parallaxX, parallaxY }: ProductSlideProps) {
  return (
    <div className="container-page hero-story-layout relative grid gap-5 py-7 lg:min-h-[clamp(620px,calc(100svh-185px),720px)] lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-8 lg:py-10">
      <motion.div
        key={`copy-${product.id}`}
        className="hero-story-copy"
        variants={textVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className="hero-story-count">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span aria-hidden="true">/</span>
          <span>{String(count).padStart(2, "0")}</span>
        </p>
        <h1>{product.title}</h1>
        <p className="hero-story-description">{product.description}</p>
        <div className="hero-story-actions">
          <Link className="btn-primary bg-maroon-deep hover:bg-maroon" href={product.href}>
            {product.cta}
          </Link>
          <span className="hero-story-price">{product.price}</span>
        </div>
        <div className="hero-story-meta">
          <span>{product.eyebrow}</span>
          <span aria-hidden="true">•</span>
          <span>{product.badge}</span>
        </div>
      </motion.div>

      <div className="hero-story-stage" aria-label={`${product.title} product story`}>
        <motion.div className="hero-story-aura" style={{ x: dragX }} aria-hidden="true" />
        <motion.div
          key={`model-${product.id}`}
          className="hero-story-model"
          initial={{ opacity: 0, x: 92, scale: 0.985, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -46, scale: 0.98, filter: "blur(8px)" }}
          transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
          style={{ x: parallaxX, y: parallaxY }}
        >
          <Image
            src={product.modelImage}
            alt={product.modelAlt}
            fill
            priority={activeIndex === 0}
            unoptimized={product.modelImage.startsWith("/images/") || product.modelImage.startsWith("https://cdn.amzira.com/")}
            sizes="(min-width: 1280px) 39vw, (min-width: 1024px) 48vw, 92vw"
            className="object-cover object-top"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={`details-${product.id}`} className="contents">
            {product.details.slice(0, 3).map((detail, index) => (
              <FloatingCard key={`${product.id}-${detail.image}`} detail={detail} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`product-card-${product.id}`}
          className="hero-story-product"
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.58, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>{product.badge}</span>
          <strong>{product.title}</strong>
          <p>{product.price}</p>
          <Link href={product.href} className="focus-ring">
            View details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div role="img" aria-label="Rated five out of five stars">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
