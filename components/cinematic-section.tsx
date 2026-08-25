"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingPetals } from "@/components/floating-petals";

const sectionEase = [0.16, 1, 0.3, 1] as const;

export function CinematicSection() {
  const shouldReduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const frame = frameRef.current;
    if (!frame) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

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
          ref={frameRef}
          className="cinematic-frame"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: sectionEase }}
        >
          <motion.video
            className="cinematic-video"
            src={shouldLoadVideo ? "/images/animations/royal-wedding-procession-cinematic.mp4#t=0.2" : undefined}
            poster="/images/backgrounds/kids-silk-procession.png"
            autoPlay={shouldLoadVideo}
            muted
            loop
            playsInline
            preload={shouldLoadVideo ? "metadata" : "none"}
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
