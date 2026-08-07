import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Account", path: "/account" });

export default function AccountPage() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-kicker">Account</p>
          <h1 className="mt-3 font-display text-6xl text-maroon-deep">Your AMZIRA closet</h1>
          <p className="mt-5 leading-8 text-charcoal/70">
            Sign in to view orders, saved styles, addresses, and appointment notes.
          </p>
        </div>
        <form className="rounded-md border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">
              Email or mobile number
              <input className="min-h-11 rounded-md border border-charcoal/15 px-4" type="text" autoComplete="username" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input className="min-h-11 rounded-md border border-charcoal/15 px-4" type="password" autoComplete="current-password" />
            </label>
            <button type="button" className="btn-primary">Sign in</button>
            <Link className="focus-ring rounded-sm text-sm font-semibold text-maroon" href="/contact-support">Need help signing in?</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
