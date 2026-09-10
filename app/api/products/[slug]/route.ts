import { NextResponse } from "next/server";
import { getProduct } from "@/lib/api";

export const revalidate = 300;

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Quick-view data is public catalog data. A short shared cache prevents
  // every dialog open from making the Vercel-to-Render round trip.
  return NextResponse.json(product, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60"
    }
  });
}
