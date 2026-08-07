"use client";

import { useRouter } from "next/navigation";

export function CheckoutForm() {
  const router = useRouter();

  return (
    <form
      className="rounded-md border border-charcoal/10 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        router.push("/order-success");
      }}
    >
      <div className="grid gap-5">
        {([
          ["Full name", "text", "text", "name"],
          ["Email", "email", "email", "email"],
          ["Phone", "tel", "tel", "tel"],
          ["Pincode", "text", "numeric", "postal-code"],
          ["Address", "text", "text", "street-address"]
        ] as const).map(([label, type, inputMode, autoComplete]) => (
          <label key={label} className="grid gap-2 text-sm font-semibold text-charcoal">
            {label}
            <input
              className="min-h-11 rounded-md border border-charcoal/15 px-4 font-normal focus:border-maroon"
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              required
            />
          </label>
        ))}
        <fieldset className="rounded-md border border-charcoal/10 p-4">
          <legend className="px-2 text-sm font-bold uppercase tracking-[0.16em]">Payment</legend>
          <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
            <input type="radio" name="payment" defaultChecked className="accent-maroon" />
            Razorpay secure payment
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="radio" name="payment" className="accent-maroon" />
            Cash on delivery, if available
          </label>
        </fieldset>
        <button type="submit" className="btn-primary">
          Place order
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push("/payment-failure")}>
          Simulate payment failure
        </button>
        <p role="status" aria-live="polite" className="text-sm text-charcoal/60">
          Checkout UI is ready for FastAPI order and payment wiring during deployment.
        </p>
      </div>
    </form>
  );
}
