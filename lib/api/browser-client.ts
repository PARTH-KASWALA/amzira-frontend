import { API_BASE_URL, API_ORIGIN } from "@/lib/api/config";
import type { ApiEnvelope } from "@/lib/api/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  root?: boolean;
  retryAuth?: boolean;
  timeoutMs?: number;
};

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split("=").slice(1).join("=")) : "";
}

async function ensureCsrf() {
  if (readCookie("csrf_token")) return;
  await fetch(`${API_BASE_URL}/auth/csrf-token`, {
    credentials: "include",
    headers: { Accept: "application/json" }
  });
}

function validationMessage(errors: unknown) {
  if (!Array.isArray(errors)) return undefined;

  for (const error of errors) {
    if (!error || typeof error !== "object") continue;
    const record = error as Record<string, unknown>;
    if (typeof record.msg !== "string") continue;

    const location = Array.isArray(record.loc) ? record.loc : [];
    const field = location.at(-1);
    if (typeof field !== "string") return record.msg;

    const label = field.replaceAll("_", " ");
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${record.msg}`;
  }

  return undefined;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | T | null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const detail = typeof record.detail === "string" ? record.detail : undefined;
    const message = typeof record.message === "string" ? record.message : undefined;
    throw new ApiError(
      detail || validationMessage(record.errors) || message || "We could not complete that request.",
      response.status,
      record.errors
    );
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

async function refreshSession() {
  try {
    await ensureCsrf();
    const headers = new Headers({ Accept: "application/json" });
    const csrf = readCookie("csrf_token");
    if (csrf) headers.set("X-CSRF-Token", csrf);
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers
    });
    return response.ok;
  } catch {
    // Let the original 401 surface so the UI can report an expired session
    // instead of misclassifying a failed refresh as an API outage.
    return false;
  }
}

export async function browserApi<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    root = false,
    retryAuth = true,
    timeoutMs = 12000,
    headers: inputHeaders,
    ...requestInit
  } = options;
  const method = (requestInit.method || "GET").toUpperCase();
  const mutates = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (mutates) await ensureCsrf();

  const headers = new Headers(inputHeaders);
  headers.set("Accept", "application/json");
  if (requestInit.body && !(requestInit.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const csrf = readCookie("csrf_token");
  if (mutates && csrf) headers.set("X-CSRF-Token", csrf);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${root ? API_ORIGIN : API_BASE_URL}${path}`, {
      ...requestInit,
      credentials: "include",
      headers,
      signal: controller.signal
    });
    if (response.status === 401 && retryAuth && path !== "/auth/refresh") {
      const refreshed = await refreshSession();
      if (refreshed) return browserApi<T>(path, { ...options, retryAuth: false });
    }
    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request took too long. Please try again.", 408);
    }
    throw new ApiError("AMZIRA is temporarily unreachable. Please try again.", 0);
  } finally {
    window.clearTimeout(timeout);
  }
}
