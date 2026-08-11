import { redirect } from "next/navigation";
import { comingSoonPath, LIVE_CATEGORY_PATH } from "@/lib/storefront";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function KidsPage({ searchParams }: Props) {
  const query = await searchParams;
  const boysRequest = [query.style, query.collection].some((value) =>
    value ? /boys|kurta|dhoti|sibling/i.test(value) : false
  );

  redirect(boysRequest ? comingSoonPath("kids-boys") : LIVE_CATEGORY_PATH);
}
