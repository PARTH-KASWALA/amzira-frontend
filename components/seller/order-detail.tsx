"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, MapPin, Package, RefreshCw, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api/browser-client";
import { getSellerOrder, updateSellerOrderStatus, type SellerOrderDetail } from "@/lib/api/admin-orders";
import { formatAdminDate, orderStatusLabel, statusTone } from "@/lib/admin/order-status";
import { formatMoney } from "@/lib/format";

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-500">{title}</h2><div className="mt-5">{children}</div></section>;
}

export function OrderDetail({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const value = await getSellerOrder(orderId);
      setOrder(value);
      setNextStatus(value.allowed_next_statuses[0] || "");
      setTrackingNumber(value.tracking_number || "");
      setCarrierName(value.carrier_name || value.courier_name || "");
      setEstimatedDeliveryDate(localDateTime(value.estimated_delivery_date));
      setNotes("");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 404) setError("Order not found.");
      else setError(caught instanceof Error ? caught.message : "Order details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => void load(), [load]);

  const availableStatuses = useMemo(() => {
    if (!order) return [];
    const paidOnline = order.payment.method === "razorpay" && order.payment.status === "success";
    return paidOnline ? order.allowed_next_statuses.filter((status) => status !== "cancelled") : order.allowed_next_statuses;
  }, [order]);

  useEffect(() => {
    if (nextStatus && !availableStatuses.includes(nextStatus as never)) setNextStatus(availableStatuses[0] || "");
  }, [availableStatuses, nextStatus]);

  const shippingTransition = ["shipped", "out_for_delivery"].includes(nextStatus);

  async function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nextStatus || saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateSellerOrderStatus(orderId, {
        status: nextStatus,
        trackingNumber,
        carrierName,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toISOString() : undefined,
        notes
      });
      setSuccess(`Order updated to ${orderStatusLabel(nextStatus)}.`);
      await load();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) setError(`${caught.message} The order was not changed.`);
      else setError(caught instanceof Error ? caught.message : "The order could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !order) return <div className="grid gap-4 p-6 lg:p-10" aria-label="Loading order"><div className="h-24 animate-pulse rounded-2xl bg-slate-200" /><div className="h-80 animate-pulse rounded-2xl bg-slate-200" /></div>;

  if (!order) return <div className="p-6 lg:p-10"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-900" role="alert">{error || "Order details are unavailable."} <button className="ml-2 underline" onClick={() => void load()} type="button">Try again</button></div></div>;

  const address = order.shipping_address;
  const paidOnline = order.payment.method === "razorpay" && order.payment.status === "success";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-[1400px]">
        <Link className="focus-ring inline-flex items-center gap-2 rounded text-sm font-bold text-slate-600 hover:text-[#8a1538]" href="/seller/orders"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to orders</Link>
        <header className="mt-5 flex flex-wrap items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-3xl font-semibold sm:text-4xl">{order.order_number}</h1><span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(order.status)}`}>{orderStatusLabel(order.status)}</span></div>
            <p className="mt-2 text-sm text-slate-500">Placed {formatAdminDate(order.created_at)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
          </div>
          <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-50 disabled:opacity-60" type="button" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh</button>
        </header>

        {success ? <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{success}</p> : null}
        {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{error}</p> : null}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="grid gap-6">
            <DetailCard title="Items">
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => <div className="flex gap-4 py-4 first:pt-0 last:pb-0" key={item.id}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100"><Package className="h-5 w-5 text-slate-500" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="font-bold">{item.product_name}</p><p className="mt-1 text-xs text-slate-500">{item.variant_details || "Variant not recorded"} · Qty {item.quantity}</p></div><p className="shrink-0 font-bold tabular-nums">{formatMoney(item.total_price)}</p></div>)}
              </div>
            </DetailCard>

            <div className="grid gap-6 md:grid-cols-2">
              <DetailCard title="Customer"><div className="flex gap-3"><UserRound className="mt-0.5 h-5 w-5 shrink-0 text-[#8a1538]" aria-hidden="true" /><address className="not-italic text-sm leading-7"><strong className="block text-base">{order.customer.name}</strong><a className="text-slate-600 hover:underline" href={`mailto:${order.customer.email}`}>{order.customer.email}</a><br />{order.customer.phone ? <a className="text-slate-600 hover:underline" href={`tel:${order.customer.phone}`}>{order.customer.phone}</a> : "No phone recorded"}</address></div></DetailCard>
              <DetailCard title="Delivery address"><div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#8a1538]" aria-hidden="true" /><address className="not-italic text-sm leading-7"><strong className="block text-base">{address.full_name}</strong>{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}<br />{address.city}, {address.state} {address.pincode}<br />{address.country}<br /><a className="text-slate-600 hover:underline" href={`tel:${address.phone}`}>{address.phone}</a></address></div></DetailCard>
            </div>

            <DetailCard title="Order timeline">
              {order.status_history.length ? <ol className="relative ml-2 border-l border-slate-200">{[...order.status_history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((entry) => <li className="relative pb-6 pl-7 last:pb-0" key={entry.id}><span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-[#8a1538] ring-1 ring-slate-200" /><p className="text-sm font-bold">{entry.old_status ? `${orderStatusLabel(entry.old_status)} → ` : ""}{orderStatusLabel(entry.new_status)}</p><p className="mt-1 text-xs text-slate-500">{formatAdminDate(entry.created_at)}{entry.changed_by ? ` · Admin #${entry.changed_by}` : ""}</p>{entry.notes ? <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">{entry.notes}</p> : null}</li>)}</ol> : <p className="text-sm text-slate-500">No status changes recorded yet.</p>}
            </DetailCard>
          </div>

          <aside className="grid gap-6 xl:sticky xl:top-6">
            <DetailCard title="Payment & total">
              <div className="flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(order.payment.status || "pending")}`}>{orderStatusLabel(order.payment.status || "Not recorded")}</span><span className="text-xs font-bold uppercase text-slate-500">{order.payment.method?.replaceAll("_", " ") || "No method"}</span></div>
              <dl className="mt-5 grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{formatMoney(order.shipping_charge)}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Tax</dt><dd>{formatMoney(order.tax_amount)}</dd></div>{order.discount_amount ? <div className="flex justify-between text-emerald-700"><dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt><dd>-{formatMoney(order.discount_amount)}</dd></div> : null}<div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold"><dt>Total</dt><dd>{formatMoney(order.total_amount)}</dd></div>{order.payment.refunded_amount ? <div className="flex justify-between text-red-700"><dt>Refunded</dt><dd>{formatMoney(order.payment.refunded_amount)}</dd></div> : null}</dl>
              {order.payment.transaction_reference ? <p className="mt-4 break-all rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">Transaction: {order.payment.transaction_reference}</p> : null}
            </DetailCard>

            <DetailCard title="Update fulfilment">
              {paidOnline && order.allowed_next_statuses.includes("cancelled") ? <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">A successful Razorpay order cannot be cancelled here until its refund is processed. This prevents a paid order from being marked cancelled without returning the customer’s money.</p> : null}
              {availableStatuses.length ? (
                <form className="grid gap-4" onSubmit={submitUpdate}>
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Next status<select className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal focus:border-[#8a1538] focus:outline-none" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} required>{availableStatuses.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}</select></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Tracking number<input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-normal focus:border-[#8a1538] focus:outline-none" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} maxLength={100} required={shippingTransition} placeholder="Courier tracking / AWB" /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Courier / carrier<input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-normal focus:border-[#8a1538] focus:outline-none" value={carrierName} onChange={(event) => setCarrierName(event.target.value)} maxLength={100} required={shippingTransition} placeholder="e.g. Delhivery" /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Estimated delivery<input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-normal focus:border-[#8a1538] focus:outline-none" type="datetime-local" value={estimatedDeliveryDate} onChange={(event) => setEstimatedDeliveryDate(event.target.value)} /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Internal note<textarea className="min-h-24 resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm font-normal focus:border-[#8a1538] focus:outline-none" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} placeholder="Reason, handoff, or fulfilment detail" /></label>
                  <button className="focus-ring min-h-12 rounded-xl bg-[#8a1538] px-5 text-sm font-extrabold text-white hover:bg-[#6f102c] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving update…" : `Update to ${orderStatusLabel(nextStatus)}`}</button>
                </form>
              ) : <p className="text-sm leading-6 text-slate-500">This order has no permitted next status.</p>}
            </DetailCard>

            <DetailCard title="Tracking"><dl className="grid gap-3 text-sm"><div><dt className="text-xs text-slate-500">Tracking number</dt><dd className="mt-1 font-bold">{order.tracking_number || order.awb_code || "Not assigned"}</dd></div><div><dt className="text-xs text-slate-500">Courier</dt><dd className="mt-1 font-bold">{order.courier_name || order.carrier_name || "Not assigned"}</dd></div><div><dt className="text-xs text-slate-500">Estimated delivery</dt><dd className="mt-1 font-bold">{formatAdminDate(order.estimated_delivery_date)}</dd></div>{order.tracking_url ? <a className="focus-ring inline-flex items-center gap-2 rounded text-sm font-bold text-[#8a1538] hover:underline" href={order.tracking_url} target="_blank" rel="noreferrer">Open courier tracking <ExternalLink className="h-4 w-4" aria-hidden="true" /></a> : null}</dl></DetailCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
