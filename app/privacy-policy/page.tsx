import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read how AMZIRA collects, uses, shares, protects, and retains customer information for accounts, orders, payments, delivery, returns, and support.",
  path: "/privacy-policy"
});

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We collect information that you provide directly, including your name, email address, phone number, delivery and billing addresses, account login details, saved addresses, wishlist activity, cart details, order details, return or cancellation requests, support messages, and any information you choose to share with us.",
      "We also collect limited technical information when you use the website, such as device type, browser type, IP address, approximate location derived from network information, pages viewed, referral URLs, session activity, security logs, and cookie or similar identifier data."
    ]
  },
  {
    title: "Payments",
    body: [
      "AMZIRA does not store full card numbers, CVV values, UPI PINs, net-banking passwords, or similar payment credentials. Payments are processed by Razorpay or another payment provider shown at checkout.",
      "We receive payment-related status information needed to confirm, cancel, refund, reconcile, and protect orders, such as payment ID, order ID, amount, currency, payment status, refund status, and fraud or risk signals."
    ]
  },
  {
    title: "How We Use Information",
    body: [
      "We use customer information to create and manage accounts, show products and availability, reserve stock, process orders, collect payment, arrange shipping, send order and delivery updates, manage cancellations, returns, refunds, support requests, and customer communications.",
      "We also use information to prevent fraud and abuse, secure the website, debug errors, improve performance, maintain tax and accounting records, comply with law, enforce our terms, and understand how customers use AMZIRA so we can improve the service."
    ]
  },
  {
    title: "Sharing With Service Providers",
    body: [
      "We share only the information reasonably required for a service provider to perform work for AMZIRA. These providers may include payment processors such as Razorpay, logistics and courier partners such as Shiprocket and its courier network, email providers such as Resend, hosting providers such as Vercel and Render, storage or CDN providers such as Cloudflare, monitoring tools such as Sentry, analytics providers, fraud-prevention providers, and professional advisers.",
      "Delivery partners may receive recipient name, phone number, delivery address, package details, shipment value, tracking information, return details, and order identifiers needed to deliver, return, or resolve shipments."
    ]
  },
  {
    title: "Cookies And Similar Technologies",
    body: [
      "AMZIRA uses necessary cookies and local storage for account sessions, cart continuity, checkout security, CSRF protection, fraud prevention, and basic website operation.",
      "If analytics, advertising, or personalization tools are enabled, they may use cookies or similar technologies to measure traffic and ecommerce events. Where required, we will ask for consent or provide controls before using non-essential cookies."
    ]
  },
  {
    title: "Emails And Service Messages",
    body: [
      "We send transactional messages for account registration, password reset, order confirmation, payment confirmation, shipment updates, delivery updates, cancellation, return, refund, and important service or security notices.",
      "Marketing messages, if enabled, will include a way to opt out. Opting out of marketing does not stop necessary transactional or security communications."
    ]
  },
  {
    title: "Children's Privacy",
    body: [
      "AMZIRA sells occasion wear for children, but the website and checkout are intended for use by adults, parents, guardians, or other authorized purchasers.",
      "We do not knowingly ask children to create accounts or provide personal information directly. If you believe a child has provided personal information to AMZIRA without appropriate permission, contact us and we will review the request."
    ]
  },
  {
    title: "Data Retention",
    body: [
      "We retain information for as long as needed to provide the service, complete transactions, resolve disputes, prevent fraud, meet accounting, tax, logistics, legal, and audit obligations, and enforce our policies.",
      "When information is no longer needed, we delete, anonymize, or restrict it where practical, subject to lawful retention requirements."
    ]
  },
  {
    title: "Your Choices And Rights",
    body: [
      "You may ask us to access, correct, update, delete, or restrict certain personal information, withdraw consent where processing is based on consent, or raise a privacy grievance. Some requests may be limited where information is required for open orders, legal compliance, fraud prevention, tax records, dispute resolution, or security.",
      `To make a privacy request, email ${COMPANY.supportEmail} with the subject line Privacy Request. We may need to verify your identity before acting on the request.`
    ]
  },
  {
    title: "Security",
    body: [
      "We use technical and organizational safeguards designed to protect customer information, including HTTPS, access controls, secret management, payment-provider tokenization or redirection, logging controls, and monitoring.",
      "No online service can guarantee absolute security. Please use a strong password, keep account credentials private, and contact us immediately if you suspect unauthorized account activity."
    ]
  },
  {
    title: "International Processing",
    body: [
      "Some service providers may process or store information in India or other countries where they operate. When we use such providers, we rely on their security, privacy, contractual, and compliance commitments to protect the information they process for AMZIRA."
    ]
  },
  {
    title: "Policy Updates",
    body: [
      "We may update this Privacy Policy as AMZIRA changes its website, checkout, service providers, legal requirements, or business operations. The latest version will be posted on this page with the updated date."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <section className="container-page py-14" aria-labelledby="privacy-heading">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-maroon">Policy</p>
        <h1 id="privacy-heading" className="mt-3 font-display text-5xl font-semibold leading-[1.04] text-maroon-deep sm:text-6xl">
          Privacy policy
        </h1>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-charcoal/55">
          Last updated: August 24, 2026
        </p>

        <div className="mt-8 space-y-6 border-t border-charcoal/10 pt-7 text-base leading-8 text-charcoal/70">
          <p>
            This Privacy Policy explains how AMZIRA collects, uses, shares, stores, and protects information when you
            visit amzira.com, create an account, place an order, request support, or otherwise use our ecommerce
            services.
          </p>
          <p>
            By using AMZIRA, you agree to this policy and to the related{" "}
            <Link href="/terms-and-conditions" className="font-semibold text-maroon underline-offset-4 hover:underline">
              Terms and Conditions
            </Link>
            ,{" "}
            <Link href="/shipping-policy" className="font-semibold text-maroon underline-offset-4 hover:underline">
              Shipping Policy
            </Link>
            , and{" "}
            <Link href="/returns-refund-policy" className="font-semibold text-maroon underline-offset-4 hover:underline">
              Cancellation, Return and Exchange Policy
            </Link>
            .
          </p>

          {sections.map((section) => (
            <section key={section.title} className="space-y-3 pt-2" aria-labelledby={section.title.toLowerCase().replaceAll(" ", "-")}>
              <h2 id={section.title.toLowerCase().replaceAll(" ", "-")} className="font-display text-3xl font-semibold leading-tight text-maroon-deep">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <section className="space-y-3 pt-2" aria-labelledby="contact-us">
            <h2 id="contact-us" className="font-display text-3xl font-semibold leading-tight text-maroon-deep">
              Contact Us
            </h2>
            <p>
              For privacy questions, account-data requests, or grievances, email{" "}
              <a href={`mailto:${COMPANY.supportEmail}?subject=Privacy%20Request`} className="font-semibold text-maroon underline-offset-4 hover:underline">
                {COMPANY.supportEmail}
              </a>
              . Please include enough information for us to identify your account or order without sending passwords,
              OTPs, full payment details, or other unnecessary sensitive information. You may also write to {COMPANY.address}.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
