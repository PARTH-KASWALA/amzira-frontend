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
