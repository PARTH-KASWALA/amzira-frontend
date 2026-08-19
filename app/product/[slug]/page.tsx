import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ruler, ShieldCheck, Truck } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { DeliveryEstimate } from "@/components/delivery-estimate";
import { WishlistButton } from "@/components/wishlist-button";
import { getProduct } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return buildMetadata({ title: "Product not found", path: `/product/${slug}` });
  return buildMetadata({
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description,
    path: `/product/${product.slug}`,
    image: product.primaryImage
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: product.categoryName, path: `/category/${product.categorySlug}` },
          { name: product.name, path: `/product/${product.slug}` }
        ])}
      />
      <section className="product-detail-section">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery images={product.images} name={product.name} />

          <aside className="product-detail-panel h-fit rounded-md border border-charcoal/10 p-6 shadow-soft lg:sticky lg:top-32">
          <div className="flex items-center justify-between gap-4">
            <Link className="focus-ring text-xs font-semibold uppercase tracking-[0.2em] text-maroon" href={`/category/${product.categorySlug}`}>{product.categoryName}</Link>
            <WishlistButton productId={product.id} productName={product.name} />
          </div>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-maroon-deep">{product.name}</h1>
          <p className="mt-4 leading-8 text-charcoal/70">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-maroon">{formatMoney(product.salePrice)}</span>
            {product.basePrice > product.salePrice ? (
              <>
                <span className="text-charcoal/70 line-through">{formatMoney(product.basePrice)}</span>
                <span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald">
                  {product.discountPercentage}% off
                </span>
              </>
            ) : null}
          </div>

          <ProductPurchase product={product} />
          <DeliveryEstimate slug={product.slug} />

          <div className="mt-8 grid gap-3 border-t border-charcoal/10 pt-6 text-sm text-charcoal/70">
            {[
              [Truck, "Delivery estimate available by pincode"],
              [ShieldCheck, "Secure Razorpay checkout"],
              [Ruler, "Size guidance for growing kids"]
            ].map(([Icon, text]) => (
              <p key={String(text)} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                {String(text)}
              </p>
            ))}
          </div>

          <dl className="mt-8 grid gap-4 border-t border-charcoal/10 pt-6 text-sm">
            <div>
              <dt className="font-bold text-charcoal">Fabric</dt>
              <dd className="mt-1 text-charcoal/65">{product.fabric || "Premium silk blend"}</dd>
            </div>
            <div>
              <dt className="font-bold text-charcoal">Occasions</dt>
              <dd className="mt-1 text-charcoal/65">{product.occasions.join(", ") || "Wedding, festive, ceremony"}</dd>
            </div>
            <div>
              <dt className="font-bold text-charcoal">Care</dt>
              <dd className="mt-1 text-charcoal/65">{product.careInstructions || "Dry clean recommended."}</dd>
            </div>
          </dl>
          </aside>
        </div>
      </section>
      <ProductReviews productId={product.id} />
    </>
  );
}
