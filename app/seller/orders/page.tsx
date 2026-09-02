import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersDashboard } from "@/components/seller/orders-dashboard";

export const metadata: Metadata = { title: "Orders | AMZIRA Seller", robots: { index: false, follow: false } };

export default function SellerOrdersPage() {
  return <Suspense fallback={<div className="p-10 text-sm text-slate-600">Loading seller orders…</div>}><OrdersDashboard /></Suspense>;
}
