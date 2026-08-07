import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "FAQs", path: "/faqs" });

const faqs = [
  ["Do you sell South Indian lehenga choli?", "Yes. AMZIRA focuses on South Indian luxury ethnic wear including bridal pattu lehengas, Kanjeevaram-inspired lehengas, half sarees, and festive pieces."],
  ["Can I choose custom stitching?", "Custom stitching is planned through styling appointments and supported sizes on product pages."],
  ["How do returns work?", "Return eligibility depends on product type, stitching status, and delivery date. Review the returns policy before checkout."],
  ["Do product pages support rich search results?", "Product pages include server-rendered metadata and Product/Offer structured data for search systems."]
];

export default function FaqsPage() {
  return (
    <section className="container-page py-14">
      <p className="section-kicker">FAQs</p>
      <h1 className="mt-3 font-display text-6xl text-maroon-deep">Shopping guidance</h1>
      <div className="mt-8 grid gap-4">
        {faqs.map(([question, answer]) => (
          <details key={question} className="rounded-md border border-charcoal/10 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-semibold text-maroon-deep">{question}</summary>
            <p className="mt-3 leading-8 text-charcoal/70">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
