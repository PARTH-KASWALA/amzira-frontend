import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SellerLoginForm } from "@/components/seller/seller-login-form";

export const metadata: Metadata = { title: "Seller sign in | AMZIRA", robots: { index: false, follow: false } };

export default function SellerLoginPage() {
  return (
    <section className="grid min-h-screen place-items-center bg-slate-950 px-5 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#8a1538] shadow-lg">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">AMZIRA operations</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Seller desk</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Protected order fulfilment access for authorised team members.</p>
        <SellerLoginForm />
      </div>
    </section>
  );
}
