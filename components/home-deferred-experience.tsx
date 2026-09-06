"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LuxuryCard } from "@/components/luxury-card-grid";

const CinematicSection = dynamic(
  () => import("@/components/cinematic-section").then((module) => module.CinematicSection)
);
const LuxuryCardGrid = dynamic(
  () => import("@/components/luxury-card-grid").then((module) => module.LuxuryCardGrid)
);
const ProcessionGifSection = dynamic(
  () => import("@/components/procession-gif-section").then((module) => module.ProcessionGifSection)
);

function DeferredSlot({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={visible ? undefined : { minHeight }} aria-busy={!visible}>{visible ? children : null}</div>;
}

export function DeferredLuxuryCardGrid({ cards }: { cards?: LuxuryCard[] }) {
  return <DeferredSlot minHeight={640}><LuxuryCardGrid cards={cards} /></DeferredSlot>;
}

export function DeferredCinematicSection() {
  return <DeferredSlot minHeight={560}><CinematicSection /></DeferredSlot>;
}

export function DeferredProcessionGifSection() {
  return <DeferredSlot minHeight={420}><ProcessionGifSection /></DeferredSlot>;
}
