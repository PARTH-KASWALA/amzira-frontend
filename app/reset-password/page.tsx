import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Choose a new password", path: "/reset-password" }),
  robots: { index: false, follow: false }
};

export default function ResetPasswordPage() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-kicker">Account help</p>
          <h1 className="mt-3 font-display text-6xl text-maroon-deep">Choose a new password</h1>
          <p className="mt-5 leading-8 text-charcoal/70">Use a strong password that you do not use for another account.</p>
        </div>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-md bg-charcoal/5" aria-label="Loading password reset" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </section>
  );
}
