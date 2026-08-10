"use client";

import { motion, useReducedMotion } from "framer-motion";

const petals = [
  { left: "8%", top: "16%", delay: 0, size: 9 },
  { left: "18%", top: "68%", delay: 1.1, size: 7 },
  { left: "36%", top: "22%", delay: 0.45, size: 6 },
  { left: "62%", top: "14%", delay: 1.6, size: 8 },
  { left: "76%", top: "72%", delay: 0.9, size: 7 },
  { left: "90%", top: "28%", delay: 1.35, size: 6 }
];

export function FloatingPetals() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((petal, index) => (
        <motion.span
          key={`${petal.left}-${petal.top}`}
          className="cinematic-petal"
          style={{
            left: petal.left,
            top: petal.top,
            width: petal.size,
            height: petal.size * 1.7
          }}
          initial={{ opacity: 0, y: -12, rotate: index % 2 ? -18 : 14 }}
          animate={{
            opacity: [0, 0.62, 0],
            y: [0, 38, 86],
            x: [0, index % 2 ? 12 : -10, index % 2 ? -8 : 14],
            rotate: [index % 2 ? -18 : 14, index % 2 ? 22 : -24, index % 2 ? -8 : 28]
          }}
          transition={{
            duration: 7.5 + index * 0.5,
            delay: petal.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
