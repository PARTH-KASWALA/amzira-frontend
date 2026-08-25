import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Forgot Password",
  description: "Request AMZIRA password reset instructions for your account.",
  path: "/forgot-password",
  noIndex: true
});

export default function ForgotPasswordPage() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-kicker">Account help</p>
          <h1 className="mt-3 font-display text-6xl text-maroon-deep">Reset your password</h1>
          <p className="mt-5 leading-8 text-charcoal/70">
            Enter the email linked to your AMZIRA account and we will send reset instructions if the account exists.
          </p>
        </div>
        <AuthForm mode="forgot" />
      </div>
    </section>
  );
}
