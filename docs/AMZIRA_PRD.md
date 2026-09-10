# AMZIRA Storefront Product Requirements Document

**Status:** Active launch scope  
**Version:** 1.0  
**Last updated:** 2026-09-01  
**Product:** AMZIRA luxury South Indian ethnic-wear storefront

## 1. Product overview

AMZIRA is a premium ecommerce storefront for South Indian celebration wear. The initial launch focuses on girls' lehenga choli and pattu pavadai for weddings, pujas, festivals, and family celebrations. The experience should combine trustworthy commerce with a refined, ceremony-aware visual identity.

The storefront must allow a customer to discover available styles, understand product details and sizing, save or add products to a cart, authenticate securely, complete Razorpay checkout, and manage or track orders.

## 2. Goals

- Help families discover and confidently purchase girls' South Indian occasionwear.
- Make product quality, fabric, measurements, availability, delivery, and returns understandable before purchase.
- Provide a reliable end-to-end path from catalog discovery to paid order.
- Preserve the AMZIRA premium brand experience across desktop, tablet, and mobile.
- Give automated testing agents enough explicit intent to verify user-visible behavior rather than implementation details.

## 3. Launch scope

### In scope

- Homepage and brand storytelling.
- Kids catalog, girls' lehenga choli, and pattu pavadai collections.
- Search, filtering, sorting, category pages, and product detail pages.
- Variant selection, size guide, gallery, reviews, stock, delivery estimate, wishlist, and cart.
- Account registration, login, logout, password reset, profile, addresses, wishlist, and orders.
- Authenticated Razorpay checkout and payment recovery.
- Order confirmation, order tracking, cancellation, invoice, and eligible return requests.
- FAQ, support, stores, heritage, shipping, returns, privacy, terms, and coming-soon pages.
- SEO metadata, canonical URLs, structured data, responsive behavior, keyboard access, and reduced-motion support.

### Out of scope for launch

- Women, men's, or boys' purchasable inventory. These areas must remain premium coming-soon experiences.
- Admin dashboard, marketplace features, loyalty, referrals, native mobile apps, and multi-currency checkout.
- Cash on Delivery unless a separate backend contract explicitly enables and verifies it.

## 4. Users and primary journeys

### Primary users

- A parent or family member shopping for a girl's wedding or festival outfit.
- A returning customer checking an existing order or requesting a return.
- A gift buyer who needs clear sizing, delivery, and support information.

### Critical journeys

1. Browse the homepage, open Kids, select a collection, filter styles, open a product, choose a valid size, add to cart, sign in, pay, and see order confirmation.
2. Open a product directly from search or a category page, inspect gallery and size chart, and understand price, stock, fabric, care, reviews, delivery, and returns.
3. As a guest, add a product to the local cart, refresh or revisit the cart, then authenticate before checkout.
4. Sign up, receive clear backend validation errors, sign in, reset a forgotten password, and return to the requested destination.
5. As an authenticated customer, view orders, track an order, cancel an eligible order, or submit an eligible return request.
6. Open Women, Men, or Boys and see an intentional coming-soon experience without purchasable inventory.

## 5. Functional requirements

### FR-001: Homepage and navigation

- The homepage must communicate AMZIRA's South Indian luxury positioning and direct customers to live collections.
- The primary navigation must expose Kids as the live shopping department.
- Women, Men, and Boys must route to their corresponding coming-soon experiences and must not expose inventory.
- Utility navigation must provide Search, Wishlist, Stores, Support, Account, and Cart.
- The Kids mega menu must expose Girls' Lehenga Choli, Pattu Pavadai, and their supported style slices.
- Navigation controls must be usable with keyboard and touch targets must be at least 44px.

**Acceptance criteria**

- A customer can reach the live kids catalog in one or two interactions from the homepage.
- Every department link resolves to the intended route.
- No coming-soon department displays a purchasable product grid or Add to cart control.
- The mobile navigation provides equivalent access to all primary destinations.

### FR-002: Catalog and discovery

- The live catalog must show product cards with product name, primary image, price, sale price when applicable, discount, rating, review count, badge, and availability.
- Customers must be able to filter by supported occasion and style/subcategory.
- Customers must be able to sort by supported catalog ordering, including price ascending.
- Applied filters and sorting must be represented in the URL so that a filtered page can be refreshed and shared.
- Empty, unavailable, loading, and recoverable API-error states must be understandable and actionable.
- Product cards must link to the matching product detail route.

**Acceptance criteria**

- Applying an occasion filter updates the results and URL.
- Applying a style/subcategory filter updates the results and URL.
- Applying sorting updates the results and URL.
- A product card always opens the product represented by that card.
- A missing or unavailable category does not expose unrelated inventory.

### FR-003: Product detail page

