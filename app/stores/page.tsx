import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Stores", path: "/stores" });

export default function StoresPage() {
  return (
    <SimplePage
      kicker="Stores"
      title="AMZIRA store experiences are coming online."
      body={[
        "The production storefront is built to support store locator, appointment booking, and view-collection journeys as inventory expands.",
        "For launch, online shopping and support channels remain the primary buying path."
      ]}
      cta={{ label: "Contact support", href: "/contact-support" }}
    />
  );
}
