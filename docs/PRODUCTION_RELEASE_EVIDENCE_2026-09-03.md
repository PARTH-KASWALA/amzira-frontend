# AMZIRA Production Release Evidence — 2026-09-03

## Current decision

The catalog storefront and closed-checkout release are technically healthy.
Live commerce remains **NO-GO** until the external payment, restore, seller,
monitoring, DNS, and commercial-hosting gates below are evidenced.

## Verified in this release window

| Area | Evidence | State |
|---|---|---|
| Frontend | Vercel deployment `dpl_DSD1YdLjeGEdDSmKjGABWXtpsDZg`, commit `b7c3613`, READY | Pass |
| Backend | Render deployment `dep-dachf48ae00c73fb6dfg`, commit `e125f83`, live | Pass |
| Persistent queue store | `amzira-redis-persistent`, Starter, `journal_snapshot`, `noeviction`; wired to API, worker, and Beat | Pass |
| Protected launch verifier | 13 passed, 0 failed; only seller acceptance skipped because credentials were not supplied | Pass with credential gate |
| Backend regression suite | 104 passed, 2 PostgreSQL-only skips locally; `pip-audit` found no known vulnerabilities | Pass with CI-only DB gates |
| Seller browser regression | Chromium seller suite: 6 passed | Pass |
| Invalid webhook handling | Razorpay and Shiprocket invalid signatures both returned HTTP 400 in production | Pass |
| Razorpay test account | Local test-mode order handshake created INR 100 test order; no live charge | Pass |
| Shiprocket test account | Login HTTP 200 and serviceability HTTP 200 with 7 available couriers | Pass |
| Product recommendations | Live product page contains all three recommendation sections | Pass |
| Vercel runtime | No production runtime errors in the selected 24-hour window | Pass |
| API/worker/Beat logs | No error logs after the latest bcrypt-compatible deployments | Pass |

The backend now pins `bcrypt==4.0.1` to avoid the Passlib/bcrypt compatibility
error previously emitted during password operations.

## Remaining launch blockers

1. **Commercial hosting:** the Vercel team still reports the Hobby plan. Upgrade
   to Pro/Enterprise or migrate to a host that permits commercial use.
2. **Real seller acceptance:** sign in from the approved network with the real
   seller credential and verify list, detail, and one safe status/tracking read-
   back against production data.
3. **Production backup/restore:** Render Postgres is available, but the
   connector cannot establish its required TLS session. Create a fresh backup,
   restore it into an isolated database, and reconcile migration head, catalog,
   inventory, and order counts with a recorded checksum.
4. **Razorpay:** the application’s historical production credentials returned
   authentication failure during provider verification. Regenerate valid live
   keys and webhook secret, then run the complete test-mode replay/refund matrix
   and one approved low-value live payment/refund reconciliation.
5. **Shiprocket:** credentials and serviceability are proven in test mode, but a
   real production shipment and signed webhook have not been accepted.
6. **Sentry:** frontend instrumentation is deployed but inert until a real DSN
   is configured; alert delivery and owner acknowledgement are unverified.
7. **Email DNS:** the sending domain is verified and SPF/DKIM activity exists,
   but `_dmarc.amzira.com` has no TXT record.
8. **Ownership:** release, payment/refund, fulfilment, database/restore,
   monitoring, and customer-support owners are not recorded.

## Non-blocking technical debt

- The homepage build reports 50.4 kB route size and 259 kB First Load JS; the
  target budget is not yet defined or enforced in CI.
- No non-essential analytics provider is enabled, so no analytics cookies are
  currently set; an approved provider and consent flow remain future work.
- The old free, non-persistent `amzira-redis` resource remains as an unused
  Render orphan and should be removed manually after confirming no references.

## Activation rule

Keep `CHECKOUT_ENABLED=False` and `COD_ENABLED=False` until every blocker has a
named owner, timestamp, and evidence reference. Never use the historical
Razorpay transactions as proof of this application’s current payment path.
