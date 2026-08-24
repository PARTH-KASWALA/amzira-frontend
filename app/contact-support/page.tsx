import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = buildMetadata({ title: "Contact Support", path: "/contact-support" });

export default function ContactSupportPage() {
  return (
    <section className="support-page" aria-labelledby="support-heading">
      <Image
        src="/images/support/contact-support-pavilion-hero.png"
        alt="Illustrated domed ceremonial pavilion in a peaceful flowering garden"
        fill
        priority
        sizes="100vw"
        className="support-page__art"
      />
      <div className="support-page__wash" aria-hidden="true" />

      <div className="container-page support-page__layout">
        <div className="support-page__copy">
          <div className="support-page__eyebrow">
            <span>Support</span>
            <span className="support-page__eyebrow-rule" aria-hidden="true" />
          </div>

          <h1 id="support-heading">We help before and after checkout.</h1>

          <div className="support-page__divider" aria-hidden="true">
            <span />
            <span className="support-page__lotus">&#10047;</span>
            <span />
          </div>

          <div className="support-page__body">
            <p>
              For product guidance, order updates, returns, or styling questions, contact AMZIRA support between
              <strong> 10 am and 7 pm, Monday to Saturday.</strong>
            </p>
            <p>
              Email <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> or call <a href={`tel:${COMPANY.supportPhone}`}>{COMPANY.supportPhoneDisplay}</a> with your order number, product name, size,
              and event date so the team can respond with the right context.
            </p>
            <p>
              <strong>Fraud alert:</strong> AMZIRA will never ask for your OTP, UPI PIN, card CVV, password, or remote
              access to your device. Report suspicious calls or messages to {COMPANY.supportEmail} immediately.
            </p>
            <p>
              <strong>Grievance Officer:</strong> Customer Support / Grievance Officer, AMZIRA. Complaints are acknowledged
              within 48 hours and handled as promptly as possible. Write to {COMPANY.supportEmail} with the subject
              &quot;Consumer grievance&quot; or call {COMPANY.supportPhoneDisplay}.
            </p>
            <p>Contact address: {COMPANY.address}.</p>
          </div>

          <a
            href={`mailto:${COMPANY.supportEmail}?subject=AMZIRA%20support%20request`}
            className="support-page__cta"
          >
            <Mail className="h-5 w-5" aria-hidden="true" /> Email support
          </a>
        </div>
      </div>
    </section>
  );
}
