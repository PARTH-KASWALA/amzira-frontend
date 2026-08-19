"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, CreditCard, LockKeyhole, MapPin, Plus, ShieldCheck, Tag } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { createPaymentOrder, validateCheckout, verifyPayment } from "@/lib/api/checkout";
import { createAddress, getAddresses } from "@/lib/api/customer";
import type { Address, AddressInput, CheckoutPreview } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

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

let razorpayLoader: Promise<void> | null = null;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayLoader) return razorpayLoader;
  razorpayLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Secure payment could not be loaded. Please try again."));
    document.head.appendChild(script);
  });
  return razorpayLoader;
}

export function CheckoutForm() {
  const router = useRouter();
  const { customer, status: sessionStatus } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressDraft, setAddressDraft] = useState<AddressInput>(emptyAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [stage, setStage] = useState<"loading" | "ready" | "validating" | "paying" | "verifying">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setStage("ready");
      return;
    }
    getAddresses()
      .then((values) => {
        setAddresses(values);
        setSelectedAddressId(values.find((address) => address.isDefault)?.id || values[0]?.id || null);
        setShowAddressForm(values.length === 0);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Addresses could not be loaded."))
      .finally(() => setStage("ready"));
  }, [sessionStatus]);

  const isBusy = ["validating", "paying", "verifying"].includes(stage);
  const stageLabel = useMemo(() => {
    if (stage === "validating") return "Checking stock and delivery...";
    if (stage === "paying") return "Opening secure payment...";
    if (stage === "verifying") return "Verifying your payment...";
    return "PAY SECURELY";
  }, [stage]);

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setStage("validating");
    try {
      const created = await createAddress({ ...addressDraft, isDefault: addresses.length === 0 || addressDraft.isDefault });
      const values = await getAddresses();
      setAddresses(values);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setAddressDraft(emptyAddress);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Address could not be saved.");
    } finally {
      setStage("ready");
    }
  }

  async function beginPayment() {
    if (!customer || !selectedAddressId || isBusy) return;
    setMessage("");
    try {
      setStage("validating");
      const nextPreview = await validateCheckout(customer.id, selectedAddressId);
      setPreview(nextPreview);
      setStage("paying");
      const paymentOrder = await createPaymentOrder(customer.id, selectedAddressId, couponCode.trim());
      setPreview(paymentOrder);

      if (!paymentOrder.paymentRequired) {
        window.dispatchEvent(new CustomEvent("amzira-cart-updated"));
        router.push(
          `/order-success${paymentOrder.orderNumber ? `?order=${encodeURIComponent(paymentOrder.orderNumber)}` : ""}`
        );
        return;
      }

      await loadRazorpay();

      if (!window.Razorpay || !paymentOrder.razorpayOrderId || !paymentOrder.razorpayKeyId) {
        throw new Error("Secure payment is unavailable. Please try again.");
      }
      const razorpay = new window.Razorpay({
        key: paymentOrder.razorpayKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "AMZIRA",
        description: "South Indian girls' occasionwear",
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.phone
        },
        theme: { color: "#700018" },
        modal: {
          confirm_close: true,
          escape: true,
          ondismiss: () => {
            setStage("ready");
            setMessage("Payment was closed. Your cart and delivery address are still saved.");
          }
        },
        handler: async (response) => {
          setStage("verifying");
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId: customer.id,
              addressId: selectedAddressId
            });
            const orderNumber = typeof result.order_number === "string" ? result.order_number : "";
            window.dispatchEvent(new CustomEvent("amzira-cart-updated"));
            router.push(`/order-success${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ""}`);
          } catch (error) {
            setStage("ready");
            setMessage(
              error instanceof Error
                ? `${error.message} Do not pay again until your account order history is checked.`
                : "Payment verification is pending. Check your orders before retrying."
            );
          }
        }
      });
      razorpay.on("payment.failed", () => {
        setStage("ready");
        setMessage("Payment did not complete. No new order was created and your cart is unchanged.");
      });
      razorpay.open();
    } catch (error) {
      setStage("ready");
      setMessage(error instanceof Error ? error.message : "Checkout could not be started.");
    }
  }

  if (sessionStatus === "loading" || stage === "loading") {
    return <div className="h-96 animate-pulse rounded-3xl bg-amber-900/5 border border-amber-900/10" aria-label="Loading checkout" />;
  }

  if (sessionStatus === "guest") {
    return (
      <div className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-8 text-center shadow-xs">
        <LockKeyhole className="mx-auto h-8 w-8 text-maroon" aria-hidden="true" />
        <h2 className="mt-4 font-display text-3xl font-semibold text-maroon-deep">Sign in for secure checkout</h2>
        <p className="mt-3 max-w-lg mx-auto leading-7 text-charcoal/65">
          Your guest cart stays on this device and will move into your account automatically after sign in.
        </p>
        <Link className="btn-primary mt-6 rounded-xl bg-[#580B26] px-8 py-3.5 text-xs uppercase font-bold tracking-wider" href="/login?next=/checkout">
          Sign in to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-6 sm:p-8 shadow-xs space-y-8">
      {/* 1. Delivery Address Section */}
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-maroon-deep">1. Delivery Address</h2>
            <p className="text-xs text-charcoal/65">Choose where your handcrafted garment should arrive.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <label
                key={address.id}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl p-5 transition-all ${
                  isSelected
                    ? "border-2 border-[#580B26] bg-white shadow-sm"
                    : "border border-amber-900/15 bg-white/60 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={isSelected}
                  onChange={() => setSelectedAddressId(address.id)}
                  className="mt-1 accent-[#580B26]"
                />
                <div className="flex-1 text-sm leading-6">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="block font-display text-base font-semibold text-maroon-deep">
                      {address.fullName}
                    </strong>
                    {address.isDefault ? (
                      <span className="rounded-full bg-emerald/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald border border-emerald/20 uppercase tracking-wider">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-charcoal/70 text-xs sm:text-sm">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    <br />
                    {address.city}, {address.state} — {address.pincode}
                    <br />
                    <span className="font-semibold text-charcoal">Phone:</span> {address.phone}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-maroon hover:underline"
          onClick={() => setShowAddressForm((value) => !value)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {showAddressForm ? "Close address form" : "Add new delivery address"}
        </button>

        {showAddressForm ? (
          <form className="mt-5 grid gap-4 rounded-2xl border border-amber-900/10 bg-white p-5 sm:grid-cols-2" onSubmit={saveAddress}>
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
                  required={key !== "addressLine2"}
                  onChange={(event) => setAddressDraft((value) => ({ ...value, [key]: event.target.value }))}
                  className="rounded-xl border-amber-900/15"
                />
              </label>
            ))}
            <button className="btn-primary w-fit sm:col-span-2 rounded-xl bg-[#580B26]" type="submit" disabled={isBusy}>
              Save Delivery Address
            </button>
          </form>
        ) : null}
      </div>

      <hr className="border-amber-900/10" />

      {/* 2. Secure Online Payment Section */}
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-amber-900/10">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-maroon-deep">2. Secure Online Payment</h2>
            <p className="text-xs text-charcoal/65">UPI, GPay, PhonePe, Paytm, Cards & Netbanking via Razorpay.</p>
          </div>
        </div>

        {/* Payment Methods Badges Preview */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-amber-950">
          <span className="rounded-lg border border-amber-900/15 bg-white px-2.5 py-1">⚡ GPay & PhonePe UPI</span>
          <span className="rounded-lg border border-amber-900/15 bg-white px-2.5 py-1">💳 Credit & Debit Cards</span>
          <span className="rounded-lg border border-amber-900/15 bg-white px-2.5 py-1">🏦 Netbanking</span>
        </div>

        {/* Promo Code Input */}
        <div className="mt-5 rounded-2xl border border-amber-900/10 bg-white p-4">
          <label className="block text-xs font-bold text-maroon-deep uppercase tracking-wider mb-2">
            Have a Promo Code?
          </label>
          <div className="relative flex items-center">
            <Tag className="absolute left-3.5 h-4 w-4 text-maroon/60" aria-hidden="true" />
            <input
              className="w-full rounded-xl border border-charcoal/20 bg-[#FDFAF5] py-2.5 pl-10 pr-4 text-xs font-bold uppercase tracking-wider text-charcoal placeholder:text-charcoal/40 focus:border-maroon focus:outline-none"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="ENTER PROMO CODE"
              autoComplete="off"
              maxLength={50}
            />
          </div>
        </div>

        {/* Verified Financial Breakdown Preview */}
        {preview ? (
          <dl className="mt-5 grid gap-2 rounded-2xl border border-amber-900/10 bg-white p-4 text-xs">
            <div className="flex justify-between text-charcoal/70"><dt>Merchandise Subtotal</dt><dd className="font-semibold tabular-nums">{formatMoney(preview.subtotal)}</dd></div>
            <div className="flex justify-between text-charcoal/70"><dt>Express Shipping</dt><dd className="font-semibold tabular-nums">{preview.shipping ? formatMoney(preview.shipping) : "Free"}</dd></div>
            {preview.discount ? <div className="flex justify-between text-emerald font-bold"><dt>Promo Discount</dt><dd className="tabular-nums">-{formatMoney(preview.discount)}</dd></div> : null}
            <div className="flex justify-between text-charcoal/70"><dt>Estimated Tax (GST 5%)</dt><dd className="font-semibold tabular-nums">{formatMoney(preview.tax)}</dd></div>
            <div className="flex justify-between border-t border-amber-900/10 pt-2 font-display text-base font-bold text-maroon-deep"><dt>Verified Total</dt><dd className="tabular-nums">{formatMoney(preview.total)}</dd></div>
          </dl>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl bg-maroon-soft px-4 py-3 text-xs font-semibold leading-5 text-maroon-deep" role="status" aria-live="polite">
            {message}
          </p>
        ) : null}

        {/* Primary Pay Button */}
        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#580B26] py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#43071c] active:scale-[0.99] disabled:opacity-60"
          disabled={!selectedAddressId || isBusy}
          onClick={() => void beginPayment()}
        >
          {stage === "ready" ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
          {stageLabel}
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-charcoal/60">
          <LockKeyhole className="h-3.5 w-3.5 text-maroon/70" aria-hidden="true" />
          256-Bit SSL Encrypted. Payment details are handled by Razorpay & never stored by AMZIRA.
        </p>
      </div>
    </div>
  );
}
