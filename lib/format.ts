export function formatMoney(value: number | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://www.amzira.com";

  try {
    const url = new URL(configured);
    // Keep canonical, Open Graph, robots, and sitemap URLs on the host used
    // by the public storefront. The apex domain redirects to www.
    if (url.hostname === "amzira.com") url.hostname = "www.amzira.com";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "https://www.amzira.com";
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function absoluteUrl(path = "") {
  const origin = siteOrigin();
  if (path.startsWith("http")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
