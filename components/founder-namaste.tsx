"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AboutHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion || autoplayFailed) return;

    void video.play().catch(() => setAutoplayFailed(true));
  }, [reducedMotion, autoplayFailed]);

  const showPoster = reducedMotion || autoplayFailed;

  return (
    <div className="about-cinematic-hero__media" role="group" aria-label="AMZIRA founders welcome">
      {showPoster ? (
        <Image
          className="about-cinematic-hero__poster"
          src="/images/about/amzira-about-cinematic-poster-v2.png"
          alt="The two AMZIRA founders in a Mahadev temple setting"
          fill
          priority
          sizes="100vw"
          unoptimized
        />
      ) : (
        <video
          ref={videoRef}
          className="about-cinematic-hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/about/amzira-about-cinematic-poster-v2.png"
          aria-label="The two AMZIRA founders welcoming visitors with namaste"
          onError={() => setAutoplayFailed(true)}
        >
          <source src="/images/about/amzira-about-cinematic-hero-v2.mp4" type="video/mp4" />
          Your browser does not support the founders welcome video.
        </video>
      )}
    </div>
  );
}
