# AMZIRA approximate monthly operating budget

Prepared 2026-09-11. INR conversions use approximately ₹95 per US$1, close to the 9 September 2026 USD/INR reference rate.[1]

## Fixed platform budget

| Component | Planning amount |
|---|---:|
| Render production stack currently configured for AMZIRA | about $42 / ₹4,000 per month before usage and tax |
| Vercel Pro for a commercial storefront | $20 / about ₹1,900 per month; Hobby is $0 but is restricted to personal, non-commercial use and has usage caps.[2] |
| Cloudflare DNS/CDN | ₹0 on the Free plan; R2 is usually ₹0 at AMZIRA's current scale if it stays within 10 GB, 1M Class A operations, and 10M Class B operations. Egress is free.[3] |
| Resend transactional email | ₹0 up to 3,000 emails/month and 100/day, or about ₹1,900/month for Pro with 50,000 emails.[4] |
| Shiprocket account plan | ₹199/month Business for 5–50 shipments, or ₹499/month Advanced for 50–200; shipping charges are separate.[5] |

Recommended fixed platform reserve: **₹6,000–₹9,000/month**, excluding taxes and any Render overages. This assumes Vercel Pro, Render production services, a small Cloudflare R2 catalog, and Resend Free or Pro.

## Variable order costs

- Razorpay: about **2% + GST** per successful payment, with no setup or AMC according to its current standard pricing.[6] That is approximately ₹2,360 on ₹1,00,000 of prepaid sales.
- Shiprocket: the published average shipment cost is approximately ₹41 on Business and ₹39 on Advanced, but actual cost varies by weight, zone, COD, RTO, and courier.[5]
- Product cost, packaging, returns/RTO losses, GST, discounts, and refunds are not included above.

## Ads and maintenance scenarios

These are planning estimates, not guaranteed ad results:

| Stage | Ads/month | Maintenance/support/month | Total monthly operating budget* |
|---|---:|---:|---:|
| Careful launch | ₹15,000–₹25,000 | ₹5,000–₹10,000 | ₹26,000–₹44,000 |
| Recommended first growth stage | ₹30,000–₹50,000 | ₹10,000–₹20,000 | ₹46,000–₹79,000 |
| Aggressive growth | ₹75,000–₹1,50,000+ | ₹20,000–₹40,000 | ₹1,01,000–₹1,99,000+ |

\*Includes the recommended ₹6,000–₹9,000 platform reserve, but excludes product inventory and the variable payment/shipping costs.

## Recommendation for AMZIRA

Plan for **₹50,000–₹70,000 per month initially**, plus inventory and fulfillment costs. A practical first-month split is:

- ₹8,000 platform reserve
- ₹25,000–₹35,000 ads
- ₹10,000–₹15,000 maintenance/content/technical support
- ₹5,000–₹10,000 contingency and order-variable reserve

Start ads only after Render is restored, Razorpay passes a controlled test payment/refund, email delivery is verified, and Shiprocket shipment/tracking webhooks pass. Google Ads supports an average daily budget and a monthly limit calculated from that daily budget; start small and review results daily.[7]

### Sources

1. https://www.msei.in/markets/currency/historical-data/rbireferenceratearchives
2. https://vercel.com/pricing and https://vercel.com/docs/plans/hobby
3. https://developers.cloudflare.com/r2/pricing/ and https://www.cloudflare.com/plans/
4. https://resend.com/pricing
5. https://www.shiprocket.in/pricing/
6. https://razorpay.com/pricing/
7. https://support.google.com/google-ads/answer/2375454
