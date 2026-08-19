"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, browserApi } from "@/lib/api/browser-client";
import { getCurrentCustomer } from "@/lib/api/customer";
import type { Customer } from "@/lib/api/types";

type SessionContextValue = {
  customer: Customer | null;
  status: "loading" | "authenticated" | "guest";
  refresh: () => Promise<Customer | null>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<SessionContextValue["status"]>("loading");

  const refresh = useCallback(async () => {
    try {
      const next = await getCurrentCustomer();
      setCustomer(next);
      setStatus("authenticated");
      return next;
    } catch (error) {
      if (error instanceof ApiError && [0, 408].includes(error.status)) {
        setStatus("guest");
        return null;
      }
      setCustomer(null);
      setStatus("guest");
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await browserApi("/auth/logout", { method: "POST", retryAuth: false });
    } finally {
      setCustomer(null);
      setStatus("guest");
      window.dispatchEvent(new CustomEvent("amzira-session-changed"));
    }
  }, []);

  const value = useMemo(() => ({ customer, status, refresh, logout }), [customer, status, refresh, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
