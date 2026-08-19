# Ethzy to AMZIRA Catalog Migration Plan

Status: Ready for seller export and backend implementation

Prepared: 2026-08-11

## 1. Objective

Turn the user-owned Ethzy marketplace inventory into a clean, accurate, independently merchandised AMZIRA catalog without exposing women, men, or boys inventory. The first production batch should contain 20-30 of the strongest girls' lehenga-choli products. The remaining approved products follow after the first batch passes content, inventory, checkout, and fulfillment acceptance.

Public reference: `https://www.myntra.com/ethzy?rawQuery=ethzy%20`

Observed public snapshot:

- 111 total products.
- 101 lehenga choli, 5 dresses, and 5 ethnic dresses.
- Predominantly ages 12 months through 10 years.
- Visible selling-price range approximately Rs. 479-Rs. 1,498.
- All listed products show India as country of origin.

The public page is useful for planning only. The seller export and original media library are authoritative for import.

## 2. Launch Decisions

1. AMZIRA remains the D2C storefront brand.
2. Ethzy is the owned source-catalog identity until the owner chooses rebrand, `Ethzy by AMZIRA`, or separate-line architecture.
3. Only girls' inventory is public at launch.
4. Women, men, and boys remain `noindex` coming-soon departments.
5. Marketplace titles and descriptions are rewritten for AMZIRA. Do not publish duplicate or typo-filled copy.
6. A product enters a South Indian or pattu-pavadai collection only when its actual material and construction support that claim.
7. Marketplace review totals are not imported as AMZIRA verified-purchase reviews without a compliant source, attribution, and moderation process.

## 3. Required Owner Export

Request these files from the Myntra seller account or inventory system:

- Product master export with marketplace product/style ID, internal product ID, title, category, status, and created/updated timestamps.
- Variant inventory export with seller SKU, marketplace SKU, size, color, available quantity, reserved quantity, and fulfillment channel.
- Pricing export with MRP, current selling price, tax rate, HSN code, cost, and any channel-specific restrictions.
- Attribute export with fabrics, lining, weave/work, closures, sleeve/neck details, included pieces, care, country of origin, age range, and garment measurements.
- Original image archive, ordered per product, with rights confirmed for use on amzira.com.
- Product weight and package dimensions for shipping calculation.
- Seller-side return reasons and product-level quality notes for launch selection. Customer personal data is not required.

## 4. Canonical Import Model

The staging format should use one product row plus one row per real variant. Do not encode stock in comma-separated product fields.

### Product fields

| Field | Required | Notes |
|---|---|---|
| `source_system` | Yes | Fixed value such as `myntra_ethzy` |
| `source_product_id` | Yes | Unique and immutable reconciliation key |
| `internal_style_code` | Yes | Owner's style/product code |
| `amzira_name` | Yes | Rewritten unique customer-facing title |
| `amzira_slug` | Yes | Stable, human-readable, not regenerated on title edits |
| `category_slug` | Yes | Launch value resolves to girls/kids category |
| `collection_tags` | Yes | Evidence-based occasion/style taxonomy |
| `description` | Yes | Unique fit, feel, construction, and included-piece copy |
| `fabric` | Yes | Exact composition where available |
| `lining` | Recommended | Material and coverage |
| `care_instructions` | Yes | Product-specific care |
| `country_of_origin` | Yes | Expected `India`, validated per product |
| `age_min_months` | Yes | Numeric filter input |
| `age_max_months` | Yes | Numeric filter input |
| `mrp` | Yes | Fixed-precision INR |
| `sale_price` | Yes | Fixed-precision INR |
| `tax_rate` | Yes | Derived from authoritative tax data, not guessed |
| `hsn_code` | Yes | Required for invoice/tax handling |
| `cost_price` | Private | Never returned by public APIs |
| `weight_grams` | Yes | Required for fulfillment pricing |
| `package_dimensions_cm` | Yes | Length, width, height |
| `is_featured` | Yes | Initial value from launch selection |
| `publication_status` | Yes | `staged`, `qa`, `active`, `archived` |

### Variant fields

| Field | Required | Notes |
|---|---|---|
| `source_variant_id` | Yes | Immutable source reconciliation key |
| `seller_sku` | Yes | Preserve original; enforce uniqueness |
| `source_product_id` | Yes | Parent relationship |
| `size_label` | Yes | Display value such as `4-5Y` |
| `age_min_months` | Yes | Numeric normalization |
| `age_max_months` | Yes | Numeric normalization |
| `color_name` | Yes | Controlled display value |
| `stock_on_hand` | Yes | Integer from inventory owner |
| `stock_reserved` | Yes | Integer, defaults to zero only when confirmed |
| `stock_available` | Derived | `max(stock_on_hand - stock_reserved, 0)` |
| `price_adjustment` | Yes | Fixed-precision INR, normally zero |
| `is_active` | Yes | Independent from product status |
| `measurements` | Recommended | Waist, blouse/choli, skirt length, and other useful garment measures |

