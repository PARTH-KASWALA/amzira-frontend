# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

AMZIRA primarily serves parents and family members shopping for South Indian occasionwear for girls. They need to identify the right style and size, understand fabric and fit, and complete a trustworthy purchase for weddings, pujas, festivals, and family celebrations.

## Product Purpose

AMZIRA is a customer-facing ecommerce storefront for discovering and buying premium South Indian girls' lehenga choli and pattu pavadai. Success means a shopper can confidently move from collection discovery to a verified order without encountering unavailable inventory, misleading pricing, or dead interactions.

## Positioning

AMZIRA focuses its initial inventory and merchandising on ceremony-aware South Indian girls' occasionwear, pairing traditional visual language with practical fit guidance for growing children.

## Operating Context

- Shoppers browse on mobile and desktop, often under time pressure before a family event.
- Purchase decisions depend on size, comfort, fabric, color, occasion, delivery timing, and return eligibility.
- Women, men, and boys are discovery-only departments until inventory is explicitly enabled.
- FastAPI owns catalog, stock, customer, payment, order, and fulfilment truth.

## Capabilities and Constraints

- The live public category is South Indian girls' lehenga choli and pattu pavadai.
- Existing public category URL: `/category/kids-pattu-pavadai`.
- Women, men, and boys routes lead to premium coming-soon experiences.
- Currency is INR.
- Razorpay is the initial online payment provider.
- Cash on Delivery is not offered until an explicit backend contract exists.
- The frontend uses Next.js App Router and integrates with the local FastAPI API under `/api/v1`.
- Backend-owned values such as price, stock, tax, shipping, discount, and order totals are never trusted from browser calculations.

Open decisions:

- Final backend category slug for the live girls' inventory.
- Final customer-facing relationship between the existing Ethzy marketplace label and AMZIRA: rebrand, `Ethzy by AMZIRA`, or distinct product lines.
- D2C price architecture. The observed Ethzy marketplace assortment is mass-premium, while the current AMZIRA concept uses luxury price points.
- Submission ownership for newsletter, support, appointment, and store inquiry forms.
- Production frontend/API origins and cookie-domain configuration.

## Brand Commitments

- Product name: AMZIRA.
- Preserve the existing AMZIRA logo and wordmark assets.
- Preserve the established ceremony-aware, premium South Indian brand voice.
- The temple-border rule remains the signature graphic device and is used sparingly.
- Customer-facing copy is warm, direct, and specific; it does not fabricate artisan, sustainability, delivery, or product claims.

## Evidence on Hand

- Brand and product photography under `/images`.
- User-confirmed owned inventory is publicly referenced by the Ethzy catalog on Myntra: `https://www.myntra.com/ethzy?rawQuery=ethzy%20`.
- The public catalog snapshot on 2026-08-11 reported 111 products, including 101 lehenga-choli listings, with a visible selling-price range of approximately Rs. 479-Rs. 1,498. Exact stock, SKU, cost, and asset records must come from the seller export before backend import.
- Existing logo assets under `/images/logo`.
- Incumbent design system at `/design-system/amzira/MASTER.md`.
- Frontend production roadmap at `/docs/FRONTEND_PRODUCTION_IMPLEMENTATION_PLAN.md`.
- Backend contract documentation at `/Users/parthkaswala/Desktop/amzira-backend/API_CONTRACT.md`.
- Marketplace ratings can inform product prioritization, but they must not be presented as AMZIRA verified-purchase reviews unless migration and attribution are legally and technically supported.
- No approved external press, customer counts, or commercial performance claims are available and none should be invented.

## Product Principles

1. Show only inventory customers can genuinely buy.
2. Make fit, stock, delivery, and order state easy to understand.
3. Let product imagery and South Indian ceremony context carry the luxury experience.
4. Preserve customer intent and cart state through recoverable failures.
5. Treat accessibility, speed, and payment clarity as part of premium service.

## Accessibility & Inclusion

The storefront targets WCAG 2.1 AA. Core browsing and purchase journeys must support keyboard use, visible focus, reduced motion, screen-reader status announcements, 200% zoom, and minimum 44 by 44 pixel touch targets.
