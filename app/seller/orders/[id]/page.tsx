import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/seller/order-detail";

export const metadata: Metadata = { title: "Order details | AMZIRA Seller", robots: { index: false, follow: false } };

export default async function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId < 1) notFound();
  return <OrderDetail orderId={orderId} />;
}
