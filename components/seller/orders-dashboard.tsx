"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, RefreshCw, Search } from "lucide-react";
import { ApiError } from "@/lib/api/browser-client";
import { getSellerOrders, type SellerOrdersPage } from "@/lib/api/admin-orders";
import { ORDER_STATUSES, PAYMENT_STATUSES, formatAdminDate, orderStatusLabel, statusTone } from "@/lib/admin/order-status";
import { formatMoney } from "@/lib/format";

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    if (error.message === "Access denied") {
      return "Seller operations are restricted to the approved admin network. Connect to the AMZIRA office/VPN and try again.";
    }
    if (error.message === "Admin access required") {
      return "Your account does not have seller access. Sign out and contact an administrator.";
    }
    return "Seller access was denied. Sign out and contact an administrator.";
  }
  if (error instanceof ApiError && error.status === 429) return "Too many requests. Wait a moment, then refresh.";
  return error instanceof Error ? error.message : "Orders could not be loaded.";
}

export function OrdersDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("payment_status") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [draftSearch, setDraftSearch] = useState(search);
  const [result, setResult] = useState<SellerOrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setDraftSearch(search), [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await getSellerOrders({ search, status, paymentStatus, page, limit: 20 }));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [page, paymentStatus, search, status]);

  useEffect(() => void load(), [load]);

  function navigate(next: { search?: string; status?: string; payment_status?: string; page?: number }) {
    const query = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) query.set(key, String(value));
      else query.delete(key);
    });
    if (!("page" in next)) query.set("page", "1");
    router.push(`/seller/orders${query.size ? `?${query.toString()}` : ""}`);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    navigate({ search: draftSearch.trim(), page: 1 });
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a1538]">Fulfilment</p>
            <h1 className="mt-1 font-display text-4xl font-semibold text-slate-950">Orders</h1>
            <p className="mt-2 text-sm text-slate-600">Search, verify payment, and progress each order through delivery.</p>
          </div>
          <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold shadow-sm hover:border-slate-400 disabled:opacity-60" type="button" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </button>
        </header>

        <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(16rem,1fr)_13rem_13rem_auto]">
          <form className="relative" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="seller-order-search">Search orders</label>
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input id="seller-order-search" className="min-h-11 w-full rounded-xl border border-slate-300 pl-10 pr-4 text-sm focus:border-[#8a1538] focus:outline-none" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} maxLength={100} placeholder="Order, customer, email or phone" />
          </form>
          <label className="sr-only" htmlFor="seller-order-status">Order status</label>
          <select id="seller-order-status" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-[#8a1538] focus:outline-none" value={status} onChange={(event) => navigate({ status: event.target.value, page: 1 })}>
            <option value="">All order statuses</option>
            {ORDER_STATUSES.map((value) => <option key={value} value={value}>{orderStatusLabel(value)}</option>)}
          </select>
          <label className="sr-only" htmlFor="seller-payment-status">Payment status</label>
          <select id="seller-payment-status" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-[#8a1538] focus:outline-none" value={paymentStatus} onChange={(event) => navigate({ payment_status: event.target.value, page: 1 })}>
            <option value="">All payment statuses</option>
            {PAYMENT_STATUSES.map((value) => <option key={value} value={value}>{orderStatusLabel(value)}</option>)}
          </select>
          <button className="focus-ring min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800" type="button" onClick={() => navigate({ search: "", status: "", payment_status: "", page: 1 })}>Clear</button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-900" role="alert">
            {error}
            <button className="ml-3 underline" type="button" onClick={() => void load()}>Try again</button>
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-bold text-slate-950">{loading && !result ? "Loading orders…" : `${result?.total || 0} orders`}</p>
            {result ? <p className="text-xs text-slate-500">Page {result.page} of {Math.max(1, result.pages)}</p> : null}
          </div>

          {loading && !result ? (
            <div className="grid gap-3 p-5" aria-label="Loading orders">{Array.from({ length: 6 }).map((_, index) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={index} />)}</div>
          ) : result?.orders.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3">Tracking</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.orders.map((order) => (
                      <tr className="transition hover:bg-slate-50" key={order.id}>
                        <td className="px-5 py-4"><Link className="focus-ring rounded font-bold text-[#8a1538] hover:underline" href={`/seller/orders/${order.id}`}>{order.order_number}</Link><span className="mt-1 block text-xs text-slate-500">{formatAdminDate(order.created_at)} · {order.items_count} item{order.items_count === 1 ? "" : "s"}</span></td>
                        <td className="px-5 py-4"><span className="font-semibold">{order.customer_name}</span><span className="mt-1 block text-xs text-slate-500">{order.customer_email}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(order.status)}`}>{orderStatusLabel(order.status)}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(order.payment_status || "pending")}`}>{orderStatusLabel(order.payment_status || "Not recorded")}</span><span className="mt-1 block text-xs text-slate-500">{order.payment_method?.replaceAll("_", " ") || "—"}</span></td>
                        <td className="px-5 py-4 text-right font-bold tabular-nums">{formatMoney(order.total_amount)}</td>
                        <td className="px-5 py-4 text-xs text-slate-600">{order.tracking_number || "Not assigned"}<span className="mt-1 block">{order.courier_name || ""}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-slate-100 md:hidden">
                {result.orders.map((order) => (
                  <Link className="focus-ring block p-5 hover:bg-slate-50" href={`/seller/orders/${order.id}`} key={order.id}>
                    <div className="flex items-start justify-between gap-3"><div><strong className="text-[#8a1538]">{order.order_number}</strong><p className="mt-1 text-xs text-slate-500">{formatAdminDate(order.created_at)}</p></div><strong className="tabular-nums">{formatMoney(order.total_amount)}</strong></div>
                    <p className="mt-4 text-sm font-semibold">{order.customer_name}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(order.status)}`}>{orderStatusLabel(order.status)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(order.payment_status || "pending")}`}>{orderStatusLabel(order.payment_status || "Not recorded")}</span></div>
                  </Link>
                ))}
              </div>
            </>
          ) : !error ? (
            <div className="px-6 py-16 text-center"><PackageSearch className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" /><h2 className="mt-4 font-display text-2xl font-semibold">No matching orders</h2><p className="mt-2 text-sm text-slate-500">Change or clear the filters to view other orders.</p></div>
          ) : null}
        </div>

        {result && result.pages > 1 ? (
          <nav className="mt-5 flex items-center justify-end gap-2" aria-label="Order pages">
            <button className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold disabled:opacity-40" disabled={result.page <= 1 || loading} onClick={() => navigate({ page: result.page - 1 })} type="button"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</button>
            <button className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold disabled:opacity-40" disabled={result.page >= result.pages || loading} onClick={() => navigate({ page: result.page + 1 })} type="button">Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
