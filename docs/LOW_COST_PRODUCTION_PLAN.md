# Low-cost first production plan

The goal is a real, safe first launch with predictable monthly spend. This repo is only the storefront; checkout, accounts, orders, inventory, and Razorpay order verification still belong to the backend.

## Recommended starting architecture

1. One small paid VPS for the Next.js frontend, FastAPI backend, and PostgreSQL database.
2. Caddy or Nginx on that server for HTTPS and reverse proxying.
3. Cloudflare DNS/proxy in front of the server.
4. Razorpay for payments, paying transaction fees only when an order succeeds.
5. Daily encrypted PostgreSQL backups copied off the server. Keep at least seven daily copies.

This is the lowest-cost sensible production shape for a small store because it avoids three separately billed services. It has one important trade-off: the server is a single point of failure, so backups must be tested before launch.

## Do not pay for yet

- A second frontend environment or paid preview deployments.
- Redis/Celery unless the backend actually needs background jobs.
- Paid analytics, Sentry, email marketing, chat, or appointment software.
- A separate image CDN while the current catalogue is small.
- Managed databases, load balancers, Kubernetes, or autoscaling.

Use free/basic versions only for development or staging where a cold start or data loss is acceptable. Do not put production orders on an ephemeral free database or a sleeping free web service.

## Required launch checks

- Set `NEXT_PUBLIC_ENABLE_CATALOG_FALLBACK=false`.
- Configure the real API origin, site URL, CORS, cookie domain, and CSRF origin in the backend.
- Confirm Razorpay webhooks and server-side payment verification before accepting live payments.
- Confirm database backups can be restored to a clean database.
- Add a spend alert with the hosting provider and Cloudflare.
- Keep the site in one region close to customers; add replicas only after measured demand.

## Cost order

The fixed costs to budget first are the domain and one small server. Payment gateway charges are variable and should be treated as a percentage of successful sales, not as infrastructure overhead. Media bandwidth is the next likely cost: keep video below the fold, compress product images, and move the media bucket to an egress-free object store only when traffic justifies it.
