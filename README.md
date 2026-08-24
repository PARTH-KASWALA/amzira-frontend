# AMZIRA Frontend

Production storefront for AMZIRA, a South Indian luxury ethnic wear ecommerce brand.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Playwright end-to-end tests

## Primary App Structure

- `app/` - routes, metadata, sitemap, robots, and image proxy route
- `components/` - reusable storefront UI
- `lib/` - API client, fallback catalog, navigation, SEO helpers, formatters
- `images/` - local product, category, logo, and ceremony assets used by the Next app
- `design-system/` - AMZIRA visual direction and token notes
- `tests/` - storefront end-to-end coverage

## Local Development

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

The frontend reads backend data from `NEXT_PUBLIC_API_BASE_URL` and falls back to the local catalog when the backend is unavailable.

## Lean first production

For a low-traffic launch, keep the frontend and backend on one small server and use Cloudflare for DNS, TLS, and caching. Do not pay for separate Redis, analytics, monitoring, email, object storage, or preview environments until the store has real usage. Keep the database on the same server only with automated daily backups to a separate location.

The frontend is designed to reduce server work in production: catalog reads are cached for five minutes and the homepage is revalidated on the same interval. Set `NEXT_PUBLIC_ENABLE_CATALOG_FALLBACK=false` in production so demo catalog data cannot appear when the API is unavailable.

Copy `.env.example` to the deployment environment and set the real API and site URLs. Never commit `.env`, payment secrets, database credentials, or backend keys.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Backend

Default local API base:

```text
http://127.0.0.1:8000/api/v1
```
