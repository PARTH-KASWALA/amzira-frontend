"use client";

export default function SellerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white"><div className="max-w-md text-center"><h1 className="font-display text-3xl font-semibold">Seller desk could not load</h1><p className="mt-3 text-sm text-slate-400">No order was changed. Retry the page, or return to the order list.</p><button className="focus-ring mt-6 min-h-11 rounded-xl bg-white px-5 text-sm font-bold text-slate-950" type="button" onClick={reset}>Try again</button></div></div>;
}
