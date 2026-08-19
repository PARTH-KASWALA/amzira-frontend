"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { browserApi } from "@/lib/api/browser-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setFailed(false);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("password_confirmation") || "");
    if (password !== confirmation) {
      setFailed(true);
      setMessage("Passwords do not match.");
      setSubmitting(false);
      return;
    }
    try {
      await browserApi("/auth/reset-password", {
        method: "POST",
        retryAuth: false,
        body: JSON.stringify({ token, new_password: password })
      });
      setMessage("Password updated. Taking you to sign in...");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "This reset link could not be used.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-md border border-charcoal/10 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-maroon" role="alert">This reset link is incomplete. Request a new password reset email.</p>
      </div>
    );
  }

  return (
    <form className="rounded-md border border-charcoal/10 bg-white p-6 shadow-soft" onSubmit={onSubmit}>
      <div className="grid gap-5">
        {[
          ["New password", "password"],
          ["Confirm password", "password_confirmation"]
        ].map(([label, name]) => (
          <label className="grid gap-2 text-sm font-semibold text-charcoal" key={name}>
            {label}
            <span className="relative block">
              <input
                className="min-h-11 w-full rounded-md border border-charcoal/15 px-4 pr-12 font-normal focus:border-maroon"
                name={name}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="focus-ring absolute inset-y-0 right-0 grid w-11 place-items-center rounded-md text-charcoal/60 hover:text-maroon"
                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </span>
          </label>
        ))}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Updating..." : "Update password"}
        </button>
        {message ? <p className={`text-sm font-semibold ${failed ? "text-maroon" : "text-emerald"}`} role={failed ? "alert" : "status"}>{message}</p> : null}
      </div>
    </form>
  );
}