- The page must show the product name, price, sale price, discount, stock state, description, fabric, care instructions, occasions, rating, review count, images, and available variants.
- Customers must select a valid variant before adding to cart.
- The gallery must support viewing product images and must display a usable primary image even when backend media is unavailable and an approved local asset exists.
- The page must provide a size chart with the relevant garment measurements and a how-to-measure explanation.
- The page must show delivery estimate or serviceability information when the customer provides the required location data.
- Out-of-stock or unavailable variants must not be selectable as if they were purchasable.
- The page must provide wishlist and Add to cart actions with clear success, failure, and duplicate-submission states.

**Acceptance criteria**

- Add to cart is unavailable or blocked until a valid variant is selected.
- After a successful add, the selected product, variant identity, and quantity appear in the cart.
- Product images load with meaningful alt text.
- Size chart can be opened, switched between supported units where available, and closed by Escape.
- Price and stock shown to the customer do not override backend-authoritative values.

### FR-004: Cart

- A guest may add products to a browser-local cart containing product ID, variant ID, and quantity.
- A guest cart must persist across refreshes and remain available when navigating between pages.
- The cart must show product, selected variant, quantity, item price, subtotal, shipping, discount, tax, and total when those values are available from the backend.
- Customers must be able to change quantity or remove an item.
- Authenticated cart mutations must refresh from the backend and treat backend values as authoritative.
- The cart must preserve items through a failed or cancelled payment attempt.
- Checkout must require authentication.

**Acceptance criteria**

- A guest can refresh the cart without losing its items.
- The selected variant is shown, not only the product name.
- Quantity changes and removal are reflected in the cart summary.
- A guest attempting checkout is sent to login with a return destination for checkout.
- An empty cart provides a clear path back to shopping.

### FR-005: Authentication and account

- Customers must be able to register with full name, mobile number, email, and password.
- Customers must be able to sign in and sign out using secure cookie-based sessions.
- Signup, login, forgot-password, and reset-password forms must show field-level and general validation errors returned by the API.
- Password reset must require a valid token and must provide matching-password validation.
- Private account and order pages must not expose customer data to unauthenticated users.
- On successful login, a customer must return to the route requested before authentication when such a route exists.
- The account area must provide profile, addresses, wishlist, order history, order details, and available order actions.

**Acceptance criteria**

- Invalid credentials produce an understandable error without exposing sensitive details.
- Backend field errors identify the affected field.
- An unauthenticated customer sees a sign-in boundary rather than private account data.
- A valid reset token opens a complete new-password form.
- Refreshing an authenticated account page does not require the customer to re-enter credentials when the session remains valid.

### FR-006: Checkout and payment

- Checkout must be available only to an authenticated customer with a valid cart.
- The checkout must allow selecting or creating a delivery address when supported by the backend.
- Before payment, the system must validate cart items, variant availability, address data, coupon data if applicable, and authoritative totals.
- Payment must use the configured Razorpay flow.
- The frontend must never treat client-supplied prices, discounts, tax, shipping, or totals as authoritative.
- A successful payment must be verified by the backend before the order is treated as placed.
- A cancelled, failed, expired, or interrupted payment must return the customer to a recoverable state with the cart preserved.
- The UI must prevent duplicate payment submission.

**Acceptance criteria**

- A guest cannot place an order.
- An invalid or stale cart is revalidated before payment begins.
- A successful verified payment leads to order success with the order reference.
- A payment failure leads to a payment-failure state and does not silently discard the cart.
- The UI does not expose simulated payment controls or unsupported COD controls in the launch experience.

### FR-007: Orders and post-purchase support

- Order success must show a clear confirmation and order reference.
- Customers must be able to track an order using an order reference and/or authenticated account access.
- Order history must show order number, date, items, amounts, payment state, fulfilment state, and available actions.
- Cancellation must be available only when the order is eligible according to backend state.
- Return requests must be available only for eligible delivered orders and within the published return window.
- Invoice access must use the backend-provided order identity and document endpoint.
- Failure, unavailable, and not-found states must explain what the customer can do next.

**Acceptance criteria**

- Tracking a valid order shows current status and progress details.
- Tracking an invalid order shows a useful error rather than a placeholder or fabricated result.
- Ineligible cancellation and return actions are hidden or disabled with an explanation.
- Return submission includes a reason and confirms whether the request was accepted.

### FR-008: Content, support, and coming-soon experiences

- FAQ content must answer common questions about products, sizing, shipping, orders, returns, and support.
- Support must provide email, phone, hours, order-context guidance, and a usable contact path.
- Stores must present available or planned atelier information without implying unsupported services.
- Heritage content must explain AMZIRA's craft and South Indian ceremony positioning.
- Shipping, returns/refunds, privacy, and terms pages must be reachable from the footer and checkout context where appropriate.
- Coming-soon pages for Women, Men, and Boys must feel intentional, premium, and informative while clearly stating that shopping is not yet available.

**Acceptance criteria**

- Footer links resolve without dead ends.
- Policy pages state the applicable customer-facing terms consistently.
- Coming-soon pages do not contain dead Add to cart or checkout actions.

### FR-009: SEO and shareability

