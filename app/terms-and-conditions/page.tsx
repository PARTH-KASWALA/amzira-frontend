import { SimplePage } from "@/components/simple-page";

export default function TermsPage() {
  return (
    <SimplePage
      kicker="Policy"
      title="Terms and conditions"
      body={[
        "By using AMZIRA, customers agree to product availability, pricing, order confirmation, shipping, cancellation, and return terms shown during checkout.",
        "AMZIRA may update catalog details, pricing, delivery timelines, and policies as business operations scale."
      ]}
    />
  );
}
