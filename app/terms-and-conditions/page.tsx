import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { COMPANY } from "@/lib/company";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Terms of Services", description: "Terms governing use of the AMZIRA website, accounts, orders, payments, delivery, returns, and support.", path: "/terms-and-conditions" });

export default function TermsPage() {
  return <SimplePage
    kicker="Customer policy"
    title="Terms of services"
    body={[
      "These Terms of Services govern access to and use of the AMZIRA website, account, product catalogue, checkout, order tracking, customer support, and related services. By using the website or placing an order, you confirm that you have read and accepted these Terms, our Privacy Policy, Shipping Policy, and Cancellation, Return & Exchange Policy.",
      "AMZIRA is an India-based direct-to-customer ecommerce storefront for South Indian girls' occasionwear. The information shown at checkout, including price, tax, delivery charge, stock, and order total, controls the transaction for that order."
    ]}
    sections={[
      { title: "Eligibility and account security", paragraphs: ["The website and checkout are intended for adults, parents, guardians, or other authorised purchasers. You are responsible for providing accurate account, delivery, and contact information and for keeping passwords, OTPs, and account access confidential.", "Notify us immediately if you suspect unauthorised use. We may suspend or restrict an account where necessary to protect customers, AMZIRA, payment systems, or the integrity of the service."] },
      { title: "Product information", paragraphs: ["We take reasonable care to describe products, sizes, fabrics, colours, embellishments, care instructions, country of origin, availability, and prices accurately. Hand finishing, fabric weave, screen settings, and photography can create minor differences that are not material defects.", "Please use the product measurements and size guidance before ordering. For children, age is only a guide; body measurements and the intended fit are more reliable."] },
      { title: "Orders and payment", paragraphs: ["Adding an item to a cart does not reserve stock. An order becomes eligible for fulfilment after the payment is authorised and AMZIRA has issued an order confirmation. We may contact you to verify an order, address, payment, or unusual activity.", "If an item becomes unavailable, a price or catalogue error is discovered, payment is not confirmed, or fraud risk is identified, AMZIRA may cancel the affected order and initiate a refund of amounts received for that order. Nothing in these Terms limits rights that cannot lawfully be excluded."] },
      { title: "Pricing and promotions", paragraphs: ["Prices, taxes, delivery charges, promotional codes, and offer conditions are displayed at checkout or on the applicable product page. Promotions may have separate eligibility, quantity, expiry, and return conditions. A promotion cannot be combined with another offer unless expressly stated."] },
      { title: "Delivery, cancellation, returns, and refunds", paragraphs: ["Delivery is governed by the Shipping Policy. Cancellation, 36-hour return eligibility, exchange, inspection, and refunds are governed by the Cancellation, Return & Exchange Policy. Product-specific exclusions displayed before payment form part of the order terms.", "We do not ask customers to pay a person by personal UPI, share a UPI PIN, install remote-access software, or disclose an OTP to release a refund or delivery."] },
      { title: "Acceptable use and intellectual property", paragraphs: ["You must not misuse the website, interfere with its security, submit malicious code, scrape or copy catalogue content at scale, impersonate AMZIRA, submit unlawful or misleading material, or use the service for fraudulent or commercial purposes without permission.", "AMZIRA names, logos, visual identity, copy, photographs, illustrations, product content, and software are owned by or licensed to AMZIRA and may not be copied, modified, republished, or commercially used without written permission."] },
      { title: "Reviews and customer submissions", paragraphs: ["If you send a review, photograph, feedback, styling request, or other content, you confirm that you have the right to share it and that it is not unlawful, deceptive, defamatory, invasive of privacy, or infringing. You give AMZIRA permission to use it for operating, improving, and promoting the service, subject to applicable law and our Privacy Policy."] },
      { title: "Limitation and service changes", paragraphs: ["We work to keep the website available and accurate, but online services may be interrupted for maintenance, network failure, courier disruption, payment failure, security events, or circumstances outside our reasonable control. We may update products, features, prices, service providers, and policies; the version posted on the website applies from its stated update date.", "Nothing in these Terms excludes liability or a consumer right that cannot be excluded under applicable law."] },
      { title: "Governing law and contact", paragraphs: [`These Terms are governed by the laws applicable in India. Customers may use the consumer remedies available under applicable law. For questions, contact ${COMPANY.supportEmail} or ${COMPANY.supportPhoneDisplay}.`, `AMZIRA contact address: ${COMPANY.address}.`] }
    ]}
  />;
}
