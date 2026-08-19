import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description: "Find answers about AMZIRA South Indian kids' lehenga choli, sizing guidance, 36-hour returns, and delivery.",
  path: "/faqs"
});

const faqCategories = [
  {
    category: "Collections & Craftsmanship",
    items: [
      [
        "What products does AMZIRA currently offer?",
        "AMZIRA specializes in authentic South Indian luxury ceremony wear for young girls, featuring handcrafted Pattu Pavadai sets, Temple Border Lehenga Cholis, and Kanjeevaram-inspired silk outfits. Women's, men's, and boys' collections are launching soon."
      ],
      [
        "Are the fabrics comfortable for children's delicate skin?",
        "Yes. Every AMZIRA outfit features a 100% soft breathable cotton inner lining to prevent itching, along with generous inner seam allowances for easy future size alterations as your child grows."
      ],
      [
        "How do I choose the correct size for my child?",
        "Our sizes are categorized by age bands (e.g. 1-2Y, 2-3Y, 3-4Y up to 9-10Y). You can refer to the interactive Size Chart on any product page or book a complimentary virtual styling appointment with an AMZIRA consultant."
      ]
    ]
  },
  {
    category: "36-Hour Returns & Exchanges",
    items: [
      [
        "What is AMZIRA's 36-Hour Return Policy?",
        "We offer a 36-hour return and exchange window starting from the exact time of delivery. You can request a return directly from your Account Orders dashboard within this 36-hour window."
      ],
      [
        "What happens after the 36-hour return window expires?",
        "After 36 hours from delivery, the return request option automatically closes in your account portal as per AMZIRA's policy. If you face any exceptional concern, please contact our support team immediately."
      ],
      [
        "Are customized or altered products eligible for return?",
        "Ready-to-ship catalog outfits are fully eligible within 36 hours. Made-to-measure or custom-stitched garments are non-returnable unless there is a verified defect or incorrect item delivered."
      ]
    ]
  },
  {
    category: "Shipping & Orders",
    items: [
      [
        "What are your delivery charges and timelines?",
        "We offer FREE Express Courier delivery across India on all orders above ₹1,999. In-stock orders are dispatched within 24-48 hours and typically arrive within 3-5 business days."
      ],
      [
        "How can I track my order status?",
        "You can track your order in real-time by visiting our Track Order page (/order-tracking) using your Order ID (e.g. AMZ-123456) or by logging into your Account dashboard."
      ]
    ]
  }
];

export default function FaqsPage() {
  return (
    <div className="bg-[#FDFAF5] py-10 sm:py-16 min-h-[calc(100vh-200px)]">
      <section className="container-page space-y-10">
        {/* Header & Lotus Ornament */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-amber-800" /> Customer Support Center
          </div>
          <h1 className="font-display text-4xl font-semibold text-maroon-deep sm:text-5xl lg:text-6xl tracking-tight">
            Shopping Guidance
          </h1>

          {/* Lotus Line Art Ornament Divider */}
          <div className="flex items-center gap-3 my-3 w-48">
            <div className="h-px bg-gradient-to-r from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5 text-amber-800/60 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 3C12 3 8.5 7.5 8.5 12C8.5 14.5 10 16.5 12 17C14 16.5 15.5 14.5 15.5 12C15.5 7.5 12 3 12 3Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C9.5 17 4 14 4 11C4 9.5 5.5 8.5 7 9C9 9.5 10.5 11.5 12 17Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C14.5 17 20 14 20 11C20 9.5 18.5 8.5 17 9C15 9.5 13.5 11.5 12 17Z"
                stroke="currentColor"
              />
            </svg>
            <div className="h-px bg-gradient-to-l from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
          </div>

          <p className="text-sm sm:text-base leading-6 text-charcoal/70">
            Find quick answers regarding our South Indian kids&apos; ceremony wear, size guidance, 36-hour returns, and express shipping.
          </p>
        </div>

        {/* FAQ Accordions List */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((group) => (
            <div className="space-y-4" key={group.category}>
              <h2 className="font-display text-2xl font-semibold text-maroon-deep border-b border-amber-900/10 pb-2">
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map(([question, answer]) => (
                  <details
                    key={question}
                    className="group rounded-2xl border border-amber-900/10 bg-[#FAF7F2] p-5 transition-colors hover:bg-white"
                  >
                    <summary className="cursor-pointer font-display text-lg font-semibold text-maroon-deep list-none flex items-center justify-between gap-4">
                      <span>{question}</span>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10 text-xs font-bold transition group-open:rotate-180">
                        ↓
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-charcoal/70 border-t border-amber-900/10 pt-3">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support Help Banner */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-amber-900/10 bg-white p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <MessageSquare className="mx-auto h-8 w-8 text-maroon" />
          <h3 className="font-display text-2xl font-semibold text-maroon-deep">Still have questions?</h3>
          <p className="text-xs text-charcoal/65 max-w-md mx-auto">
            Our boutique concierge team is happy to assist with custom styling, measurements, or order queries.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link className="btn-primary gap-2 rounded-xl bg-[#580B26]" href="/contact-support">
              Contact Support Team <ArrowRight className="h-4 w-4" />
            </Link>
            <a className="btn-secondary gap-2 rounded-xl" href="mailto:care@amzira.com">
              <Mail className="h-4 w-4" /> Email care@amzira.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
