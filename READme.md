# AMZIRA Frontend

Production storefront is currently the static HTML/CSS/JS experience in the project root (`index.html`, `men.html`, `women.html`, `kids.html`, checkout/account pages, and `js/*.js`).

## Runtime
- Primary (launch path): static pages served by any web server/CDN
- Secondary (WIP/prototype): Next.js files under `/app` with config files in root

## Launch Catalog (Soft Launch)
- Men: 1 product each for Wedding, Reception, Engagement
- Women: 1 product each for Wedding, Reception
- Kids: 1 Festive product + 1 product for each available kids subcategory

## Notes
- `.env*` is gitignored in this repository.
- API base URL is resolved at runtime in `js/api.js` (`localhost`/staging/production).
