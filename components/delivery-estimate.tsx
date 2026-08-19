"use client";

import { FormEvent, useState } from "react";
import { Truck } from "lucide-react";
import { getDeliveryEstimate } from "@/lib/api/product-extras";
import { formatMoney } from "@/lib/format";

export function DeliveryEstimate({ slug }: { slug: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pincode = String(new FormData(event.currentTarget).get("pincode") || "");
    setLoading(true);
    setMessage("");
    try {
      const estimate = await getDeliveryEstimate(slug, pincode);
      const start = new Date(estimate.estimated_delivery_date_start).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const end = new Date(estimate.estimated_delivery_date_end).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      setMessage(`Estimated ${start} to ${end}. ${estimate.shipping_cost ? `${formatMoney(estimate.shipping_cost)} shipping.` : "Free shipping."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery could not be checked.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-7 border-t border-charcoal/10 pt-6" onSubmit={submit}>
      <label className="form-field">Check delivery to your pincode
        <span className="flex gap-2"><input name="pincode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit pincode" required /><button className="btn-secondary shrink-0" type="submit" disabled={loading}><Truck className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Check delivery</span></button></span>
      </label>
      {message ? <p className="mt-3 text-sm font-semibold leading-6 text-charcoal/70" role="status">{message}</p> : null}
    </form>
  );
}
