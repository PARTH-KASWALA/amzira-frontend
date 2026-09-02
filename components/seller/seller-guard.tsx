"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { useSession } from "@/components/session-provider";

export function SellerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, status } = useSession();

  useEffect(() => {
    if (status === "guest") router.replace(`/seller/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router, status]);

  if (status === "loading" || status === "guest") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white" aria-live="polite">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-amber-300" />
          <p className="mt-4 text-sm text-slate-300">Verifying seller access…</p>
        </div>
      </div>
    );
  }

  if (customer?.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-300" aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-semibold">Seller access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This account is signed in, but it does not have the admin role required to manage orders.
          </p>
          <Link className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-slate-950" href="/account">
            Return to my account
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
