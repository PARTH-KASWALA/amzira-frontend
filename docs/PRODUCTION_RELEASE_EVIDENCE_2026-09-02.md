# AMZIRA Production Release Evidence — 2026-09-02

## Decision

- **Catalog/storefront build:** technically GO.
- **Commercial public launch:** NO-GO; the Vercel account reports Hobby, which
  Vercel restricts to personal/non-commercial use.
- **Razorpay checkout:** NO-GO; backend flag verified false.
- **COD checkout:** NO-GO; backend flag verified false.

This record separates verified evidence from checks that still require a human owner, vendor account, secret, paid infrastructure decision, or real transaction. It does not authorize enabling commerce.

## Reviewed release artifacts

| Component | Commit / deployment | Result |
|---|---|---|
| Backend main | `ab9e9b9ff8a757b27be6e8f62396757b39e260e7` | Mandatory PostgreSQL race and enum gates enabled in CI |
| Backend API code | `f14f6b0df0fbbf7a25a76b08a29dd4f844776193` | Render `dep-dabumuajnfac73ec1ivg`, live |
| Backend order migration, worker, and Beat code | `37b337c08117fb0ba544d0b36c7357e7937aa917` | API migration `b0c1d2e3f4a5`; worker `dep-dabugi7avr4c73armet0`; Beat `dep-dabughvavr4c73armdv0`, live |
| Frontend main | `6246d5aff58ced7d946241f94d65b768220039fa` | Vercel `dpl_AYixiaKvtVvLyEsWmkq3PPWg4AFE`, READY and aliased to production domains; seller implementation remains from `4f1c04aff04f9073cd8ef0a48291301c2aa87785` |

CI evidence:

- Backend mandatory PostgreSQL release run: <https://github.com/PARTH-KASWALA/amzira-backend/actions/runs/33614427701> — completed successfully.
- Backend no-store release run: <https://github.com/PARTH-KASWALA/amzira-backend/actions/runs/33613708707> — completed successfully.
- Frontend seller release run: <https://github.com/PARTH-KASWALA/amzira-frontend/actions/runs/33612958655> — completed successfully.

## Automated acceptance evidence

- A clean isolated PostgreSQL database migrated from the first Alembic revision through `b0c1d2e3f4a5`.
- Backend suite: `95 passed, 0 skipped` with both PostgreSQL-only gates enabled.
- The PostgreSQL inventory race launched 20 simultaneous reservations for one final unit; exactly one succeeded and stock ended at zero.
- Seller Playwright suite: `15 passed` across Chromium, Firefox, and WebKit locally.
- Live production seller smoke: `5 passed` in Chromium.
- Storefront Chromium suite: all 28 cases passed with the real local API/database topology.
- Live production public-route/accessibility smoke: `2 passed`.
- Frontend typecheck, lint, optimized build, and high-severity dependency audit passed.
- Backend dependency audit, Bandit, Gitleaks, Trivy, compile, migration-head, and diff checks passed.

## Production runtime evidence

- On 2026-09-03, the privacy-safe production verifier passed all 9 public checks
  and skipped only the deliberately credential-gated protected-health and seller
  groups. Its default acceptance requires checkout and COD to remain disabled.
- `https://api.amzira.com/health` returned HTTP 200 and production healthy status.
- `https://api.amzira.com/api/v1/commerce/status` returned `checkout_enabled=false` and `cod_enabled=false` after every backend deployment.
- Unauthenticated `GET /api/v1/admin/orders` returned 401 without order data.
- Sensitive account/commerce API prefixes return `Cache-Control: private, no-store, max-age=0`, `Pragma: no-cache`, and `Expires: 0`.
- `/seller/login` returned HTTP 200 with private no-store caching and `X-Robots-Tag: noindex, nofollow, noarchive`.
- `robots.txt` disallows `/seller`.
- Allowed-origin CORS preflight for `https://www.amzira.com` succeeded; an untrusted origin was rejected without an allow-origin header.
- The first scheduled expiry cleanup after the order enum migration succeeded; the prior repeating PostgreSQL enum error stopped.
- No API/worker/Beat error or critical log entries were observed after the accepted releases during the verification window.
- A production catalog image returned HTTP 200 from `cdn.amzira.com` with immutable one-year caching and a Cloudflare cache hit.
- `www.amzira.com`, `amzira.com`, `api.amzira.com`, and `cdn.amzira.com` resolved and served over HTTPS.

## Infrastructure and email facts

- The Vercel team API reported plan `hobby` on 2026-09-03. Vercel's Hobby
  [documentation](https://vercel.com/docs/plans/hobby) and
  [terms](https://vercel.com/legal/terms) restrict that plan to
  personal/non-commercial use;
  Pro/Enterprise (or a reviewed commercial-compatible host migration) is a hard
  commercial-launch gate.
- Production PostgreSQL is available on Render `basic_256mb`, PostgreSQL 15, with 15 GB disk autoscaling. High availability and a connection pool are not enabled.
- Production Render Key Value is on the free plan with `persistenceMode=off`. This is a hard blocker for enabling payment-related queue processing; the Blueprint target is Starter with journal/snapshot persistence.
- Email DNS includes a Resend DKIM record and SPF/MX records on `send.amzira.com`. No DMARC record was observed at `_dmarc.amzira.com`; add and verify one before treating transactional email authentication as complete.

## Required external evidence still missing

- Named release, payment, fulfilment, database, monitoring, and support owners.
- Vercel Pro/Enterprise activation or an accepted migration to a host that
  permits commercial use.
- Persistent Render Key Value upgrade and post-upgrade worker/Beat verification.
- Fresh production backup plus an isolated restore with migration, catalog, and order reconciliation.
- Detailed token-protected database, email, queue, and catalog health checks.
- Real seller login from the approved `ADMIN_ALLOWED_IPS` network and a real production-data list/detail/update check.
- Resend inbox delivery with SPF, DKIM, and DMARC results; Sentry controlled alert delivery.
- Shiprocket credential, serviceability, shipment, and signed-webhook acceptance.
- Razorpay test-mode successful, failed, invalid-signature, replay, expiry, cancellation, partial/full refund, and refund-webhook reconciliation.
- One controlled low-value live payment and refund after every earlier gate passes.

## Activation rule

Do not set `CHECKOUT_ENABLED=True` or `COD_ENABLED=True` until every required external item above has an owner, timestamp, and evidence reference. Any failed reconciliation returns the site to commerce-closed mode immediately.