- Public homepage, category, product, heritage, and coming-soon pages must have meaningful title and description metadata.
- Product and category pages must have canonical URLs.
- Public product and category content must be crawlable without client-only interaction.
- Product and organization/category structured data must be emitted where applicable.
- Private, transactional, and account pages must not be indexed.
- Sitemap and robots behavior must match the public launch scope.

**Acceptance criteria**

- Each public route has one canonical URL.
- Private routes are marked noindex or otherwise excluded from crawl surfaces.
- Product structured data matches the visible product identity and price state.

### FR-010: Accessibility and responsive behavior

- The storefront must target WCAG 2.1 AA for all critical customer journeys.
- All interactive controls must be keyboard reachable with visible focus.
- Form errors, loading states, success states, dialogs, and dynamic cart updates must be announced appropriately.
- Images must have useful alternative text unless decorative.
- Dialogs must have accessible names, trap focus while open, and close through an explicit control and Escape where appropriate.
- The site must support reduced-motion preferences.
- Layouts must work at 375px, 768px, 1024px, and 1440px widths without horizontal overflow.

**Acceptance criteria**

- No serious or critical automated accessibility violations occur on key public routes.
- Keyboard users can complete catalog selection, add to cart, authentication, and checkout-boundary journeys.
- No tested viewport has unintended horizontal overflow.
- Reduced-motion users are not forced to experience decorative animation.

## 6. Non-functional requirements

### Performance

- Target mobile LCP below 2.5 seconds at the 75th percentile.
- Target INP below 200ms and CLS below 0.1.
- Public catalog requests should target p95 below 500ms from the frontend.
- Non-critical motion, media, and below-the-fold content should be lazy-loaded where practical.
- Images must use responsive dimensions, appropriate loading behavior, and cacheable URLs.

### Security and privacy

- Use secure, credentialed sessions and CSRF protection for authenticated mutations.
- Do not store access or refresh tokens in React state or browser local storage.
- Never expose payment secrets, backend keys, or trusted pricing logic in client code.
- Apply security headers, private-route cache controls, and safe error messages.
- Collect and retain only customer data required for account, fulfilment, support, payments, and legal obligations.

### Reliability

- Every API-backed screen must have loading, empty, recoverable-error, unauthorized, and unavailable states as applicable.
- Mutating actions must be idempotent from the customer's perspective or protected against double submission.
- Backend failures must not silently fall back to demo inventory in production when fallback is disabled.
- Customer cart contents must survive refresh, authentication redirects, payment cancellation, and recoverable errors.

## 7. Business rules

- Girls' lehenga choli and pattu pavadai are the only live commerce categories at launch.
- Women, Men, and Boys are discovery-only until their inventory is intentionally enabled.
- Backend values own stock, prices, tax, shipping, discounts, payment state, and order totals.
- A product is purchasable only when the selected variant is valid and available.
- Checkout requires authentication and successful backend payment verification.
- Ready-to-ship returns follow the published 36-hour window from recorded delivery, subject to the return policy and condition checks.
- Custom, altered, personalised, worn, washed, or otherwise excluded products are not automatically eligible for change-of-mind returns.

## 8. Analytics and operational events

The production implementation should define consent-aware events for:

- `view_homepage`
- `view_category`
- `apply_catalog_filter`
- `view_product`
- `select_product_variant`
- `add_to_cart`
- `remove_from_cart`
- `begin_checkout`
- `payment_started`
- `payment_succeeded`
- `payment_failed`
- `sign_up`
- `sign_in`
- `view_order`
- `track_order`
- `request_return`
- `contact_support`

Events must not include passwords, payment credentials, access tokens, or unnecessary personal data.

## 9. TestSprite execution guidance

TestSprite should treat this document as the product-intent source of truth and verify behavior against the running application.

Priority should be:

1. **Critical:** product detail to cart, authentication boundary, checkout/payment verification, order success, and protection of private data.
2. **High:** catalog filters, variant and size-chart behavior, cart persistence, order tracking, cancellation/returns, and coming-soon inventory protection.
3. **Medium:** search, wishlist, support/content routes, SEO metadata, responsive layouts, and accessibility.

Tests should assert user-visible outcomes and backend-authoritative state. They should not assert React component names, CSS implementation details, local variable names, or a specific internal framework structure.

## 10. Release acceptance checklist

- [ ] Live catalog taxonomy and inventory are deterministic with catalog fallback disabled.
- [ ] Product, cart, authentication, checkout, payment verification, and order fixtures are available for acceptance testing.
- [ ] Razorpay success, cancellation, timeout, and verification-failure paths are tested.
- [ ] Authenticated account and guest cart journeys pass in Chromium, Firefox, and WebKit.
- [ ] No serious or critical accessibility violations remain on key routes.
- [ ] Mobile viewport and horizontal-overflow checks pass.
- [ ] SEO metadata, canonical URLs, robots, sitemap, and structured data are validated.
- [ ] Security headers, cookie settings, CORS, CSRF, and cache controls are validated in the deployed environment.
- [ ] Monitoring, consent management, analytics, backups, and support ownership are configured before public launch.
