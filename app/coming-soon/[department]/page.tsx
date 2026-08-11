import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import {
  comingSoonDepartments,
  type ComingSoonDepartment,
  LIVE_CATEGORY_PATH
} from "@/lib/storefront";

type Props = { params: Promise<{ department: string }> };

function getDepartment(value: string) {
  return value in comingSoonDepartments
    ? comingSoonDepartments[value as ComingSoonDepartment]
    : null;
}

export function generateStaticParams() {
  return Object.keys(comingSoonDepartments).map((department) => ({ department }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { department } = await params;
  const collection = getDepartment(department);

  if (!collection) {
    return buildMetadata({ title: "Collection not found", path: `/coming-soon/${department}` });
  }

  return {
    ...buildMetadata({
      title: `${collection.name} Coming Soon`,
      description: collection.description,
      path: `/coming-soon/${department}`,
      image: collection.image
    }),
    robots: { index: false, follow: true }
  };
}

export default async function ComingSoonPage({ params }: Props) {
  const { department } = await params;
  const collection = getDepartment(department);
  if (!collection) notFound();

  return (
    <>
      <section className="relative min-h-[76dvh] overflow-hidden bg-charcoal text-white">
        <Image
          src={collection.image}
          alt={collection.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,7,10,0.92)_0%,rgba(52,10,25,0.7)_46%,rgba(20,10,10,0.18)_100%)]" />
        <div className="container-page relative flex min-h-[76dvh] items-end py-12 sm:items-center sm:py-16">
          <div className="max-w-2xl">
            <p className="section-kicker text-gold-pale">Coming soon</p>
            <h1 className="mt-4 max-w-[13ch] font-display text-5xl font-semibold leading-[0.98] text-ivory sm:text-6xl lg:text-7xl">
              {collection.headline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/82 sm:text-lg">
              {collection.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary gap-2 bg-gold text-charcoal hover:bg-gold-pale" href={LIVE_CATEGORY_PATH}>
                Shop girls&apos; lehenga choli <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:bg-white/[0.18]"
                href={`/contact-support?interest=${department}`}
              >
                <BellRing className="h-4 w-4" aria-hidden="true" /> Join updates
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-10 sm:py-14">
        <div className="container-page grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold text-maroon-deep">Beautifully made for her first.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-charcoal/68">
              Explore the collection currently available from AMZIRA: South Indian silk lehenga choli and pattu pavadai for girls.
            </p>
          </div>
          <Link className="btn-secondary w-fit gap-2" href={LIVE_CATEGORY_PATH}>
            View the collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
