# AMZIRA Production Launch & Category Growth Audit

Audit date: 10 September 2026  
Repositories reviewed: `/Users/parthkaswala/Desktop/amzira-frontend` and `/Users/parthkaswala/Desktop/amzira-backend`  
Live storefront reviewed: [www.amzira.com](https://www.amzira.com/)

## Executive decision

AMZIRA is **not ready for a safe public commerce launch yet**. The catalog and most customer journeys are substantially implemented, but the live payment path is currently broken: a signed-in customer can validate stock and delivery, then the server fails while creating the Razorpay order.

The percentages below measure launch readiness—not lines of code:

| Area | Code / feature completion | Production-launch readiness | Assessment |
|---|---:|---:|---|
| Frontend | **~90%** | **~68%** | Strong storefront, catalog, account, seller, SEO, and checkout UI; live payment failure and release instrumentation remain |
| Backend | **~94%** | **~65–70%** | Strong commerce and safety implementation; provider, fulfilment, restore, monitoring, and ownership evidence remain |
| End-to-end launch | — | **NO-GO** | Do not scale paid traffic or announce live ordering until payment and operational acceptance pass |

These estimates are based on the existing frontend and backend readiness documents, current source inspection, automated checks, and live verification. They are not a claim that 90% of individual source lines are complete.

## Evidence collected

### Repository checks

- Frontend `npm run typecheck`: passed.
- Frontend `npm run lint`: passed.
- Frontend production build: passed; `/checkout` remains a dynamic route.
- Frontend `npm audit --audit-level=high`: 0 vulnerabilities.
- Backend `pytest -q`: **110 passed, 2 skipped**.
- Backend `pip-audit`: no known vulnerabilities.
- Backend `compileall`: passed.
- The full local Playwright storefront command was started but stalled while waiting on the local API-backed dev-server flow; it is not counted as a fresh pass in this audit.
- Existing automated launch evidence covers inventory locking, idempotency, refunds, returns, authentication, seller authorization, webhooks, migrations, and product/catalog behavior.

### Live production checks

- [AMZIRA homepage](https://www.amzira.com/), [kids category](https://www.amzira.com/category/kids-pattu-pavadai), [product page](https://www.amzira.com/product/neela-gold-lehenga-choli), and [checkout](https://www.amzira.com/checkout) render successfully.
- `https://api.amzira.com/health` reports a healthy production API.
- Commerce status is currently `checkout_enabled: true`, `cod_enabled: false`.
- The live kids catalog contains **107 styles**; the sitemap contains **128 URLs**, including **107 product URLs**.
- Marketplace sorting returns three explicitly attributed sales-signal products. This is useful merchandising evidence, but it is not a substitute for AMZIRA first-party customer reviews.
- Production security headers include CSP, HSTS, frame denial, content-type protection, restrictive permissions policy, and a strict referrer policy.
- `amzira.com` redirects to `www.amzira.com`, which is a clean canonical host choice.
- `_dmarc.amzira.com` currently has no TXT record in the audited DNS response; email authentication should be completed before launch.

## Razorpay failure diagnosis

### What was reproduced

On the live checkout page, I clicked **PAY SECURELY** using the existing signed-in checkout session. The UI changed to **CHECKING STOCK AND DELIVERY...**, then returned **Unable to create Razorpay order**. No Razorpay payment modal opened.

This isolates the failure to the server-side payment-order step, after checkout validation and before payment authorization. It is not caused by the pay button styling or by the checkout background change.

### Why it happens

The frontend calls validation first and then calls `/create-payment-order`. The backend reaches `razorpay_client.order.create(...)` in `app/api/v1/commerce_checkout.py`. Any provider exception is caught and converted to the generic production message `Unable to create Razorpay order`, so the browser intentionally does not expose the provider's detailed error.

The highest-probability cause is a **Razorpay production key/secret problem**: invalid key, key/secret pair from different accounts or modes, revoked credentials, or an account/API permission issue. The previous release evidence also records a Razorpay authentication failure, while the current live checkout flag is enabled. The exact provider reason cannot be proven from the public browser alone; it must be confirmed in Render API logs at the failed request timestamp.

### Required fix order

1. Keep `CHECKOUT_ENABLED=false` until the payment path is repaired; the repository default is already false, but production currently differs from that default.
2. In Razorpay, generate a fresh **live** key ID and secret from the same account, and create/confirm a separate webhook secret.
3. Update only the Render API/worker/Beat secret references; never place the secret in frontend variables or source control.
4. Redeploy the API and inspect the structured `create_razorpay_order_failed` log for one controlled test request.
5. Run a staging/test-mode matrix: success, failed payment, invalid signature, duplicate callback/webhook, timeout/expiry, cancellation, partial refund, full refund, and replay.
6. Perform one approved low-value live payment and refund, reconciling Razorpay, the database, inventory, seller panel, email, and customer order history.
7. Only then re-enable checkout and re-run the public launch verifier.

Relevant source: [Razorpay client initialization](</Users/parthkaswala/Desktop/amzira-backend/app/services/payment_service.py:32>), [payment-order provider call and error handling](</Users/parthkaswala/Desktop/amzira-backend/app/api/v1/commerce_checkout.py:377>), and [frontend checkout sequence](</Users/parthkaswala/Desktop/amzira-frontend/components/checkout-form.tsx:112>).

## What is already strong

- Focused initial positioning around South Indian girls' lehenga choli and pattu pavadai.
- Live catalog has real age/size filters, occasion/style slices, product galleries, quick view, delivery pincode checking, and structured product information.
- Checkout totals, tax, shipping, stock, and payment identity remain backend-authoritative.
- Inventory reservations, payment verification, webhook idempotency, refunds, returns, order tracking, seller authorization, and no-store private routes are covered in backend tests.
- The storefront clearly separates marketplace feedback from AMZIRA verified-purchase reviews. This is legally and reputationally safer than presenting marketplace ratings as owned reviews.
- SEO foundations are good: crawlable collection/product pages, sitemap, robots exclusions for private routes, product structured data, internal links, and descriptive titles.

## Highest-impact improvements to become a category leader

### P0 — Remove the purchase blocker

Fix Razorpay and complete one reconciled live payment/refund before spending on acquisition. A beautiful catalog cannot become a best seller if the first high-intent customer cannot pay.

### P0 — Build first-party proof, not only marketplace proof

The live product page currently says the first verified AMZIRA review for the selection will appear. Competitors use owned social proof prominently: BownBee states 4.7/5 from 1,924 reviews, while Mylini displays 12,000+ families, 500+ designs, a 4.9 average, and multiple verified-buyer testimonials. These are competitor self-reported claims, but they show the trust signals shoppers are trained to look for. [BownBee](https://www.bownbee.com/) · [Mylini](https://www.mylini.com/)

Implement a post-delivery review request by email/WhatsApp, verified-purchase badge, fit feedback, customer photos with consent, and product-level review counts. Keep the existing marketplace attribution rules; do not convert marketplace reviews into AMZIRA reviews.

### P0 — Make the material promise exact per SKU

The site uses strong “South Indian silk” and “Pure Handcrafted South Indian Silk & Zari” messaging, while a live product is described as **Satin Jacquard** and the catalog includes **Art Silk Jacquard**. That can create a trust gap if shoppers interpret “silk” as pure silk. Use precise per-product labels such as “Art Silk Jacquard” or create a separately verified pure-silk collection. Accurate material, lining, weight, transparency, and care details will improve conversion and reduce returns.

### P1 — Turn fit confidence into the main differentiator

AMZIRA already has age-based variants, size charts, measurements, and a pincode delivery check. Move the fit promise higher on product pages: show the child's height/waist measurement input, recommended size, garment measurements beside the size selector, lining/itch comfort, closure/adjustability, and a clear exchange decision tree. Size uncertainty is especially important in kidswear because children grow quickly and ethnic garments are structured. A category size guide also notes that Indian sizes vary by brand and recommends checking both the size chart and return policy. [Shubhamay kids size guide](https://shubhamay.com/blogs/kids-wear/kids-ethnic-wear-size-guide-by-age)

### P1 — Improve shipping and returns clarity

Show delivery ETA and serviceability before cart, state the exact return/exchange eligibility beside the price, and clarify whether the 36-hour window is a return request window or a pickup window. Marketplace shoppers already expect pincode ETA, payment options, and visible returns; a current Myntra product page exposes size-wise stock, pincode delivery, 7-day returns, and detailed material/specification information. [Myntra product example](https://www.myntra.com/Lehenga-Choli/STANWELLS%2BKIDS/STANWELLS-KIDS-Girls-Ready-to-Wear-Lehenga-/39285393/buy)

### P1 — Expand discoverability without diluting the niche

AMZIRA has 107 styles and useful internal category slices. Pattupavadai.com exposes 218 products, color/price/availability filters, size ranges from infant to teen, reviews, FAQs, wholesale, and content links. BownBee extends from newborn to 15 years and creates occasion, age, gender, and price landing pages. [Pattupavadai collection](https://pattupavadai.com/collections/pattu-pavadai) · [BownBee category architecture](https://www.bownbee.com/)

Prioritize landing pages that match high-intent searches: `pattu pavadai for 1-2 year girls`, `South Indian wedding dress for girls`, `Pongal/Navratri kids silk dress`, `girls lehenga under ₹1,500`, `temple border lehenga`, and `sibling/family ceremony edits`. Keep only pages backed by actual inventory and unique copy.

### P1 — Add retention that works

The current footer primarily offers email links. Mylini places WhatsApp updates directly into its shopping journey, while Pattupavadai.com exposes email subscription and customer-care/wholesale links. Add a consented WhatsApp/email capture with a working backend endpoint, a welcome offer or size guide, browse/cart recovery, post-purchase review request, and festival collection drops. [Mylini retention pattern](https://www.mylini.com/) · [Pattupavadai customer-care and subscription pattern](https://pattupavadai.com/collections/pattu-pavadai)

### P2 — Operational and growth discipline

- Configure Sentry/alert ownership, DMARC, backup restore evidence, Shiprocket production webhook acceptance, and named launch owners.
- Define a mobile Lighthouse/Core Web Vitals budget and monitor checkout error rate, payment success rate, add-to-cart rate, size-selection rate, and return reasons.
- Use marketplace signals to choose what to restock and feature, but label them as signals until AMZIRA has enough first-party orders.
- Add bundles such as sibling sets, choli-plus-accessory pairings, and “complete the ceremony look” recommendations only after payment and fulfilment are reliable.

## 30-day priority sequence

1. **Days 1–3:** disable or keep checkout locked, rotate/verify Razorpay credentials, confirm Render logs, and repair the order-creation path.
2. **Days 4–7:** complete test-mode payment/refund/replay acceptance and one controlled live reconciliation; verify Shiprocket and email delivery.
3. **Week 2:** correct fabric/material claims per SKU; upgrade size/fit content and returns clarity; publish the first verified-purchase review workflow.
4. **Week 3:** launch high-intent SEO collection pages, WhatsApp/email consent capture, and post-delivery review/UGC requests.
5. **Week 4:** restock and advertise only the best-converting, best-reviewed styles; measure conversion by product, age band, source, and occasion.

## Final launch status

**Catalog launch:** technically strong, but validate commercial hosting, monitoring, email DNS, and ownership gates.  
**Live commerce launch:** **NO-GO** until Razorpay order creation, payment/refund reconciliation, fulfilment webhooks, backup restore, and launch ownership are evidenced.  
**Best-seller opportunity:** strong visual and niche foundation; the fastest path to leadership is payment reliability + first-party trust + unbeatable fit confidence + focused occasion SEO.
