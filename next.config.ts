import type { NextConfig } from "next";

const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
const scriptPolicy = process.env.NODE_ENV === "production" ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptPolicy} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://*.razorpay.com`,
  "frame-src https://api.razorpay.com https://*.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'"
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "api.amzira.com" },
      { protocol: "https", hostname: "api-staging.amzira.com" },
      { protocol: "https", hostname: "cdn.amzira.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" }
    ]
  },
  typedRoutes: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://api.razorpay.com\")" }
        ]
      },
      {
        source: "/account/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }]
      },
      {
        source: "/checkout/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }]
      },
      {
        source: "/seller/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ]
      }
    ];
  }
};

export default nextConfig;
