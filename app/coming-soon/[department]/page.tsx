import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CeremonyComingSoon } from "@/components/ceremony-coming-soon";
import { buildMetadata } from "@/lib/seo";
import {
  comingSoonDepartments,
  type ComingSoonDepartment
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

  return <CeremonyComingSoon department={department as ComingSoonDepartment} />;
}
