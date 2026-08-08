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
        <div className="rounded-md border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <Link className="btn-primary" href="/login">
              Sign in
            </Link>
            <Link className="btn-secondary" href="/signup">
              Create account
            </Link>
            <Link className="focus-ring rounded-sm text-sm font-semibold text-maroon" href="/forgot-password">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
