import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { COMPANY } from "@/lib/company";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cancellation, Return and Exchange Policy",
  description: "AMZIRA cancellation, 36-hour return, exchange, quality-check, and refund terms.",
  path: "/returns-refund-policy"
});

export default function ReturnsRefundPolicyPage() {
  return <SimplePage
    kicker="Customer policy"
    title="Cancellation, return & exchange policy"
    body={[
      "We want every AMZIRA order to arrive ready for the occasion. This policy explains when an order can be cancelled, returned, exchanged, or refunded. It applies to products purchased directly from AMZIRA and should be read with the product page, size chart, checkout terms, and Terms of Services.",
      "Our standard customer return and issue-reporting window is 36 hours from the date and time the courier records the order as delivered. The window is calculated per shipment, not from the date the order was placed."
    ]}
    sections={[
      { title: "Cancellation before dispatch", paragraphs: ["You may request cancellation before the order is dispatched. Please email us or use the available account action as soon as possible. Once a package has been handed to the courier, cancellation may no longer be possible and the request will be handled under the applicable return process.", "For an approved pre-dispatch cancellation, AMZIRA will initiate a refund to the original payment method. Bank, card, UPI, and payment-gateway posting times can vary after AMZIRA initiates the refund."] },
      { title: "36-hour return window", paragraphs: ["Eligible ready-to-ship garments may be returned when the return request is submitted within 36 hours of recorded delivery. The request must be raised through the account/order flow where available, or by emailing support before the deadline. The request timestamp is used to determine whether it was raised on time.", "A return request is not an automatic refund. The product must be received by AMZIRA and pass the condition and authenticity check before a refund or exchange is approved."] },
      { title: "Eligible return and exchange conditions", paragraphs: ["The item must be:"], bullets: ["Unused, unworn, unwashed, unaltered, and free from perfume, makeup, stains, pet hair, damage, or odour.", "Returned with original tags, labels, accessories, invoice or order reference, and original packaging where provided.", "Returned as the complete set shown on the product page. A set cannot be split into separate return or exchange items.", "Packed securely so it is not damaged during transit. Customers must retain the handover receipt or tracking details until the case is closed."] },
      { title: "Non-returnable and special products", paragraphs: ["Unless there is a verified defect, wrong item, or transit damage, the following are not eligible for a change-of-mind return: custom, made-to-measure, personalised, stitched, altered, resized, washed, worn, or specially prepared garments; products marked final sale or non-returnable; and any item whose hygiene, tag, or authenticity seal has been removed where that seal is part of the product presentation.", "Minor differences in colour caused by lighting, photography, screen settings, hand finishing, weave, embroidery, or batch variation are not automatically defects. Product measurements can have a reasonable manufacturing tolerance; the product size chart and stated garment measurements should be checked before ordering."] },
      { title: "Wrong, damaged, or defective item", paragraphs: ["If you receive a wrong item, a visibly damaged package, a missing component, or a suspected manufacturing defect, contact us within 36 hours of delivery with the order number and clear photographs. A continuous unboxing video can help us investigate a transit or packing dispute, but the absence of a video does not by itself remove a customer's right to report a genuine defect or incorrect fulfilment.", "Do not wash, alter, repair, or dispose of the product or packaging while the investigation is open. We may request additional photographs, a short video, courier evidence, or arrange inspection and pickup."] },
      { title: "Exchange process", paragraphs: ["An exchange is subject to stock availability, serviceability, and the same condition requirements as a return. Where the requested replacement is unavailable, AMZIRA may offer an alternative, store credit only with the customer's agreement, or a refund where applicable. Price differences, if any, will be communicated before approval.", "Exchange pickup is available only in serviceable locations. If pickup is unavailable, we will provide return instructions. Do not send a parcel to the contact address without an approved return reference."] },
      { title: "Pickup, inspection, and refund timing", paragraphs: ["After a request is accepted, AMZIRA will provide pickup or self-shipping instructions. The returned parcel is inspected for identity, completeness, condition, and signs of use. If the return does not meet the policy, it may be rejected or sent back to the customer, subject to applicable law.", "For an approved refund, AMZIRA will initiate the amount payable to the original payment method after the inspection is complete. Delivery charges, return charges, discounts, and other deductions will be handled according to the order-specific terms and the reason for return. The payment provider or bank may require additional working days to show the credit."] },
      { title: "Contact", paragraphs: [`Email ${COMPANY.supportEmail} or call ${COMPANY.supportPhoneDisplay} during ${COMPANY.supportHours}. Include the order number, registered mobile number, product name, and a short description of the issue.`, `AMZIRA contact address: ${COMPANY.address}.`] }
    ]}
  />;
}
