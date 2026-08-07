import { SimplePage } from "@/components/simple-page";

export default function OrderTrackingPage() {
  return (
    <SimplePage
      kicker="Orders"
      title="Track your order"
      body={[
        "Order tracking connects to the FastAPI order and shipment endpoints during production backend deployment.",
        "For launch, customers can use account order history or contact support with their order number."
      ]}
      cta={{ label: "Go to account", href: "/account" }}
    />
  );
}
