import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create Account",
  description: "Create an AMZIRA account for faster checkout, order tracking, saved addresses, and return requests.",
  path: "/signup"
});

export default function SignupPage() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-kicker">Join AMZIRA</p>
          <h1 className="mt-3 font-display text-6xl text-maroon-deep">Create your account</h1>
          <p className="mt-5 leading-8 text-charcoal/70">
            Keep your wedding and festive shopping details together with secure checkout and order support.
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </section>
  );
}
