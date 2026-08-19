"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (!visibleEntry) return;
        const nextActive = Number(visibleEntry.target.getAttribute("data-gallery-index"));
        if (!Number.isNaN(nextActive)) setActive(nextActive);
      },
      { rootMargin: "-25% 0px -45% 0px", threshold: [0.35, 0.55, 0.75] }
    );

    imageRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [images]);

  useEffect(() => {
    if (!zoomed) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [zoomed]);

  const openImage = (index: number) => {
    setActive(index);
    setZoomed(true);
  };

  const scrollToImage = (index: number) => {
    setActive(index);
    imageRefs.current[index]?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const image = images[active] || images[0];

  return (
    <div className="grid items-start gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto md:sticky md:top-32 md:order-1 md:grid md:content-start">
        {images.slice(0, 6).map((source, index) => (
          <button
            type="button"
            key={`${source}-${index}`}
            className={`focus-ring relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md border bg-sandal md:w-[88px] ${active === index ? "border-maroon" : "border-charcoal/10"}`}
            aria-label={`Scroll to image ${index + 1} of ${name}`}
            aria-pressed={active === index}
            onClick={() => scrollToImage(index)}
          >
            <Image src={source} alt="" fill sizes="88px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="order-1 grid snap-y snap-mandatory gap-4 md:order-2">
        {images.slice(0, 6).map((source, index) => (
          <div
            key={`${source}-${index}`}
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
            data-gallery-index={index}
            className="relative aspect-[4/5] snap-start overflow-hidden rounded-md bg-sandal shadow-soft"
          >
            <Image
              src={source}
              alt={index === 0 ? name : `${name}, view ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <button type="button" className="icon-button absolute bottom-4 right-4" aria-label={`Enlarge ${name} image ${index + 1}`} onClick={() => openImage(index)}>
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {zoomed ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-charcoal/90 p-4" role="dialog" aria-modal="true" aria-label={`${name} enlarged image`} onClick={() => setZoomed(false)}>
          <button type="button" className="icon-button absolute right-4 top-4" aria-label="Close enlarged image" onClick={() => setZoomed(false)}><X className="h-5 w-5" aria-hidden="true" /></button>
          <div className="relative h-[88dvh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image src={image} alt={`${name}, enlarged view ${active + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
