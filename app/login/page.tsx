import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to your AMZIRA account to view orders, addresses, returns, and saved styles.",
  path: "/login",
  noIndex: true
});

export default function LoginPage() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-kicker">Account</p>
          <h1 className="mt-3 font-display text-6xl text-maroon-deep">Sign in to AMZIRA</h1>
          <p className="mt-5 leading-8 text-charcoal/70">
            Access orders, delivery tracking, return eligibility, saved addresses, and styling notes.
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </section>
  );
}
