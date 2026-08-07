import { SimplePage } from "@/components/simple-page";

export default function PrivacyPolicyPage() {
  return (
    <SimplePage
      kicker="Policy"
      title="Privacy policy"
      body={[
        "AMZIRA collects account, contact, address, cart, order, and payment-related information required to run the ecommerce service.",
        "Payment details are handled through secure payment providers. AMZIRA uses customer data for order fulfillment, support, fraud prevention, and service communication."
      ]}
    />
  );
}