### Image fields

| Field | Required | Notes |
|---|---|---|
| `source_product_id` | Yes | Parent relationship |
| `source_filename` | Yes | Reconciliation and deduplication |
| `amzira_asset_url` | Yes | Owned CDN/R2 URL, not a Myntra hotlink |
| `view_type` | Yes | Front, back, detail, side, or size guide |
| `display_order` | Yes | Stable integer |
| `alt_text` | Yes | Product-specific and factual |
| `checksum` | Yes | Detect duplicates and changed files |

## 5. Backend Changes Required Before Import

1. Replace floating-point catalog money with fixed-precision decimal columns and complete a reviewed migration.
2. Add private source product and source variant identifiers with unique constraints.
3. Add HSN, tax, cost, weight, dimensions, country, age range, lining, included pieces, and structured garment-measurement storage.
4. Add publication workflow values so imports can be staged without becoming public.
5. Add per-variant upsert support using seller SKU or source variant ID.
6. Add a dry-run mode that reports creates, updates, unchanged rows, rejected rows, and missing images without committing.
7. Make the importer idempotent. Re-running the same export must not duplicate products, images, or variants.
8. Validate stock per actual variant. Never create a size/color Cartesian product unless the source explicitly provides every combination.
9. Copy approved original images to AMZIRA-owned storage, validate file type/dimensions, generate optimized derivatives, and store checksums.
10. Produce an immutable import report and reject partial activation when required product facts are missing.

## 6. Launch Selection Score

Rank every candidate from 0-100 and select the best 20-30 for batch one:

| Signal | Weight |
|---|---:|
| Product quality and condition confidence | 20 |
| Available size depth and stock | 20 |
| South Indian ceremony relevance | 15 |
| Marketplace rating and return history | 15 |
| Photography completeness | 10 |
| Margin after D2C fulfillment and returns | 10 |
| Color/occasion diversity contribution | 5 |
| Description and measurement completeness | 5 |

Do not select only the highest-volume look. The batch should cover key ages, colors, price points, and occasions without publishing near-duplicate colorways as separate products when variants are more appropriate.

## 7. Merchandising Rules

- Use `lehenga choli` as the base category when that is the verified construction.
- Use `pattu pavadai` only for products whose fabric, silhouette, and regional design support the term.
- Use `Kanjeevaram-inspired`, `temple border`, `zari`, `silk`, and similar terms only when product facts support them.
- Keep color variants on one canonical product URL when construction is otherwise the same.
- Rewrite malformed marketplace copy such as `Babay`, `Lehanga`, and truncated titles.
- Include exact pieces supplied, closure, lining, fabric, ornamentation, care, size guidance, and delivery eligibility on every PDP.
- Keep price and stock consistent across the PDP, cart, checkout, Merchant Center feed, structured data, and marketplace channel rules.

## 8. Migration Workflow

1. Receive and checksum the owner export and original image archive.
2. Load raw files into a private, immutable staging area.
3. Normalize categories, sizes, colors, prices, and source identifiers.
4. Score products and approve the first 20-30 launch candidates.
5. Rewrite names, descriptions, metadata, alt text, and collection assignments.
6. Upload original assets to AMZIRA-owned storage and generate optimized images.
7. Run import dry-run and resolve every blocking error.
8. Import products as `staged` with frontend fallback disabled in acceptance.
9. Verify list, detail, search, filters, variant stock, cart, checkout, payment, order, invoice, cancellation, return, and sold-out behavior.
10. Activate the approved batch, generate sitemap/feed entries, and request indexing only after production smoke tests pass.
11. Reconcile stock daily at minimum until automated channel synchronization is proven.
12. Import subsequent approved batches and keep stable URLs for products that temporarily sell out.

## 9. Acceptance Criteria

- Every active product has at least one purchasable variant and at least three owned product images unless an approved exception exists.
- Every variant has a unique preserved seller SKU and an exact stock quantity.
- No women, men, or boys product is returned by public catalog APIs.
- Every South Indian collection assignment has supporting product facts.
- Product, cart, checkout, payment, order, and invoice prices agree to the paisa.
- Search, size, color, occasion, price, in-stock, and category filters use normalized data.
- No public product title contains spelling errors, truncation, or duplicate filler copy.
- Product JSON-LD and Merchant Center data match visible price, availability, brand, image, and variant values.
- A repeated import produces zero duplicate records and a clear reconciliation report.
- The initial 20-30 product batch passes the full cross-browser storefront suite with catalog fallback disabled.

## 10. Delivery Estimate

After the complete seller export and original assets are available:

- Data mapping and first-batch selection: 0.5-1 working day.
- Backend schema and safe importer: 2-4 working days.
- Content and image QA for 20-30 products: 1-2 working days.
- End-to-end acceptance and production activation: 1-2 working days.

Expected catalog migration path: **5-9 focused working days**. This runs inside the broader backend, payment, domain, monitoring, and deployment work; it is not a standalone store-launch estimate.
