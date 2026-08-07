"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CART_KEY } from "@/components/cart-button";
import { formatMoney } from "@/lib/format";

type CartItem = {
  productId: string | number;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
};

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartView({ checkout = false }: { checkout?: boolean }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  function commit(nextItems: CartItem[]) {
    setItems(nextItems);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new CustomEvent("amzira-cart-updated"));
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <div className="rounded-md border border-charcoal/10 bg-white p-10 text-center shadow-sm">
        <h2 className="font-display text-4xl text-maroon-deep">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-charcoal/65">
          Start with bridal pattu lehengas, Kanjeevaram silk edits, or kids pattu pavadai.
        </p>
        <Link href="/women" className="btn-primary mt-6">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={`${item.slug}-${item.size}`} className="grid gap-4 rounded-md border border-charcoal/10 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-sandal">
              <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover" />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link href={`/product/${item.slug}`} className="focus-ring rounded-sm font-display text-2xl text-maroon-deep hover:text-maroon">
                  {item.name}
                </Link>
                <p className="mt-2 text-sm text-charcoal/60">Size: {item.size}</p>
                <p className="mt-2 font-semibold text-maroon">{formatMoney(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="focus-ring grid min-h-11 min-w-11 place-items-center rounded-full border border-charcoal/10"
                  aria-label={`Decrease quantity for ${item.name}`}
                  onClick={() =>
                    commit(
                      items
                        .map((entry) =>
                          entry === item ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry
                        )
                    )
                  }
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  className="focus-ring grid min-h-11 min-w-11 place-items-center rounded-full border border-charcoal/10"
                  aria-label={`Increase quantity for ${item.name}`}
                  onClick={() => commit(items.map((entry) => (entry === item ? { ...entry, quantity: entry.quantity + 1 } : entry)))}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="focus-ring grid min-h-11 min-w-11 place-items-center rounded-full border border-charcoal/10 text-maroon"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => commit(items.filter((entry) => entry !== item))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-md border border-charcoal/10 bg-white p-6 shadow-soft lg:sticky lg:top-32">
        <h2 className="font-display text-3xl text-maroon-deep">Order summary</h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shipping ? formatMoney(shipping) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-charcoal/10 pt-4 text-lg font-bold text-maroon">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        {checkout ? null : (
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Secure checkout
          </Link>
        )}
        <p className="mt-4 text-xs leading-6 text-charcoal/55">By continuing, you agree to AMZIRA shipping, returns, and privacy policies.</p>
      </aside>
    </div>
  );
}
