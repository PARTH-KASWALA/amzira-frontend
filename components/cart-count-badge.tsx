"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthenticatedCart } from "@/lib/api/cart";
import { CART_KEY, LEGACY_CART_KEY, readGuestCart } from "@/lib/cart";
import { useSession } from "@/components/session-provider";

function guestCartCount() {
  return readGuestCart().reduce((total, item) => total + item.quantity, 0);
}

export function CartCountBadge() {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (status === "loading") return;

    if (status === "authenticated") {
      try {
        const cart = await getAuthenticatedCart();
        setCount(cart.totalItems);
      } catch {
        setCount(0);
      }
      return;
    }

    setCount(guestCartCount());
  }, [status]);

  useEffect(() => {
    void refreshCount();

    function handleCartUpdate() {
      void refreshCount();
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === CART_KEY || event.key === LEGACY_CART_KEY) {
        void refreshCount();
      }
    }

    window.addEventListener("amzira-cart-updated", handleCartUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("amzira-cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshCount]);

  if (count <= 0) return null;

  return (
    <span
      className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-maroon px-1.5 text-[11px] font-bold leading-none text-white shadow-soft ring-2 ring-ivory"
      aria-label={`${count} ${count === 1 ? "item" : "items"} in cart`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
