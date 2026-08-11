import { redirect } from "next/navigation";
import { comingSoonPath } from "@/lib/storefront";

export default function WomenPage() {
  redirect(comingSoonPath("women"));
}
