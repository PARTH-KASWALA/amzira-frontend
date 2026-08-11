import { redirect } from "next/navigation";
import { comingSoonPath } from "@/lib/storefront";

export default function MenPage() {
  redirect(comingSoonPath("men"));
}
