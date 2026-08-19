# AMZIRA Frontend Design System

Primary branch: `main`

## Positioning

AMZIRA is a South Indian luxury ethnic wear storefront initially focused on girls' lehenga choli and pattu pavadai for weddings, pujas, festivals, and family celebrations. The frontend should feel premium, ceremony-aware, and commerce-ready without copying established ethnic-wear marketplaces.

## Tokens

- Ivory: `#FDFBF7`
- Sandal: `#F4EFE6`
- Charcoal: `#1A1A1A`
- Deep maroon: `#700018`
- Maroon: `#9A1750`
- Antique gold: `#D4AF37`
- Peacock: `#0B4F6C`
- Emerald: `#1B4D3E`

## Typography

- Display: Cormorant for hero and editorial headings.
- Body: Montserrat for UI, labels, navigation, product metadata, and forms.
- Use generous line height for commerce copy. Avoid negative letter spacing.

## Signature

The signature visual device is the temple-border rule: a restrained gold and maroon woven line used only where it reinforces ceremony, craft, or collection hierarchy.

## UX Rules

- Girls' lehenga choli and pattu pavadai are the only live commerce paths.
- Women, men, and boys lead to premium coming-soon experiences until inventory is enabled.
- Keep all touch targets at least `44px`.
- Use Lucide icons for utility actions.
- Product/category pages must stay crawlable with metadata, canonical URLs, JSON-LD, and readable category copy.
- Old static HTML/CSS/JS is reference material; the production storefront is the Next.js App Router app.
