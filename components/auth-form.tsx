"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { browserApi } from "@/lib/api/browser-client";
import { useSession } from "@/components/session-provider";

type AuthMode = "login" | "signup" | "forgot";
type FormStatus = { type: "idle" | "success" | "error"; message: string };

async function postAuth(path: string, body: Record<string, string>) {
  return browserApi(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [status, setStatus] = useState<FormStatus>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    try {
      if (isForgot) {
        await postAuth("/auth/forgot-password", { email });
        setStatus({
          type: "success",
          message: "If an account exists, reset instructions have been sent."
        });
        return;
      }

      const password = String(form.get("password") || "");
      if (isSignup) {
        await postAuth("/auth/register", {
          email,
          password,
          full_name: String(form.get("full_name") || ""),
          phone: String(form.get("phone") || "")
        });
        setStatus({ type: "success", message: "Account created. You can sign in now." });
        router.push("/login");
        return;
      }

      await postAuth("/auth/login", { email, password });
      await refresh();
      setStatus({ type: "success", message: "Signed in successfully." });
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const nextPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/account";
      router.push(nextPath);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Please check the details and try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="rounded-md border border-charcoal/10 bg-white p-6 shadow-soft" onSubmit={onSubmit}>
      <div className="grid gap-5">
        {isSignup ? (
          <>
            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Full name
              <input
                className="min-h-11 rounded-md border border-charcoal/15 px-4 font-normal focus:border-maroon"
                name="full_name"
                type="text"
                autoComplete="name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Mobile number
              <input
                className="min-h-11 rounded-md border border-charcoal/15 px-4 font-normal focus:border-maroon"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                pattern="[6-9][0-9]{9}"
                required
              />
            </label>
          </>
        ) : null}

        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Email
          <input
            className="min-h-11 rounded-md border border-charcoal/15 px-4 font-normal focus:border-maroon"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        {isForgot ? null : (
          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Password
            <span className="relative block">
              <input
                className="min-h-11 w-full rounded-md border border-charcoal/15 px-4 pr-12 font-normal focus:border-maroon"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className="focus-ring absolute inset-y-0 right-0 grid w-11 place-items-center rounded-md text-charcoal/60 hover:text-maroon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </span>
          </label>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Please wait..." : isForgot ? "Send reset link" : isSignup ? "Create account" : "Sign in"}
        </button>

        {status.message ? (
          <p
            className={status.type === "error" ? "text-sm font-semibold text-maroon" : "text-sm font-semibold text-emerald"}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
          {mode === "login" ? (
            <>
              <Link className="focus-ring rounded-sm text-maroon" href="/forgot-password">
                Forgot password?
              </Link>
              <Link className="focus-ring rounded-sm text-maroon" href="/signup">
                Create account
              </Link>
            </>
          ) : (
            <Link className="focus-ring rounded-sm text-maroon" href="/login">
              Back to sign in
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
