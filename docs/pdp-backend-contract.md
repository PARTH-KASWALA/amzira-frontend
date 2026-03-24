# PDP Backend Contract Enhancements

## Why this is needed
The redesigned PDP now renders SKU, stock urgency, delivery estimate, and related products in a Manyavar-style conversion layout. Existing fields already support most data points, but adding the optional fields below improves fidelity and performance.

## Existing fields currently consumed
- `id`, `slug`, `name`
- `sale_price`, `base_price` (or `price` fallback)
- `images` (or `primary_image` / `image` fallback)
- `variants[]` with `id`, `size`, `color`, `stock_quantity`
- `rating`, `reviews` (count)
- `category` / `subcategory`

## Optional fields to add on `/products/{slug}`
- `sku` (string): canonical customer-facing SKU/style code.
- `delivery_eta_days` (int): default ETA used when pincode lookup is unavailable.
- `low_stock_threshold` (int, default `2`): configurable urgency threshold.
- `reviews_data` (array): lightweight review preview for PDP.
  - `author` (string)
  - `rating` (float 0-5)
  - `comment` (string)
  - `created_at` (ISO datetime)

## Delivery endpoint (new/confirmed)
- `GET /api/v1/delivery/check?pincode=560001`
- Response:
  - `delivery_date` or `estimated_date` or `delivery_days`
  - `cod_available` (bool)
  - `shipping_cost` (number)

## Related products performance
Use one of these:
1. Support `GET /products?category=<slug>&limit=8` efficiently (already used).
2. Or add `GET /products/{slug}/related?limit=4` for stronger relevance.

## DB/index recommendations
- Add index on `products.slug` (unique) if missing.
- Add composite index on `(category_id, is_active)` for related-product queries.
- Add index on `product_variants.product_id` for PDP variant load.

## Caching recommendations
- Cache PDP payload per `slug` for 60-180 seconds.
- Cache delivery zone mapping by pincode prefix (first 3 digits) for 15-60 minutes.
- Return `ETag` / `Last-Modified` headers for product detail responses.
