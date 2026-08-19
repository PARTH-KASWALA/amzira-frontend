"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  getAuthenticatedCart,
  removeAuthenticatedCartItem,
  syncGuestCart,
  updateAuthenticatedCartItem
} from "@/lib/api/cart";
import type { CartSummary } from "@/lib/api/types";
import { readGuestCart, writeGuestCart, type GuestCartItem } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { LIVE_CATEGORY_PATH } from "@/lib/storefront";
import { useSession } from "@/components/session-provider";

type DisplayItem = {
  key: string;
  itemId?: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  stockAvailable: number;
  guest?: GuestCartItem;
};

const emptySummary: CartSummary = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  totalItems: 0
};

export function CartView({ checkout = false }: { checkout?: boolean }) {
  const { status: sessionStatus } = useSession();
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [cart, setCart] = useState<CartSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const synchronized = useRef(false);

  const load = useCallback(async () => {
    if (sessionStatus === "loading") return;
    setLoading(true);
    setMessage("");
    try {
      if (sessionStatus === "authenticated") {
        const local = readGuestCart();
        if (local.length && !synchronized.current) {
          synchronized.current = true;
          const result = await syncGuestCart(local);
          if (result.failed.length) {
            setMessage(
              `${result.synchronized} item${result.synchronized === 1 ? "" : "s"} moved to your account. ${result.failed.length} preview item could not be synchronized.`
            );
          }
        }
        setCart(await getAuthenticatedCart());
      } else {
        setGuestItems(readGuestCart());
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your cart could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onUpdate = () => void load();
    window.addEventListener("amzira-cart-updated", onUpdate);
    return () => window.removeEventListener("amzira-cart-updated", onUpdate);
  }, [load]);

  const displayItems = useMemo<DisplayItem[]>(() => {
    if (sessionStatus === "authenticated") {
      return cart.items.map((item) => ({
        key: String(item.id),
        itemId: item.id,
        slug: item.productSlug,
        name: item.productName,
        image: item.productImage,
        price: item.unitPrice,
        size: item.variantDetails.replace(/^Size:\s*/i, ""),
        quantity: item.quantity,
        stockAvailable: item.stockAvailable
      }));
    }
    return guestItems.map((item) => ({
      key: `${item.slug}-${item.variantId}`,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
      stockAvailable: item.stockAvailable,
      guest: item
    }));
  }, [cart.items, guestItems, sessionStatus]);

  const guestSubtotal = useMemo(
    () => guestItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [guestItems]
  );
  const subtotal = sessionStatus === "authenticated" ? cart.subtotal : guestSubtotal;
  const shipping = sessionStatus === "authenticated" ? cart.shipping : 0;
  const tax = sessionStatus === "authenticated" ? cart.tax : 0;
  const total = sessionStatus === "authenticated" ? cart.total : guestSubtotal;

  async function updateQuantity(item: DisplayItem, nextQuantity: number) {
    if (nextQuantity < 1 || nextQuantity > Math.min(item.stockAvailable, 10)) return;
    setBusyId(item.key);
    setMessage("");
    try {
      if (item.itemId) {
        await updateAuthenticatedCartItem(item.itemId, nextQuantity);
        setCart(await getAuthenticatedCart());
      } else if (item.guest) {
        const next = guestItems.map((entry) =>
          entry === item.guest ? { ...entry, quantity: nextQuantity } : entry
        );
        setGuestItems(next);
        writeGuestCart(next);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Quantity could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(item: DisplayItem) {
    setBusyId(item.key);
    setMessage("");
    try {
      if (item.itemId) {
        await removeAuthenticatedCartItem(item.itemId);
        setCart(await getAuthenticatedCart());
      } else if (item.guest) {
        const next = guestItems.filter((entry) => entry !== item.guest);
        setGuestItems(next);
        writeGuestCart(next);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The item could not be removed.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading || sessionStatus === "loading") {
    return (
      <div className="h-96 animate-pulse rounded-3xl bg-amber-900/5 border border-amber-900/10" aria-label="Loading cart" />
    );
  }

  if (!displayItems.length) {
    return (
      <div className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-8 text-center shadow-xs">
        <ShoppingBag className="mx-auto h-10 w-10 text-amber-800/40" />
        <h2 className="mt-3 font-display text-3xl font-semibold text-maroon-deep">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-xs text-charcoal/65">
          Explore our South Indian girls&apos; lehenga choli and pattu pavadai collection for her next celebration.
        </p>
        <Link href={LIVE_CATEGORY_PATH} className="btn-primary mt-6 rounded-xl bg-[#580B26]">
          Shop the collection
        </Link>
      </div>
    );
  }

  if (checkout) {
    return (
      <aside className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-maroon" />
            <h2 className="font-display text-2xl font-semibold text-maroon-deep">Order Summary</h2>
          </div>
          <span className="rounded-full bg-maroon-soft px-3 py-1 text-xs font-bold text-maroon-deep">
            {displayItems.length} {displayItems.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Selected Items List */}
        <div className="divide-y divide-amber-900/10 rounded-2xl border border-amber-900/10 bg-white">
          {displayItems.map((item) => (
            <article className="flex items-center gap-4 p-4" key={item.key}>
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sandal/40 border border-amber-900/10 shadow-xs">
                <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate font-display text-base font-semibold text-maroon-deep">
                  {item.name}
                </h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-charcoal/65">
                  <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 font-medium border border-amber-900/10">
                    Size: {item.size}
                  </span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
              <div className="text-right font-bold text-sm text-maroon-deep tabular-nums">
                {formatMoney(item.price * item.quantity)}
              </div>
            </article>
          ))}
        </div>

        {/* Financial Totals Table */}
        <dl className="space-y-3 rounded-2xl border border-amber-900/10 bg-white p-5 text-xs">
          <div className="flex justify-between gap-6 text-charcoal/70">
            <dt>{sessionStatus === "authenticated" ? "Subtotal" : "Estimated subtotal"}</dt>
            <dd className="font-semibold tabular-nums text-charcoal">{formatMoney(subtotal)}</dd>
          </div>
          {sessionStatus === "authenticated" ? (
            <>
              <div className="flex justify-between gap-6 text-charcoal/70">
                <dt>Express Delivery</dt>
                <dd className="font-semibold tabular-nums text-emerald">
                  {shipping ? formatMoney(shipping) : "Free"}
                </dd>
              </div>
              <div className="flex justify-between gap-6 text-charcoal/70">
                <dt>GST (5%)</dt>
                <dd className="font-semibold tabular-nums text-charcoal">{formatMoney(tax)}</dd>
              </div>
            </>
          ) : (
            <p className="text-xs text-charcoal/60">Shipping and tax are confirmed after sign in.</p>
          )}
          <div className="flex justify-between border-t border-amber-900/10 pt-3 font-display text-lg font-bold text-maroon-deep">
            <dt>Grand Total</dt>
            <dd className="tabular-nums">{formatMoney(total)}</dd>
          </div>
        </dl>

        <p className="text-center text-xs leading-relaxed text-charcoal/60">
          Final stock, delivery, tax, and total are verified before payment opens.
        </p>
      </aside>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        {message ? (
          <p className="flex items-start gap-2 rounded-md bg-maroon-soft px-4 py-3 text-sm font-semibold text-maroon-deep" role="status">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {message}
          </p>
        ) : null}
        {displayItems.map((item) => {
          const busy = busyId === item.key;
          return (
            <article
              key={item.key}
              className="grid gap-4 border-b border-charcoal/10 bg-white p-4 sm:grid-cols-[120px_1fr]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-sandal">
                <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover" />
              </div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="focus-ring rounded-sm font-display text-2xl text-maroon-deep hover:text-maroon"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-2 text-sm text-charcoal/60">Size: {item.size}</p>
                  <p className="mt-2 font-semibold text-maroon">{formatMoney(item.price)}</p>
                  {item.quantity >= item.stockAvailable ? (
                    <p className="mt-2 text-xs font-semibold text-maroon">Maximum available quantity selected</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2" aria-label={`Quantity for ${item.name}`}>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Decrease quantity for ${item.name}`}
                    disabled={busy || item.quantity <= 1}
                    onClick={() => void updateQuantity(item, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Increase quantity for ${item.name}`}
                    disabled={busy || item.quantity >= Math.min(item.stockAvailable, 10)}
                    onClick={() => void updateQuantity(item, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-button text-maroon"
                    aria-label={`Remove ${item.name}`}
                    disabled={busy}
                    onClick={() => void removeItem(item)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="h-fit border-t border-maroon/25 bg-white p-6 shadow-soft lg:sticky lg:top-32">
        <h2 className="font-display text-3xl text-maroon-deep">Order summary</h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-6">
            <dt>{sessionStatus === "authenticated" ? "Subtotal" : "Estimated subtotal"}</dt>
            <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
          </div>
          {sessionStatus === "authenticated" ? (
            <>
              <div className="flex justify-between gap-6">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{shipping ? formatMoney(shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatMoney(tax)}</dd>
              </div>
            </>
          ) : (
            <p className="text-xs leading-5 text-charcoal/60">Shipping and tax are confirmed after sign in.</p>
          )}
          <div className="flex justify-between border-t border-charcoal/10 pt-4 text-lg font-bold text-maroon">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(total)}</dd>
          </div>
        </dl>
        {sessionStatus === "authenticated" ? (
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Secure checkout
          </Link>
        ) : (
          <Link href="/login?next=/checkout" className="btn-primary mt-6 w-full">
            Sign in to checkout
          </Link>
        )}
        <p className="mt-4 text-xs leading-6 text-charcoal/70">
          Final stock, delivery, tax, and total are verified before payment.
        </p>
      </aside>
    </div>
  );
}
