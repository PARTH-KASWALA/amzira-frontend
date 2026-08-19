"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Flower2,
  Gift,
  Heart,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
  Trash2,
  UserRound
} from "lucide-react";
import { useSession } from "@/components/session-provider";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  updateCurrentCustomer
} from "@/lib/api/customer";
import {
  cancelOrder,
  downloadInvoice,
  getOrders,
  getReturnEligibility,
  requestOrderReturn
} from "@/lib/api/orders";
import { getWishlist, removeWishlistItem, type WishlistItem } from "@/lib/api/wishlist";
import type { Address, AddressInput, OrderSummary, ReturnEligibility } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

type Tab = "profile" | "addresses" | "orders" | "wishlist";
type OrderFilter = "all" | "delivered" | "in_transit" | "cancelled";

const tabs: Array<{ id: Tab; label: string; icon: typeof UserRound }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "orders", label: "Orders", icon: PackageCheck },
  { id: "wishlist", label: "Saved styles", icon: Heart }
];

const emptyAddress: AddressInput = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: "home",
  isDefault: true
};

function formatReturnTime(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function AccountDashboard() {
  const { customer, status, refresh, logout } = useSession();
  const [tab, setTab] = useState<Tab>("profile");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [returnEligibility, setReturnEligibility] = useState<Record<number, ReturnEligibility>>({});
  const [returnEligibilityCheckedAt, setReturnEligibilityCheckedAt] = useState(0);
  const [returnClock, setReturnClock] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addressDraft, setAddressDraft] = useState<AddressInput>(emptyAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [returnOrderId, setReturnOrderId] = useState<number | null>(null);

  const loadAccount = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError("");
    try {
      const [nextAddresses, nextOrders, nextWishlist] = await Promise.all([
        getAddresses(),
        getOrders(),
        getWishlist()
      ]);
      setAddresses(nextAddresses);
      setOrders(nextOrders);
      setWishlist(nextWishlist);
      const deliveredOrders = nextOrders.filter((order) => order.status.toLowerCase() === "delivered");
      const eligibilityResults = await Promise.allSettled(
        deliveredOrders.map(async (order) => [order.id, await getReturnEligibility(order.id)] as const)
      );
      const checkedAt = Date.now();
      setReturnEligibility(
        Object.fromEntries(
          eligibilityResults
            .filter((result): result is PromiseFulfilledResult<readonly [number, ReturnEligibility]> => result.status === "fulfilled")
            .map((result) => result.value)
        )
      );
      setReturnEligibilityCheckedAt(checkedAt);
      setReturnClock(checkedAt);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Account details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    if (!Object.values(returnEligibility).some((value) => value.eligible)) return;
    const timer = window.setInterval(() => setReturnClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [returnEligibility]);

  useEffect(() => {
    const syncTabFromHash = () => {
      const nextTab = window.location.hash.slice(1) as Tab;
      if (tabs.some((item) => item.id === nextTab)) {
        setTab(nextTab);
      }
    };
    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  function announce(nextMessage: string) {
    setError("");
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(""), 3500);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      await updateCurrentCustomer({
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || "")
      });
      await refresh();
      announce("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Profile could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressDraft);
      } else {
        await createAddress(addressDraft);
      }
      setAddressDraft({ ...emptyAddress, isDefault: addresses.length === 0 });
      setEditingAddressId(null);
      setShowAddressForm(false);
      setAddresses(await getAddresses());
      announce(editingAddressId ? "Address updated." : "Address added.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Address could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  async function removeAddress(id: number) {
    const address = addresses.find((item) => item.id === id);
    if (address?.isDefault && !window.confirm("Remove your default delivery address?")) return;
    setLoading(true);
    try {
      await deleteAddress(id);
      setAddresses(await getAddresses());
      announce("Address removed.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Address could not be removed.");
    } finally {
      setLoading(false);
    }
  }

  function openNewAddress() {
    setEditingAddressId(null);
    setAddressDraft({ ...emptyAddress, isDefault: addresses.length === 0 });
    setShowAddressForm(true);
  }

  function editAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressDraft({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      addressType: address.addressType,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  }

  async function cancel(id: number) {
    setLoading(true);
    try {
      await cancelOrder(id);
      setOrders(await getOrders());
      announce("Order cancelled.");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Order could not be cancelled.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReturn(event: FormEvent<HTMLFormElement>, orderId: number) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      await requestOrderReturn(orderId, String(form.get("reason") || "other"), String(form.get("description") || ""));
      setReturnOrderId(null);
      setOrders(await getOrders());
      announce("Return request submitted.");
    } catch (returnError) {
      setError(returnError instanceof Error ? returnError.message : "Return request could not be submitted.");
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const statusLower = order.status.toLowerCase();
    if (orderFilter === "delivered") return statusLower === "delivered";
    if (orderFilter === "in_transit")
      return ["pending", "placed", "confirmed", "processing", "shipped", "out_for_delivery"].includes(statusLower);
    if (orderFilter === "cancelled") return statusLower === "cancelled";
    return true;
  });

  if (status === "loading") {
    return <div className="h-80 animate-pulse rounded-3xl bg-amber-900/5 border border-amber-900/10" aria-label="Loading account" />;
  }

  if (status === "guest") {
    return (
      <div className="grid gap-8 rounded-3xl border border-amber-900/10 bg-white/75 p-8 sm:p-10 backdrop-blur-md lg:grid-cols-[1fr_auto] lg:items-center shadow-xs">
        <div>
          <h2 className="font-display text-4xl text-maroon-deep font-semibold">Sign in to open your closet</h2>
          <p className="mt-3 max-w-xl leading-7 text-charcoal/65 text-sm">
            View orders, delivery addresses, invoices, returns, and saved styles from any device.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary rounded-xl bg-[#580B26]" href="/login?next=/account">Sign in</Link>
          <Link className="btn-secondary rounded-xl" href="/signup">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-dashboard">
      <aside className="account-sidebar rounded-3xl border border-amber-900/10 bg-white/75 p-3 shadow-xs backdrop-blur-md">
        <div className="account-tabs" role="tablist" aria-label="Account sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`account-tab focus-ring ${tab === item.id ? "account-tab--active" : ""}`}
              onClick={() => {
                setTab(item.id);
                window.history.replaceState(null, "", `#${item.id}`);
              }}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
              <ChevronRight className="account-tab__arrow" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button type="button" className="account-logout focus-ring" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
        </button>
      </aside>

      <div className="account-panel rounded-3xl border border-amber-900/10 bg-white/75 p-6 sm:p-8 shadow-xs backdrop-blur-md" role="tabpanel">
        {message ? <p className="mb-5 rounded-xl bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald" role="status">{message}</p> : null}
        {error ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-maroon-soft px-4 py-3 text-sm font-semibold text-maroon-deep" role="alert">
            <span>{error}</span>
            <button type="button" className="focus-ring inline-flex items-center gap-2 rounded-sm" onClick={() => void loadAccount()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
            </button>
          </div>
        ) : null}

        {tab === "profile" ? (
          <form className="account-profile" onSubmit={saveProfile}>
            <div className="account-panel__heading">
              <div className="account-panel__title">
                <span className="account-lotus" aria-hidden="true"><Flower2 /></span>
                <h2>Profile details</h2>
              </div>
              <p>Keep your information up to date for a seamless shopping experience.</p>
            </div>
            <div className="account-profile__content">
              <div>
                <div className="account-form-grid">
                  <label className="account-field">Full name <em>*</em><span><UserRound aria-hidden="true" /><input name="fullName" defaultValue={customer?.fullName} required /></span></label>
                  <label className="account-field">Mobile number <em>*</em><span><Smartphone aria-hidden="true" /><input name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" defaultValue={customer?.phone} required /></span></label>
                  <label className="account-field account-field--wide">Email <em>*</em><span><Mail aria-hidden="true" /><input value={customer?.email || ""} readOnly aria-describedby="email-note" /></span></label>
                </div>
                <p id="email-note" className="account-email-note">Contact support to change your account email.</p>
                <button className="account-save focus-ring" type="submit" disabled={loading}>Save changes <ArrowRight aria-hidden="true" /></button>
              </div>
              <aside className="account-benefits" aria-label="Account benefits">
                <div><span><Gift aria-hidden="true" /></span><p><strong>Faster checkout</strong>Your details, saved for next time.</p></div>
                <div><span><Heart aria-hidden="true" /></span><p><strong>Curated for you</strong>Access your saved styles anytime.</p></div>
                <div><span><Truck aria-hidden="true" /></span><p><strong>Hassle-free support</strong>Quick help for all your orders.</p></div>
              </aside>
            </div>
          </form>
        ) : null}

        {tab === "addresses" ? (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/10 pb-4">
              <h2 className="font-display text-3xl font-semibold text-maroon-deep">Delivery addresses</h2>
              <button className="btn-secondary gap-2 rounded-xl" type="button" onClick={openNewAddress}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add address
              </button>
            </div>
            {showAddressForm ? (
              <form className="grid gap-4 rounded-2xl border border-amber-900/10 bg-white p-5 sm:grid-cols-2" onSubmit={saveAddress}>
                {([
                  ["Full name", "fullName", "text", "name"],
                  ["Mobile number", "phone", "tel", "tel"],
                  ["Address line 1", "addressLine1", "text", "address-line1"],
                  ["Address line 2", "addressLine2", "text", "address-line2"],
                  ["City", "city", "text", "address-level2"],
                  ["State", "state", "text", "address-level1"],
                  ["Pincode", "pincode", "text", "postal-code"]
                ] as const).map(([label, key, type, autoComplete]) => (
                  <label className={`form-field ${key === "addressLine1" || key === "addressLine2" ? "sm:col-span-2" : ""}`} key={key}>
                    {label}
                    <input
                      type={type}
                      autoComplete={autoComplete}
                      inputMode={key === "phone" || key === "pincode" ? "numeric" : undefined}
                      pattern={key === "phone" ? "[6-9][0-9]{9}" : key === "pincode" ? "[0-9]{6}" : undefined}
                      value={addressDraft[key] as string}
                      required={!(["addressLine2"] as string[]).includes(key)}
                      onChange={(event) => setAddressDraft((value) => ({ ...value, [key]: event.target.value }))}
                      className="rounded-xl border-amber-900/15"
                    />
                  </label>
                ))}
                <label className="flex min-h-11 items-center gap-3 text-sm font-semibold sm:col-span-2">
                  <input type="checkbox" checked={addressDraft.isDefault} onChange={(event) => setAddressDraft((value) => ({ ...value, isDefault: event.target.checked }))} className="accent-[#580B26]" />
                  Use as default delivery address
                </label>
                <div className="flex gap-3 sm:col-span-2">
                  <button className="btn-primary rounded-xl bg-[#580B26]" type="submit" disabled={loading}>{editingAddressId ? "Update address" : "Save address"}</button>
                  <button className="btn-secondary rounded-xl" type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}>Cancel</button>
                </div>
              </form>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((address) => (
                <article className="relative rounded-2xl border border-amber-900/15 bg-white/90 p-5 shadow-xs" key={address.id}>
                  <div className="pr-20">
                    <h3 className="font-display text-lg font-bold text-maroon-deep">{address.fullName}</h3>
                    <p className="mt-2 text-xs leading-6 text-charcoal/70">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.city}, {address.state} {address.pincode}<br />{address.phone}</p>
                    {address.isDefault ? <p className="mt-3 inline-block rounded-full bg-emerald/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald border border-emerald/20">Default Address</p> : null}
                  </div>
                  <button type="button" className="icon-button absolute right-14 top-3 text-maroon" aria-label={`Edit address for ${address.fullName}`} onClick={() => editAddress(address)} disabled={loading}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-button absolute right-3 top-3 text-maroon" aria-label={`Delete address for ${address.fullName}`} onClick={() => void removeAddress(address.id)} disabled={loading}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              ))}
              {!addresses.length && !loading ? <p className="text-sm text-charcoal/60">No delivery address saved yet.</p> : null}
            </div>
          </section>
        ) : null}

        {tab === "orders" ? (
          <section className="space-y-6">
            {/* Orders Header & Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/10 pb-5">
              <div>
                <h2 className="font-display text-3xl font-semibold text-maroon-deep">Your Orders</h2>
                <p className="mt-1 text-sm text-charcoal/65">
                  Track delivery progress, view invoices, and manage 36-hour return requests.
                </p>
              </div>
              <span className="rounded-full bg-maroon-soft px-3.5 py-1.5 text-xs font-bold text-maroon-deep border border-maroon/20">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {/* Filter Tabs */}
            {orders.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "delivered", label: "Delivered" },
                  { id: "in_transit", label: "In Transit / Processing" },
                  { id: "cancelled", label: "Cancelled" }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setOrderFilter(filter.id as OrderFilter)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      orderFilter === filter.id
                        ? "bg-[#580B26] text-white shadow-xs"
                        : "bg-white/80 text-charcoal/70 hover:bg-amber-900/10 border border-amber-900/10"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Orders List */}
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const statusLower = order.status.toLowerCase();
                const canCancel = ["pending", "placed", "confirmed", "processing"].includes(statusLower);
                const isDelivered = statusLower === "delivered";
                const isCancelled = statusLower === "cancelled";
                const eligibility = returnEligibility[order.id];
                const remainingReturnMs = eligibility
                  ? Math.max(0, eligibility.msRemaining - Math.max(0, returnClock - returnEligibilityCheckedAt))
                  : 0;
                const canReturn = isDelivered && eligibility?.eligible === true && remainingReturnMs > 0;

                return (
                  <article
                    className="overflow-hidden rounded-3xl border border-amber-900/10 bg-white/95 shadow-xs transition-shadow hover:shadow-md"
                    key={order.id}
                  >
                    {/* Order Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/10 bg-[#FAF7F2] p-4 sm:p-5">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-xl font-bold text-maroon-deep sm:text-2xl">
                            Order #{order.orderNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              isDelivered
                                ? "border border-emerald/30 bg-emerald/10 text-emerald"
                                : isCancelled
                                ? "border border-charcoal/20 bg-charcoal/10 text-charcoal/70"
                                : "border border-amber-500/30 bg-amber-500/10 text-amber-900"
                            }`}
                          >
                            {isDelivered ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
                            ) : isCancelled ? (
                              <AlertCircle className="h-3.5 w-3.5 text-charcoal/60" />
                            ) : (
                              <Truck className="h-3.5 w-3.5 text-amber-800" />
                            )}
                            {order.publicStatus.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-charcoal/65">
                          Placed on{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })
                            : "Date unavailable"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-extrabold text-charcoal tabular-nums">
                          {formatMoney(order.total)}
                        </p>
                        {order.discount > 0 ? (
                          <p className="mt-0.5 text-xs font-bold text-emerald">
                            {order.total === 0 ? "Fully discounted" : "Promo applied"}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-6">
                      {/* 36-HOUR RETURN WINDOW BANNER */}
                      {isDelivered && eligibility ? (
                        canReturn ? (
                          /* ACTIVE 36-HOUR RETURN WINDOW BANNER */
                          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-5 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                  </span>
                                  <Clock className="h-4 w-4 text-emerald-700" />
                                  36-Hour Return & Exchange Window Active
                                </div>
                                <div
                                  className="font-mono text-2xl font-black text-emerald-950 tabular-nums"
                                  aria-live="polite"
                                >
                                  ⏳ {formatReturnTime(remainingReturnMs)} remaining
                                </div>
                                <p className="text-xs text-emerald-800/80">
                                  Return window closes on{" "}
                                  <strong className="font-semibold text-emerald-950">
                                    {new Date(eligibility.returnDeadline).toLocaleString("en-IN", {
                                      dateStyle: "medium",
                                      timeStyle: "short"
                                    })}
                                  </strong>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setReturnOrderId(returnOrderId === order.id ? null : order.id)
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-95"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Request Return & Exchange
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* EXPIRED 36-HOUR RETURN WINDOW BANNER */
                          <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50/90 p-4 text-stone-700">
                            <Lock className="h-5 w-5 shrink-0 text-stone-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                                🔒 36-Hour Return Window Closed
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                                The 36-hour return window for this order closed on{" "}
                                <strong>
                                  {new Date(eligibility.returnDeadline).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                  })}
                                </strong>
                                . Per AMZIRA policy, return/exchange requests are no longer eligible for this delivered order.
                              </p>
                            </div>
                          </div>
                        )
                      ) : !isDelivered && !isCancelled ? (
                        /* IN-TRANSIT RETURN WINDOW NOTE */
                        <div className="flex items-center gap-2.5 rounded-xl border border-amber-900/15 bg-[#FAF7F2] p-3.5 text-xs text-amber-900">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-800" />
                          <span>
                            <strong>36-Hour Return Policy:</strong> The 36-hour return window will activate automatically upon delivery.
                          </span>
                        </div>
                      ) : null}

                      {/* Ordered Items List */}
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/50">
                            Ordered Items ({order.items.length})
                          </h4>
                          <div className="divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-white">
                            {order.items.map((item) => (
                              <div
                                className="flex items-center justify-between gap-4 p-3.5"
                                key={item.id}
                              >
                                <div className="flex items-center gap-3.5">
                                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-sandal/40 border border-charcoal/10">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.productName}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="grid h-full w-full place-items-center text-charcoal/30">
                                        <Package className="h-6 w-6" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-display text-sm font-semibold text-maroon-deep">
                                      {item.productName}
                                    </h5>
                                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-charcoal/65">
                                      {item.variantDetails ? <span>{item.variantDetails}</span> : null}
                                      {item.size ? <span>Size: {item.size}</span> : null}
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right font-semibold text-sm text-charcoal tabular-nums">
                                  {formatMoney(item.totalPrice || item.unitPrice * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Pricing Breakdown */}
                      {order.discount > 0 ? (
                        <dl className="grid gap-2 rounded-xl bg-[#FAF7F2] p-4 text-sm sm:max-w-md">
                          <div className="flex justify-between gap-6">
                            <dt className="text-charcoal/70">Subtotal</dt>
                            <dd className="font-semibold tabular-nums">{formatMoney(order.subtotal)}</dd>
                          </div>
                          <div className="flex justify-between gap-6 text-emerald">
                            <dt>{order.couponCode ? `Promo ${order.couponCode}` : "Discount"}</dt>
                            <dd className="font-semibold tabular-nums">-{formatMoney(order.discount)}</dd>
                          </div>
                          <div className="flex justify-between gap-6 border-t border-charcoal/10 pt-2 font-bold text-maroon-deep">
                            <dt>Total Paid</dt>
                            <dd className="tabular-nums">{formatMoney(order.total)}</dd>
                          </div>
                        </dl>
                      ) : null}

                      {/* Actions Bar */}
                      <div className="flex flex-wrap gap-3 border-t border-amber-900/10 pt-4">
                        <Link
                          className="btn-secondary gap-2 rounded-xl"
                          href={`/order-tracking?order=${encodeURIComponent(order.orderNumber)}`}
                        >
                          <Truck className="h-4 w-4" aria-hidden="true" /> Track Order
                        </Link>
                        {order.status.toLowerCase() !== "pending" ? (
                          <button
                            className="btn-secondary gap-2 rounded-xl"
                            type="button"
                            onClick={() => void downloadInvoice(order.orderNumber)}
                          >
                            <FileText className="h-4 w-4" aria-hidden="true" /> Invoice
                          </button>
                        ) : null}
                        {canCancel ? (
                          <button
                            className="btn-secondary text-maroon rounded-xl"
                            type="button"
                            onClick={() => void cancel(order.id)}
                            disabled={loading}
                          >
                            Cancel Order
                          </button>
                        ) : null}
                      </div>

                      {/* Expanded Return Request Form */}
                      {returnOrderId === order.id ? (
                        <form
                          className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5"
                          onSubmit={(event) => void submitReturn(event, order.id)}
                        >
                          <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                            <RotateCcw className="h-4 w-4 text-emerald-700" />
                            Submit 36-Hour Return / Exchange Request
                          </div>
                          <p className="text-xs text-emerald-800">
                            Per AMZIRA policy, items can be returned within 36 hours of delivery. Please provide details below.
                          </p>
                          <label className="form-field">
                            Return reason
                            <select name="reason" defaultValue="other" className="rounded-xl bg-white">
                              <option value="size_issue">Size issue / Fitting issue</option>
                              <option value="quality_issue">Quality issue</option>
                              <option value="damaged">Damaged item on delivery</option>
                              <option value="wrong_item">Received wrong item</option>
                              <option value="other">Other reason</option>
                            </select>
                          </label>
                          <label className="form-field">
                            Details & description
                            <textarea
                              name="description"
                              rows={3}
                              maxLength={500}
                              placeholder="Please describe why you are requesting a return/exchange..."
                              required
                              className="rounded-xl bg-white"
                            />
                          </label>
                          <div className="flex gap-3 pt-1">
                            <button
                              className="btn-primary bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                              type="submit"
                              disabled={loading}
                            >
                              Submit Return Request
                            </button>
                            <button
                              className="btn-secondary rounded-xl"
                              type="button"
                              onClick={() => setReturnOrderId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  </article>
                );
              })}

              {!filteredOrders.length && !loading ? (
                <div className="rounded-3xl border border-amber-900/10 bg-white/90 p-8 text-center">
                  <Package className="mx-auto h-10 w-10 text-amber-800/40" />
                  <h3 className="mt-3 font-display text-lg font-semibold text-maroon-deep">
                    No orders found
                  </h3>
                  <p className="mt-1 text-sm text-charcoal/65">
                    {orderFilter === "all"
                      ? "Your first order will appear here after payment is verified."
                      : `No orders matching filter "${orderFilter}".`}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {tab === "wishlist" ? (
          <section className="space-y-6">
            <h2 className="font-display text-3xl font-semibold text-maroon-deep border-b border-amber-900/10 pb-4">Saved styles</h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {wishlist.map((item) => (
                <article className="overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-xs" key={item.id}>
                  <Link className="focus-ring block" href={`/product/${item.product_slug}`}>
                    <div className="relative aspect-[4/5] bg-sandal">
                      {item.product_image ? <Image src={item.product_image} alt={item.product_name} fill sizes="(min-width: 1280px) 24vw, 50vw" className="object-cover" /> : null}
                    </div>
                    <div className="p-4"><h3 className="font-display text-xl font-semibold text-maroon-deep">{item.product_name}</h3><p className="mt-2 font-bold text-maroon">{formatMoney(item.product_price)}</p></div>
                  </Link>
                  <button className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 border-t border-amber-900/10 text-xs font-bold uppercase tracking-wider text-maroon hover:bg-maroon-soft" type="button" onClick={async () => { await removeWishlistItem(item.product_id); setWishlist(await getWishlist()); }}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                  </button>
                </article>
              ))}
              {!wishlist.length && !loading ? <p className="text-sm text-charcoal/60">Save a style from its product page to find it here.</p> : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
