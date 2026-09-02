"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { browserApi } from "@/lib/api/browser-client";

export function SellerLoginForm() {
  const router = useRouter();
  const { customer, status: sessionStatus, refresh, logout } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStatus === "authenticated" && customer?.role === "admin") router.replace("/seller/orders");
  }, [customer, router, sessionStatus]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await browserApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: String(form.get("email") || ""), password: String(form.get("password") || "") })
      });
      const signedInCustomer = await refresh();
      if (signedInCustomer?.role !== "admin") {
        await logout();
        setMessage("This account does not have seller access.");
        return;
      }
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const nextPath = requestedPath?.startsWith("/seller/") ? requestedPath : "/seller/orders";
      router.replace(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Seller sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-slate-200">
        Admin email
        <input className="min-h-12 rounded-xl border border-white/15 bg-white/10 px-4 font-normal text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none" name="email" type="email" autoComplete="username" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-200">
        Password
        <span className="relative block">
          <input className="min-h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 pr-12 font-normal text-white focus:border-amber-300 focus:outline-none" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={8} required />
          <button className="focus-ring absolute inset-y-0 right-0 grid w-12 place-items-center rounded-xl text-slate-400 hover:text-white" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </span>
      </label>
      <button className="focus-ring mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-extrabold text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit">
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        {submitting ? "Verifying access…" : "Sign in to seller desk"}
      </button>
      {message ? <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100" role="alert">{message}</p> : null}
      <Link className="focus-ring justify-self-center rounded text-xs font-semibold text-slate-400 hover:text-white" href="/">Return to storefront</Link>
    </form>
  );
}
