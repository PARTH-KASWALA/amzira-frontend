"use client";

import { SlidersHorizontal } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";

type MobileCategoryFiltersProps = {
  activeFilterCount: number;
  children: ReactNode;
};

export function MobileCategoryFilters({ activeFilterCount, children }: MobileCategoryFiltersProps) {
  // Start closed so mobile never renders an expanded filter sheet before the
  // viewport sync runs. Desktop still renders the form through its CSS rule.
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 639px)");
    const syncWithViewport = () => {
      setIsOpen(!mobileViewport.matches);
    };

    syncWithViewport();
    mobileViewport.addEventListener("change", syncWithViewport);

    return () => mobileViewport.removeEventListener("change", syncWithViewport);
  }, []);

  function syncWithDisclosure(event: SyntheticEvent<HTMLDetailsElement>) {
    const nextOpen = event.currentTarget.open;
    if (nextOpen !== isOpen) setIsOpen(nextOpen);
  }

  function closeAfterApplyingFilters() {
    if (window.matchMedia("(max-width: 639px)").matches) {
      setIsOpen(false);
    }
  }

  return (
    <details
      className="kids-catalog-filters"
      open={isOpen}
      onToggle={syncWithDisclosure}
      onSubmitCapture={closeAfterApplyingFilters}
    >
      <summary className="flex list-none items-center justify-between gap-3 border-b border-charcoal/10 pb-4">
        <span className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-gold" aria-hidden="true" />
          <span className="font-semibold uppercase tracking-[0.16em]">Filter</span>
          <span className="kids-catalog-active-filter-count">({activeFilterCount})</span>
        </span>
        <span className="catalog-filter-panel__toggle text-xs font-semibold uppercase tracking-[0.12em] text-maroon">Filter &amp; sort</span>
      </summary>
      {children}
    </details>
  );
}
