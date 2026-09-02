# Feature: AMZIRA Seller Order Panel

## Requirements

- While an administrator has a valid cookie session, when `/seller/orders` is opened, the system shall show a server-paginated queue of all orders.
- While an administrator views an order, when a valid lifecycle change is submitted, the backend shall update the order, required stock/refund/delivery side effects, and actor-attributed history in one transaction.
- When a guest or customer attempts to read or mutate seller data, the backend shall return `401` or `403` without exposing order PII.
- While checkout is disabled, when payment-order creation is attempted, the backend shall reject the operation before inventory reservation or a Razorpay order is created.

## Frontend

- App Router pages: `/seller/login`, `/seller/orders`, `/seller/orders/[id]`.
- Server page shells export `noindex` metadata; interactive data access stays in leaf client components because the credential cookies belong to `api.amzira.com`.
- `SellerGuard` uses the existing session provider for guest/admin/customer presentation, but never acts as the authorization authority.
- A typed Zod-backed admin API client handles list, detail, status, delivery, and checkout-status responses.
- The queue provides bounded pagination and backend filters. The detail page shows only fields intentionally returned by the admin API.
- Mutations are pessimistic: disable the form while pending, retain entered values on error, and refetch authoritative state after success.
- Loading, empty, expired-session, forbidden-role/IP, conflict, rate-limit, timeout, and server-error states are distinct and accessible.

## Backend

- Add `CHECKOUT_ENABLED` and `COD_ENABLED` settings. Production defaults keep COD off; payment-intent creation fails with `503` when checkout is off.
- Fix legacy expiry cleanup so only orders with an explicit expired `expires_at` are cancelled; COD orders without an expiry are not abandoned-payment intents.
- Use `OrderTrackingService` as the single lifecycle mutation service.
- Lock the target order and relevant variants for cancellation. Restore stock at most once for unpaid/COD cancellation.
- Reject direct cancellation of successful Razorpay orders with `409`; refunds continue through the existing return/refund workflow rather than a status-only mutation.
- Preserve allowed-transition validation, delivery metadata, return-window creation, and status history.
- Consolidate `/api/v1/admin/orders` list/detail/status contracts, use explicit response dictionaries, validate pagination/filter input, eager-load relationships, and include required payment/tracking fields.
- Keep admin role, session, IP allowlist, CSRF, rate limits, and structured admin-action logging.

## Security Checkpoint

- Authentication: HttpOnly cookie access/refresh tokens; no frontend token storage.
- Authorization: every seller API uses `require_admin`; client role checks are UX only.
- Input: Pydantic validates enums, pagination, dates, tracking/courier/notes lengths; Zod validates responses and form values.
- Output: admin DTOs explicitly select fields and exclude credentials, secrets, raw tokens, and internal payment secrets.
- SQL injection: SQLAlchemy expressions only; no interpolated SQL.
- XSS: React text rendering, no `dangerouslySetInnerHTML`; notes are length-bounded and rendered as text.
- CSRF: all seller mutations use the existing CSRF cookie/header client.
- Rate limits: retain bounded read/write limits.
- Logging: `require_admin` records admin action and IP; lifecycle history records actor and notes.
- Caching/indexing: `/seller/:path*` is private/no-store and seller pages are `noindex` plus robots-disallowed.

## Error Contract

- `401`: session missing/expired; redirect to seller login with safe local `next` path.
- `403`: authenticated non-admin or IP allowlist denial; show access denied without retry loop.
- `404`: order not found.
- `409`: paid-order cancellation/refund required or stale business conflict.
- `422`: invalid form/query input.
- `429`: rate limited.
- `503`: checkout disabled or dependent commerce service unavailable.
- Network/timeout/`5xx`: no optimistic state change; retain form data and allow deliberate retry.

## Implementation Plan

- [ ] Add settings and backend checkout/COD gates with tests.
- [ ] Fix expiry and canonical lifecycle service with tests.
- [ ] Consolidate admin order list/detail/status DTOs and tests.
- [ ] Add seller Zod types/API client and status helpers.
- [ ] Add protected seller route shells and client components.
- [ ] Add no-store/noindex/robots protections.
- [ ] Add Playwright authorization, queue, detail, and lifecycle tests.
- [ ] Run backend full suite and security checks.
- [ ] Run frontend typecheck, lint, production build, and browser tests.
