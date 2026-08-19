"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { addWishlistItem, isWishlistItem, removeWishlistItem } from "@/lib/api/wishlist";

export function WishlistButton({ productId, productName, className = "" }: { productId: string | number; productName: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const numericProductId = Number(productId);

  useEffect(() => {
    if (status !== "authenticated" || !Number.isInteger(numericProductId)) return;
    isWishlistItem(numericProductId).then(setSaved).catch(() => setSaved(false));
  }, [numericProductId, status]);

  async function toggle() {
    if (status !== "authenticated") {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!Number.isInteger(numericProductId) || busy) return;
    setBusy(true);
    try {
      if (saved) await removeWishlistItem(numericProductId);
      else await addWishlistItem(numericProductId);
      setSaved((value) => !value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`focus-ring grid min-h-11 min-w-11 place-items-center rounded-full bg-white/94 text-maroon shadow-soft transition hover:bg-maroon hover:text-white disabled:opacity-50 ${className}`}
      aria-label={`${saved ? "Remove" : "Save"} ${productName} ${saved ? "from" : "to"} wishlist`}
      aria-pressed={saved}
      disabled={busy || !Number.isInteger(numericProductId)}
      onClick={() => void toggle()}
    >
      <Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} aria-hidden="true" />
    </button>
  );
}
