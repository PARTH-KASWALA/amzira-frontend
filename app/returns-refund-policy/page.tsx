import { SimplePage } from "@/components/simple-page";

export default function ReturnsRefundPolicyPage() {
  return (
    <SimplePage
      kicker="Policy"
      title="Returns and refunds"
      body={[
        "Eligible ready-to-ship products may be returned within the active return window if unused, unaltered, and sent with original packaging.",
        "Customized, stitched, altered, or made-to-measure products may not be returnable unless there is a verified defect or fulfillment issue."
      ]}
    />
  );
}
