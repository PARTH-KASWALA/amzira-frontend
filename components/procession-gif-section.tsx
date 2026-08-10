"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const sectionEase = [0.16, 1, 0.3, 1] as const;

export function ProcessionGifSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="procession-gif-section py-14 lg:py-20">
      <div className="container-page grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <motion.div
          className="procession-gif-glow order-2 flex justify-center lg:order-1"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.78, ease: sectionEase }}
        >
          <Image
            src="/images/animations/wedding-procession.gif"
            alt="Animated royal Indian wedding procession"
            width={480}
            height={270}
            unoptimized
            loading="lazy"
            className="procession-gif-media"
          />
        </motion.div>

        <motion.div
          className="procession-gif-copy order-1 lg:order-2"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.68, ease: sectionEase }}
        >
          <p className="section-kicker">The wedding procession</p>
          <h2>A small moving ritual from the old homepage, refined for the new one.</h2>
          <p>
            This is the original AMZIRA procession GIF from the legacy index page. It now anchors the midpoint of the
            homepage as an intentional ceremony pause instead of a loose decorative strip.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
