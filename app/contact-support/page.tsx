import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Contact Support", path: "/contact-support" });

export default function ContactSupportPage() {
  return (
    <SimplePage
      kicker="Support"
      title="We help before and after checkout."
      body={[
        "For product guidance, order updates, returns, or styling questions, contact AMZIRA support between 10 am and 7 pm, Monday to Saturday.",
        "Email care@amzira.com with your order number, product name, size, and event date so the team can respond with the right context."
      ]}
      cta={{ label: "Book appointment", href: "/appointments" }}
    />
  );
}
