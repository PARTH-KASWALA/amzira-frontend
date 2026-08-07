import { SimplePage } from "@/components/simple-page";

export default function ShippingPolicyPage() {
  return (
    <SimplePage
      kicker="Policy"
      title="Shipping policy"
      body={[
        "AMZIRA ships eligible products across India. Delivery timing depends on inventory availability, stitching requirements, destination pincode, and courier serviceability.",
        "Free shipping applies above the active threshold shown at checkout. Remote pincodes, bulky bridal products, or custom pieces may need additional handling time."
      ]}
    />
  );
}
