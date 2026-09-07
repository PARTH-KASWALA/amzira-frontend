# Marketplace review migration register

Last reviewed: 2026-09-07

## Purpose

This register records marketplace listings that may be considered for a
rights-cleared AMZIRA review import. A row is **not eligible to publish** until
all of the following are recorded:

1. the listing is matched to one AMZIRA product or variant;
2. the marketplace account ownership is verified;
3. the platform permits review reuse on AMZIRA; and
4. each review has an appropriate reuse record. Every customer photo needs a
   separate consent record; a photo of a child requires consent from the
   child's parent or legal guardian.

Marketplace review text, reviewer names, and customer media must not be copied
into this file or the storefront before those checks pass.

## Verified seller accounts

| Marketplace | Account | Evidence checked | Status |
| --- | --- | --- | --- |
| Flipkart | Pritamfabe | Seller dashboard visible on 2026-09-07 | Verified account ownership |
| Myntra | ETHZY | Partner portal dashboard visible on 2026-09-07 | Verified account ownership |
| Flipkart | n.b.f fashion | Separate dashboard not visible in the connected Chrome session | Needs verification |

## Candidate queue

Only listings with a screenshot-visible aggregate rating above 3.5 are listed.
The rating is evidence for review selection only, not an AMZIRA claim.

| Source | Marketplace listing ID | Screenshot-visible aggregate | AMZIRA match | Publish status |
| --- | --- | --- | --- | --- |
| Flipkart / Pritamfab | `KLCHHFGSGRBMWUVM` | 3.9 from 18 ratings | Possible red-and-gold AMZIRA style; exact SKU still required | Hold |
| Flipkart / Pritamfab | `KLCHHFJ7JAG9PNMQ` | 3.7 from 23 ratings | Not mapped | Hold |
| Flipkart / Pritamfab | `KLCHMHN3BP9HGSWS` | 4.1 from 10 ratings | Not mapped | Hold |
| Flipkart / Pritamfab | `KLCHH2EWKRHFAVQZ` | 4.0 from 57 ratings | Possible black-and-gold AMZIRA style; exact SKU still required | Hold |
| Myntra / ETHZY | Listing ID not present in supplied screenshot | 3.8 from 42 ratings | Not mapped | Hold |
| Myntra / ETHZY | Listing ID not present in supplied screenshot | 3.8 from 16 ratings | Not mapped | Hold |
| Myntra / ETHZY | Listing ID not present in supplied screenshot | 3.6 from 9 ratings | Not mapped | Hold |

The XEPON Flipkart product is intentionally excluded: it is not a verified
AMZIRA seller account.

## Import procedure

When a row clears the above gates, import it through the admin endpoint with:

- source marketplace and exact source listing URL;
- source review ID and exact AMZIRA product ID;
- marketplace verification flag;
- documented platform reuse authorization;
- moderated review text; and
- media hosted on an AMZIRA-controlled CDN, with the per-media consent
  reference.

The storefront then labels the review as a verified Flipkart or Myntra purchase
and exposes a link to the original source listing. It must never label it as an
AMZIRA verified purchase.
