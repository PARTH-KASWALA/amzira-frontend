"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { useSession } from "@/components/session-provider";

export function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useSession();

  async function signOut() {
    await logout();
    router.replace("/seller/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-white/10 bg-slate-950 px-5 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link className="focus-ring inline-flex items-center gap-3 rounded-lg" href="/seller/orders">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#8a1538]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <strong className="block font-display text-xl">AMZIRA</strong>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Seller desk</span>
            </span>
          </Link>
          <Link className="focus-ring rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" href="/" aria-label="Open storefront">
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <nav className="mt-5 flex gap-2 lg:mt-10 lg:grid" aria-label="Seller navigation">
          <Link
            className={`focus-ring flex min-h-11 flex-1 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition lg:flex-none ${
              pathname.startsWith("/seller/orders") ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            href="/seller/orders"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Orders
          </Link>
        </nav>

        <div className="mt-5 hidden border-t border-white/10 pt-5 lg:absolute lg:inset-x-5 lg:bottom-5 lg:block">
          <p className="truncate text-xs font-semibold text-white">{customer?.fullName}</p>
          <p className="mt-1 truncate text-[11px] text-slate-400">{customer?.email}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 text-xs font-semibold hover:bg-white/10" href="/">
              Store <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 text-xs font-semibold hover:bg-white/10" onClick={() => void signOut()} type="button">
              Sign out <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
