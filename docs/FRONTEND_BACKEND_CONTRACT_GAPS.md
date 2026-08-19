# Frontend to Backend Contract Gaps

Status: Frontend consumers implemented; backend closure required before production launch

Frontend verification: typecheck, lint, optimized build, dependency audit, production security-header smoke test, and 39 Playwright tests across Chromium, Firefox, and WebKit pass as of 2026-08-11. Commerce acceptance remains pending because the backend fixtures below do not exist.

## Blocking contract decisions

1. **Live category taxonomy**
   - Public route: `/category/kids-pattu-pavadai`
   - Current frontend API default: `kids`
   - Backend seed and launch health checks must confirm the final active slug.
   - User-confirmed source inventory is the Ethzy catalog on Myntra. Its public snapshot reports 111 products: 101 lehenga choli, 5 dresses, and 5 ethnic dresses.
   - Import only products that genuinely fit the AMZIRA launch promise. Do not label every generic lehenga as pattu pavadai or South Indian silk.

2. **Checkout route namespace**
   - Current backend source mounts `/checkout`, `/create-payment-order`, and `/verify-payment` at the API origin.
   - Other customer endpoints are mounted under `/api/v1`.
   - Confirm whether root checkout paths are intentional or move them under `/api/v1/commerce` before production. The frontend currently follows the source contract.

3. **Production cookie and CORS configuration**
   - Confirm frontend and API origins, HTTPS enforcement, allowed origins, cookie host behavior, SameSite policy, and CSRF cookie path.
   - Local development should use `localhost` for both frontend and API hosts.
   - The current backend allows frontend port `3000`; add the chosen preview/test ports or standardize local frontend development on `3000` before authenticated browser acceptance.

4. **Secondary submission endpoints**
   - Newsletter subscription endpoint is missing.
   - Support request endpoint is missing.
   - Styling appointment endpoint is missing.
   - Store inquiry endpoint is missing.
   - The frontend uses honest `mailto:` actions until these contracts exist and does not simulate submission success.

5. **Backend environment verified on 2026-08-11**
   - `GET /health` returns healthy.
   - `GET /api/v1/categories` returns only `Women` and `Kurti`.
   - `GET /api/v1/products?category=kids` returns zero products.
   - `/openapi.json` returns `404`, so a versioned schema cannot currently be captured from the running service.
   - The backend `requirements.txt` pins incompatible versions: `celery[redis]==5.3.4` requires Redis `<5`, while `redis==5.0.1` is pinned.

6. **Owned catalog import safety**
   - The current bulk uploader accepts product-level comma-separated sizes and colors, then creates their Cartesian product with one shared stock quantity. This cannot represent real per-size/per-color inventory safely.
   - The current uploader generates SKUs from slugs instead of preserving seller SKUs and has no source product ID, source variant ID, HSN/tax, cost, weight, garment measurements, or import-status fields.
   - Product money fields use floating point. Production catalog, cart, payment, refund, and reporting values should use fixed-precision decimal storage consistently.
   - Implement an idempotent staging/import flow defined in `docs/ETHZY_CATALOG_MIGRATION_PLAN.md` before loading the owned catalog.

## Required deterministic fixtures

- Active `kids` category mapped to the public girls' collection.
- Import an initial 20-30 launch products from the owned Ethzy seller export, followed by the remaining approved catalog after content QA.
- Preserve source SKU/product IDs in a private integration field for reconciliation, while generating stable AMZIRA slugs and customer-facing titles.
- Map product name, category, age range, sizes, color, fabric, work/ornamentation, blouse and skirt construction, included pieces, care, MRP, selling price, tax, stock, weight, dimensions, images, and active status.
- At least four deterministic products must include multiple active variants and representative in-stock, low-stock, and sold-out states for frontend acceptance.
- Customer fixture with saved address, wishlist item, placed order, shipped order, delivered return-eligible order, and cancelled order.
- Razorpay test credentials and webhook fixtures for success, invalid signature, duplicate callback, cancellation, and delayed verification.
- Tracking fixtures for placed, confirmed, shipped, out for delivery, delivered, return requested, and returned.

## Contract quality requirements

- Preserve the standard `{ success, message, data, errors }` envelope for JSON responses.
- Publish and version the generated OpenAPI document used by frontend CI.
- Document all enum values and authorization rules.
- Return stable machine-readable validation errors alongside customer-safe messages.
- Ensure payment verification and order creation remain idempotent.
- Keep marketplace stock and AMZIRA stock synchronized through a documented inventory owner or reserved-channel quantity. Never infer live stock from the public Myntra page.
