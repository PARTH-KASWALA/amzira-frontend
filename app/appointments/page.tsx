import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Kids Styling Appointments", path: "/appointments" });

export default function AppointmentsPage() {
  return (
    <SimplePage
      kicker="Appointments"
      title="Plan every ceremony look with a stylist."
      body={[
        "Use appointments for kids' size guidance, choli fit, custom measurements, and event-wise outfit planning.",
        "Bring your ceremony dates, color preferences, budget range, and delivery city. AMZIRA will use this to guide product selection and stitching timelines."
      ]}
      cta={{ label: "Start shopping", href: "/category/kids-pattu-pavadai" }}
    />
  );
}
