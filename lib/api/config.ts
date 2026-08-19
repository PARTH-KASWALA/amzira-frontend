export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, "");

export const CATALOG_FALLBACK_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_CATALOG_FALLBACK === "true" ||
  (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_CATALOG_FALLBACK !== "false");

export const LIVE_CATEGORY_API_SLUG =
  process.env.NEXT_PUBLIC_LIVE_CATEGORY_API_SLUG || "kids";
