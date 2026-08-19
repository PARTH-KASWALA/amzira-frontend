"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Ruler, X } from "lucide-react";
import { sizeChartRows } from "@/lib/size-chart";

const focusableSelector = "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

const measurementSteps = [
  ["Choli length", "Measure from the highest shoulder point down to the choli hem."],
  ["Chest", "Measure around the fullest part of the chest, keeping the tape level."],
  ["Shoulder", "Measure straight across the back from one shoulder point to the other."],
  ["Choli waist", "Measure around the choli hemline without pulling the tape tight."],
  ["Lehenga length", "Measure from the waistband down to the desired hem length."],
  ["Lehenga waist", "Measure around the natural waist where the waistband will sit."],
  ["Ghera", "This is the lehenga flare shown as the supplied front and back measurements."]
] as const;

type MeasurementUnit = "in" | "cm";

function formatMeasurement(value: string, unit: MeasurementUnit) {
  if (unit === "in") return value;
  return value.replace(/\d+(?:\.\d+)?/g, (measurement) => {
    const centimeters = Number(measurement) * 2.54;
    return centimeters.toFixed(1).replace(/\.0$/, "");
  });
}

function SizeChart({
  selectedSize,
  unit,
  onUnitChange
}: {
  selectedSize: string | null;
  unit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex justify-end border-b border-charcoal/10 px-5 py-4 sm:px-8">
        <div className="inline-flex rounded-full border border-charcoal/15 bg-white p-1 text-xs font-bold" role="group" aria-label="Measurement unit">
          {(["in", "cm"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={unit === option}
              className={`focus-ring rounded-full px-4 py-2 ${unit === option ? "bg-maroon text-white" : "text-charcoal/60 hover:text-maroon"}`}
              onClick={() => onUnitChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-ivory shadow-[0_1px_0_rgba(34,34,34,0.12)]">
            <tr className="text-charcoal">
              <th scope="col" className="w-12 px-5 py-5"><span className="sr-only">Selected size</span></th>
              <th scope="col" className="px-3 py-5 font-semibold">Age group</th>
              <th scope="col" className="px-3 py-5 font-semibold">Brand size</th>
              <th scope="col" className="px-3 py-5 font-semibold">Choli length</th>
              <th scope="col" className="px-3 py-5 font-semibold">Chest</th>
              <th scope="col" className="px-3 py-5 font-semibold">Shoulder</th>
              <th scope="col" className="px-3 py-5 font-semibold">Choli waist</th>
              <th scope="col" className="px-3 py-5 font-semibold">Lehenga length</th>
              <th scope="col" className="px-3 py-5 font-semibold">Lehenga waist</th>
              <th scope="col" className="px-3 py-5 font-semibold">Ghera</th>
            </tr>
          </thead>
          <tbody>
            {sizeChartRows.map((row) => {
              const selected = selectedSize === row.age;
              return (
                <tr key={row.age} className={`border-b border-charcoal/10 ${selected ? "bg-gold/15" : "bg-white hover:bg-sandal/35"}`}>
                  <td className="px-5 py-5">
                    <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${selected ? "border-maroon" : "border-charcoal/35"}`} aria-hidden="true">
                      {selected ? <span className="h-2.5 w-2.5 rounded-full bg-maroon" /> : null}
                    </span>
                  </td>
                  <th scope="row" className="whitespace-nowrap px-3 py-5 font-bold text-charcoal">
                    {row.age}
                    {selected ? <span className="ml-2 text-[9px] uppercase tracking-[0.1em] text-maroon">Selected</span> : null}
                  </th>
                  <td className="px-3 py-5 font-semibold">{row.size}</td>
                  <td className="px-3 py-5">{formatMeasurement(row.choliLength, unit)}</td>
                  <td className="px-3 py-5">{formatMeasurement(row.choliChest, unit)}</td>
                  <td className="px-3 py-5">{formatMeasurement(row.choliShoulder, unit)}</td>
                  <td className="px-3 py-5">{formatMeasurement(row.choliWaist, unit)}</td>
                  <td className="px-3 py-5">{formatMeasurement(row.lehengaLength, unit)}</td>
                  <td className="px-3 py-5">{formatMeasurement(row.lehengaWaist, unit)}</td>
                  <td className="whitespace-nowrap px-3 py-5">{formatMeasurement(row.lehengaGhera, unit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="border-t border-gold/25 bg-ivory px-5 py-4 text-center text-xs text-charcoal/65 sm:px-8">
        Garment measurements in {unit === "in" ? "inches" : "centimeters"}. The 2-4Y Excel measurements apply to both 2-3Y and 3-4Y inventory bands.
      </p>
    </div>
  );
}

function HowToMeasure() {
  return (
    <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7 flex items-center gap-4 border-b border-gold/30 pb-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-maroon text-white">
            <Ruler className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-3xl font-semibold text-maroon-deep">Measure over light clothing</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal/65">Keep the tape comfortably close to the body and parallel to the floor.</p>
          </div>
        </div>
        <dl className="divide-y divide-charcoal/10 border-y border-charcoal/10">
          {measurementSteps.map(([term, description]) => (
            <div key={term} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="font-bold text-maroon-deep">{term}</dt>
              <dd className="text-sm leading-6 text-charcoal/68">{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function SizeChartDialog({ selectedSize }: { selectedSize?: string | null }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chart" | "measure">("chart");
  const [unit, setUnit] = useState<MeasurementUnit>("in");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      trigger?.focus();
    };
  }, [open]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || []);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="focus-ring inline-flex min-h-11 items-center gap-1 px-1 text-sm font-bold uppercase tracking-[0.08em] text-maroon hover:text-maroon-deep"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Size chart
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? createPortal(
        <div
          className="fixed inset-0 z-[120] bg-charcoal/75 backdrop-blur-[1px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
            className="ml-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-ivory shadow-2xl"
            onKeyDown={handleDialogKeyDown}
          >
            <header className="flex items-center justify-between gap-5 border-b border-charcoal/10 bg-white px-5 py-4 sm:px-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep">AMZIRA fit guide</p>
                <h2 id="size-chart-title" className="mt-1 font-display text-3xl font-semibold text-maroon-deep sm:text-4xl">Lehenga Choli Size Guide</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-charcoal/20 bg-white text-charcoal transition hover:border-maroon hover:text-maroon"
                aria-label="Close size chart"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="grid grid-cols-2 border-b border-charcoal/10 bg-white" role="tablist" aria-label="Size guide sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "chart"}
                className={`focus-ring min-h-14 border-b-2 px-4 text-sm font-bold ${activeTab === "chart" ? "border-maroon text-maroon" : "border-transparent text-charcoal/65 hover:text-maroon"}`}
                onClick={() => setActiveTab("chart")}
              >
                Size chart
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "measure"}
                className={`focus-ring min-h-14 border-b-2 px-4 text-sm font-bold ${activeTab === "measure" ? "border-maroon text-maroon" : "border-transparent text-charcoal/65 hover:text-maroon"}`}
                onClick={() => setActiveTab("measure")}
              >
                How to measure
              </button>
            </div>

            {activeTab === "chart" ? (
              <SizeChart selectedSize={selectedSize || null} unit={unit} onUnitChange={setUnit} />
            ) : (
              <HowToMeasure />
            )}
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
