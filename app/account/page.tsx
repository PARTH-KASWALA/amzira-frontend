import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account-dashboard";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Account", path: "/account" });

export default function AccountPage() {
  return (
    <section className="account-page kids-procession-bg min-h-[calc(100vh-200px)] pb-16">
      <div className="account-hero">
        <div className="container-page account-hero__content">
          <h1>Your AMZIRA closet</h1>
          <p>Keep delivery details, saved styles, and every celebration order together.</p>
          <div className="account-hero__rule" aria-hidden="true"><span /></div>
        </div>
      </div>
      <div className="container-page account-page__body kids-procession-bg pt-8">
        <AccountDashboard />
      </div>
    </section>
  );
}
