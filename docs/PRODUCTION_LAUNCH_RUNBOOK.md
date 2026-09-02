# AMZIRA Production Launch Runbook

**Decision baseline:** catalog launch is safe; live checkout remains **NO-GO** until every external acceptance gate below is signed off. The production backend defaults to `CHECKOUT_ENABLED=False` and `COD_ENABLED=False`.

## 1. Roles and evidence record

Fill this in before deployment. Do not use shared credentials.

| Responsibility | Named owner | Evidence / timestamp |
|---|---|---|
| Release commander and final GO |  |  |
| Backend/Render deploy and rollback |  |  |
| Frontend/Vercel deploy and rollback |  |  |
| Razorpay reconciliation/refund |  |  |
| Fulfilment/Shiprocket |  |  |
| Database backup/restore |  |  |
| Customer support |  |  |

Record the reviewed frontend and backend Git commit IDs, Render deploy IDs, Vercel deployment URL, database backup checksum, and the Razorpay test/live references in the launch ticket.

## 2. Required production configuration

### Vercel frontend

- `NEXT_PUBLIC_SITE_URL=https://www.amzira.com`
- `NEXT_PUBLIC_API_BASE_URL=https://api.amzira.com/api/v1`
- `NEXT_PUBLIC_ENABLE_CATALOG_FALLBACK=false`
- `NEXT_PUBLIC_LIVE_CATEGORY_API_SLUG=kids`

Deploy from a reviewed commit. Confirm `/seller/*` responses include `Cache-Control: private, no-store, max-age=0` and `X-Robots-Tag: noindex, nofollow, noarchive`.

### Render backend

The Blueprint keeps both commerce flags false initially. Supply every `sync: false` value, especially:

- Live Razorpay key ID, secret, and a unique webhook secret.
- Stable seller VPN/office egress address in `ADMIN_ALLOWED_IPS`.
- R2 credentials and `https://cdn.amzira.com` public URL.
- Resend SMTP password and verified sender domain.
- Shiprocket credentials, signed webhook secret, pickup postcode, and channel/pickup configuration.
- Sentry DSN and alert ownership.

Production startup intentionally fails if credentials are placeholders, PostgreSQL/Redis are local, R2/Shiprocket/SMTP is incomplete, the admin allowlist is empty, debug mode is on, or no active admin exists.

Create the first admin through the controlled backend bootstrap, sign in once from the approved network, rotate the bootstrap password, and remove `DEFAULT_ADMIN_PASSWORD` after verification.

## 3. Pre-deploy local gates

From the frontend repository:

```bash
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm run build
npx playwright test tests/seller-orders.spec.js
```

Run the storefront suite with the API and its launch database available; fallback must remain disabled:

```bash
npx playwright test tests/storefront.spec.js --project=chromium
```

From the backend repository:

```bash
.venv/bin/pip-audit
.venv/bin/python -m compileall -q app
.venv/bin/pytest -q
.venv/bin/alembic upgrade head
.venv/bin/alembic current
```

Verified local evidence (2026-09-02): backend `92 passed, 2 skipped`; the two opt-in checks are the PostgreSQL concurrency test and PostgreSQL enum migration test. The order-status migration was also applied from an empty PostgreSQL database through Alembic head and its lowercase enum contract passed. Seller browser suite `15 passed` across Chromium, Firefox, and WebKit. The storefront Chromium suite passed all 28 cases with the real local API/database topology (20 initial passes plus 8 API-dependent reruns). Frontend lint, typecheck, production build, npm audit, pip audit, compile check, diff check, and secret scan passed.

## 4. Deploy closed

1. Confirm `CHECKOUT_ENABLED=False` and `COD_ENABLED=False` in the Render environment group.
2. Take a production PostgreSQL backup and record its checksum.
3. Deploy PostgreSQL migration/API, then worker and Beat. Do not expose payment while services are converging.
4. Deploy the frontend with production API/site URLs and fallback disabled.
5. Verify DNS/TLS for `www.amzira.com`, `amzira.com`, `api.amzira.com`, and `cdn.amzira.com`.
6. Confirm public catalog/product images and category counts against the imported source manifest.

## 5. Closed-checkout acceptance

These checks must pass while checkout remains disabled:

