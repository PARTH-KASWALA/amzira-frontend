"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type FloatingCardData = {
  label: string;
  image: string;
  alt: string;
  fit?: "cover" | "contain";
  tone?: "maroon" | "emerald" | "blue";
};

type FloatingCardProps = {
  detail: FloatingCardData;
  index: number;
};

const cardPositions = ["hero-story-card--one", "hero-story-card--two", "hero-story-card--three"];

export function FloatingCard({ detail, index }: FloatingCardProps) {
  return (
    <motion.div
      className={`hero-story-card ${cardPositions[index % cardPositions.length]}`}
      initial={{ opacity: 0, scale: 0.9, rotate: index === 1 ? 8 : -8, y: 18 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ duration: 0.58, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src={detail.image}
        alt={detail.alt}
        fill
        sizes="(max-width: 768px) 34vw, 190px"
        className={detail.fit === "cover" ? "object-cover object-top" : "object-contain p-3"}
      />
      <span className={`hero-story-card__label hero-story-card__label--${detail.tone ?? "maroon"}`}>
        {detail.label}
      </span>
    </motion.div>
  );
}
