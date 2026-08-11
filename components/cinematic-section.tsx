"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingPetals } from "@/components/floating-petals";

const sectionEase = [0.16, 1, 0.3, 1] as const;

export function CinematicSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="cinematic-section relative overflow-hidden">
      <FloatingPetals />
      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:py-24">
        <motion.div
          className="cinematic-copy"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.72, ease: sectionEase }}
        >
          <div className="cinematic-ornament" aria-hidden="true" />
          <h2>Tradition, seen through her eyes.</h2>
          <p>
            The music, color, and ceremony feel even more magical in a lehenga made for moving, playing, and celebrating.
          </p>
          <Link className="cinematic-button focus-ring" href="/category/kids-pattu-pavadai">
            Shop girls&apos; lehenga choli <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.div
          className="cinematic-frame"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: sectionEase }}
        >
          <motion.video
            className="cinematic-video"
            src="/images/animations/royal-wedding-procession-cinematic.mp4#t=0.2"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Royal Indian wedding procession with elephant, musicians, and wedding attendants"
            initial={false}
            animate={shouldReduceMotion ? { scale: 1 } : { scale: 1.04 }}
            transition={{ duration: 13, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <div className="cinematic-frame__wash" />
          <div className="cinematic-frame__border" />
        </motion.div>
      </div>
    </section>
  );
}
