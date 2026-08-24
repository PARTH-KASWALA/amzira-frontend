import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { COMPANY } from "@/lib/company";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description: "AMZIRA shipping, delivery estimates, serviceability, failed delivery, and shipment support terms.",
  path: "/shipping-policy"
});

export default function ShippingPolicyPage() {
  return <SimplePage
    kicker="Customer policy"
    title="Shipping policy"
    body={[
      "This Shipping Policy explains how AMZIRA prepares, dispatches, and delivers orders placed on our website. It applies to orders delivered within India unless a product page or checkout message states a different condition.",
      "AMZIRA is currently a direct-to-customer online store focused on South Indian girls' occasionwear, including lehenga choli and pattu pavadai. The delivery estimate shown at checkout is the most specific estimate for your pincode and selected product."
    ]}
    sections={[
      { title: "Order processing", paragraphs: ["After payment is successfully confirmed, we verify the order, inventory, size, address, and any product-specific preparation requirement. Ready-to-ship orders are normally handed to the courier within 1 to 3 business days. Custom, altered, made-to-measure, or specially prepared pieces may need additional time, which will be communicated before dispatch where applicable.", "A dispatch confirmation with the order reference and tracking information will be sent to the email address or mobile number provided at checkout. A payment confirmation is not, by itself, a dispatch confirmation."] },
      { title: "Delivery estimates and charges", paragraphs: ["Estimated delivery time depends on the destination pincode, courier serviceability, weather, public holidays, peak-season volume, and whether the item is ready to ship. The applicable delivery charge, if any, is displayed before payment. No delivery estimate is guaranteed unless AMZIRA expressly confirms a guaranteed service in writing.", "We may ship an order in more than one package when items are stored or prepared separately. Any additional delivery cost for a split shipment will not be charged merely because AMZIRA has split the shipment."] },
      { title: "Address, contact, and delivery attempts", paragraphs: ["Please check the recipient name, complete address, landmark, pincode, and phone number before placing the order. Once an order is dispatched, an address change may not be possible. If the courier cannot deliver because the address is incomplete, the recipient is unavailable, or delivery attempts are exhausted, contact us promptly so we can advise on re-delivery or return-to-origin options.", "Customers should not share OTPs, card details, UPI PINs, passwords, or remote-access permissions with anyone claiming to be an AMZIRA or courier representative."] },
      { title: "Delivery inspection and transit issues", paragraphs: ["Please inspect the outer package when it arrives. If it is visibly torn, wet, opened, or tampered with, you may refuse delivery where the courier permits, or photograph the package and contact AMZIRA immediately. Keep the package, labels, tags, and all packing material until your order has been checked.", "A missing, damaged, or incorrect item should be reported within the 36-hour return and issue-reporting window described in our Cancellation, Return & Exchange Policy."] },
      { title: "Support", paragraphs: [`For shipping questions, contact ${COMPANY.supportEmail} or call ${COMPANY.supportPhoneDisplay} during ${COMPANY.supportHours}. Please include your order number and delivery pincode.`, `AMZIRA contact address: ${COMPANY.address}.`] }
    ]}
  />;
}