- `GET https://api.amzira.com/health` is healthy.
- Token-protected `/health/database`, `/health/email`, `/health/email/queue`, and `/health/catalog-launch` are healthy.
- `GET /api/v1/commerce/status` reports both flags false.
- An authenticated customer sees the checkout-paused state and cannot create a Razorpay order.
- An admin can sign in to `/seller/login` only from the approved real network.
- A customer receives 403 from `/api/v1/admin/orders`; no order PII is returned.
- Seller list, search, payment filter, detail, CSV export, and no-store headers work against production data.
- Worker and Beat logs show active processing without a restart loop.
- The expiry worker completes without PostgreSQL `orderstatus` enum errors; the deployed migration head is `b0c1d2e3f4a5`.
- Sentry receives a controlled non-PII test event and the named owner receives the alert.
- Resend delivers a test transactional email with SPF/DKIM passing.
- A fresh backup is restored into an isolated database; migration head and catalog/order row counts reconcile.

## 6. Test-mode commerce acceptance

Use non-live gateway credentials in a staging environment that mirrors production. Prove and record:

1. One successful payment creates exactly one paid order and one stock deduction.
2. Callback plus webhook replay still leaves one order and one deduction.
3. Invalid signature and failed/abandoned payment create no paid order.
4. Expired reservation restores stock once; stock never goes negative under PostgreSQL concurrency.
5. The order appears in the seller queue with exact customer, address, items, totals, and payment reference.
6. Confirmed → Packed → Shipped requires courier/tracking and creates actor-attributed history.
7. Customer tracking shows courier/tracking but not seller notes or admin identity.
8. Shiprocket creates the shipment and a valid signed webhook updates tracking.
9. Delivery sets `delivered_at` and the published return window once.
10. Cancellation of an unpaid order restores stock once. A paid Razorpay order cannot be status-only cancelled.
11. Return, partial refund, full refund, failed refund, and refund webhook replay reconcile with Razorpay.

Do not enable COD for launch unless a separate real COD acceptance run is signed off. Its flag remains independent.

## 7. Controlled live transaction

Only after sections 1–6 pass:

1. Keep COD false. Set `CHECKOUT_ENABLED=True` for the API/worker/Beat environment group and redeploy if required.
2. Confirm `/api/v1/commerce/status` reports checkout true and COD false.
3. Place one low-value live order using a named tester and a unique SKU.
4. Reconcile the Razorpay dashboard, payment record, checkout intent, order, seller panel, customer account, email, stock, and worker logs.
5. Progress it through Packed and Shipped with a test-safe courier/tracking reference only if the fulfilment owner approves.
6. Execute the approved cancellation/return and live refund path. Do not mark it cancelled/refunded manually.
7. Wait for the signed refund webhook, then reconcile refunded amount, final order/payment state, inventory policy, and customer notification.
8. Record exact references and screenshots without exposing full PII or secrets.

If any reconciliation differs, immediately set `CHECKOUT_ENABLED=False`, stop further transactions, and open the incident record.

## 8. Final GO/NO-GO

Live checkout is **GO** only when every item above is evidenced and the named release commander signs the decision. Otherwise the site launches catalog-only with checkout disabled.

Required final assertions:

- Real admin network access works and public/customer access does not.
- Real successful, failed, invalid-signature, replay, timeout/expiry, and refund paths reconcile.
- Stock is exact and non-negative.
- Seller and customer views match the database without exposing internal notes.
- Production backup restore, health, worker, Beat, email, monitoring, CDN, Razorpay, and Shiprocket gates pass.
- Rollback owners are online for the launch window.

## 9. Rollback and first 24 hours

The fastest commerce rollback is `CHECKOUT_ENABLED=False`; verify the public status endpoint and paused frontend after changing it. Application rollback uses the last known-good Vercel/Render deployments. Never point production directly at an unverified restored database—restore separately, migrate, reconcile, then switch deliberately.

For the first 24 hours, reconcile every Razorpay payment against orders and stock; monitor 5xx/latency, payment verification, webhook lag, queue depth, worker/Beat health, email delivery, Shiprocket failures, seller visibility, and inventory anomalies. Keep the release, payment, fulfilment, database, and support owners reachable.
