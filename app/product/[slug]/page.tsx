import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ruler, ShieldCheck, Truck } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProductPurchase } from "@/components/product-purchase";
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
      <section className="container-page grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-[88px_1fr]">
          <div className="hidden gap-3 md:grid">
            {product.images.slice(0, 5).map((image) => (
              <div key={image} className="relative aspect-[4/5] overflow-hidden rounded-md border border-charcoal/10 bg-sandal">
                <Image src={image} alt="" fill sizes="88px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            {product.images.slice(0, 3).map((image, index) => (
              <div key={image} className="relative aspect-[4/5] overflow-hidden rounded-md bg-sandal shadow-soft">
                <Image
                  src={image}
                  alt={index === 0 ? product.name : `${product.name} detail ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-md border border-charcoal/10 bg-white p-6 shadow-soft lg:sticky lg:top-32">
          <Link className="focus-ring text-xs font-semibold uppercase tracking-[0.2em] text-gold" href={`/category/${product.categorySlug}`}>
            {product.categoryName}
          </Link>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-maroon-deep">{product.name}</h1>
          <p className="mt-4 leading-8 text-charcoal/70">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-maroon">{formatMoney(product.salePrice)}</span>
            {product.basePrice > product.salePrice ? (
              <>
                <span className="text-charcoal/45 line-through">{formatMoney(product.basePrice)}</span>
                <span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald">
                  {product.discountPercentage}% off
                </span>
              </>
            ) : null}
          </div>

          <ProductPurchase product={product} />

          <div className="mt-8 grid gap-3 border-t border-charcoal/10 pt-6 text-sm text-charcoal/70">
            {[
              [Truck, "Delivery estimate available at checkout"],
              [ShieldCheck, "Secure Razorpay and COD-ready commerce flow"],
              [Ruler, "Custom stitching and blouse guidance available"]
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
      </section>
    </>
  );
}
