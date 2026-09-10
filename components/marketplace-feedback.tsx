import Image from "next/image";
import { Camera, ExternalLink, ShieldCheck, Star } from "lucide-react";

type MarketplaceFeedback = {
  marketplace: "Flipkart" | "Myntra";
  seller: string;
  product: string;
  rating: number;
  ratingCount: number;
  observedAt: string;
  listingUrl: string;
  reviews: Array<{
    rating: 4 | 5;
    quote: string;
    date: string;
  }>;
  customerPhotos?: Array<{
    url: string;
    alt: string;
  }>;
};

// These are source-attributed marketplace records, intentionally kept outside
// product data and review JSON-LD. A marketplace listing needs an exact AMZIRA
// SKU match before it can be shown on a specific product detail page.
const marketplaceFeedback: MarketplaceFeedback[] = [
  {
    marketplace: "Flipkart",
    seller: "Pritamfabe",
    product: "Girls' black-and-red lehenga choli",
    rating: 4,
    ratingCount: 59,
    observedAt: "September 10, 2026",
    listingUrl:
      "https://www.flipkart.com/pritam-fab-girls-lehenga-choli-ethnic-wear-solid/p/itme67fa7d633367?pid=KLCHH2EWVGA7PEGH&lid=LSTKLCHH2EWVGA7PEGHMBMGTS",
    reviews: [
      {
        rating: 5,
        quote: "Very nice dress, my daughter looks so cute in this.",
        date: "Shown on source listing"
      },
      {
        rating: 5,
        quote: "Lehenga pattern is very good.",
        date: "Shown on source listing"
      }
    ],
    customerPhotos: [
      {
        url: "https://rukminim2.flixcart.com/blobio/1054/1054/imr/blobio-imr_4c7e3096c25f465c87f10b3ab4854038.jpg?q=80",
        alt: "Verified Flipkart buyer photo showing the black-and-red lehenga choli fabric"
      }
    ]
  },
  {
    marketplace: "Flipkart",
    seller: "Pritamfab Fashion",
    product: "Girls' Lehenga Choli Ethnic Wear Solid Lehenga Choli",
    rating: 3.9,
    ratingCount: 18,
    observedAt: "September 10, 2026",
    listingUrl:
      "https://www.flipkart.com/pritamfab-fashion-girls-lehenga-choli-ethnic-wear-solid/p/itm8f2596fb12654?pid=KLCHHFGSGRBMWUVM&lid=LSTKLCHHFGSGRBMWUVM7GWVFI",
    reviews: [
      {
        rating: 5,
        quote: "WOW nice dress.",
        date: "Shown on source listing"
      },
      {
        rating: 5,
        quote: "Very nice product.",
        date: "4 months ago"
      }
    ],
    customerPhotos: [
      {
        url: "https://rukminim2.flixcart.com/blobio/400/510/imr/blobio-imr_a0d05a607b9641ccad6fcf6d28c81f6d.jpg?q=90",
        alt: "Verified Flipkart buyer photo showing a girl wearing the Pritamfab Fashion lehenga choli"
      },
      {
        url: "https://rukminim2.flixcart.com/blobio/400/510/imr/blobio-imr_d31c4bd7c02b4390a0f127ce289fd350.jpeg?q=90",
        alt: "Verified Flipkart buyer photo for the Pritamfab Fashion lehenga choli"
      },
      {
        url: "https://rukminim2.flixcart.com/blobio/400/510/imr/blobio-imr_5c4aef2ebf404cd8950bab60c2d9bfd8.jpeg?q=90",
        alt: "Second verified Flipkart buyer photo for the Pritamfab Fashion lehenga choli"
      }
    ]
  },
  {
    marketplace: "Myntra",
    seller: "ETHZY",
    product: "Girls' ready-to-wear cotton lehenga choli",
    rating: 3.9,
    ratingCount: 45,
    observedAt: "September 10, 2026",
    listingUrl:
      "https://www.myntra.com/lehenga-choli/ethzy/ethzy-girls-ready-to-wear-cotton-lehenga--choli/42734980/buy",
    reviews: [
      {
        rating: 5,
        quote: "Product quality is good and nice as expected.",
        date: "15 June 2026"
      },
      {
        rating: 5,
        quote: "Love this product quality.",
        date: "26 July 2026"
      }
    ]
  }
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-gold" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star className={`h-4 w-4 ${index < Math.round(rating) ? "fill-current" : "opacity-25"}`} key={index} aria-hidden="true" />
      ))}
    </span>
  );
}

export function MarketplaceFeedbackSection() {
  return (
    <section className="pattern-section marketplace-feedback-section border-y border-maroon/10 py-16 lg:py-24" aria-labelledby="marketplace-feedback-heading">
      <div className="container-page pattern-section__content">
        <div className="max-w-3xl">
          <p className="section-kicker">Marketplace customer feedback</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-maroon-deep sm:text-5xl" id="marketplace-feedback-heading">
            Loved across our seller channels
          </h2>
          <p className="mt-4 text-sm leading-7 text-charcoal/70 sm:text-base">
            We feature seller-channel listings above 3.5 / 5, with the marketplace, rating count, observation date, and original listing kept visible.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {marketplaceFeedback.map((feedback) => (
            <article className="overflow-hidden rounded-xl border border-maroon/10 bg-white shadow-soft" key={`${feedback.marketplace}-${feedback.product}`}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-charcoal/10 bg-maroon-soft/45 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-maroon">{feedback.marketplace} · {feedback.seller}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-maroon-deep">{feedback.product}</h3>
                </div>
                <div className="rounded-lg bg-white px-4 py-3 text-right shadow-sm">
                  <span className="flex items-center justify-end gap-2 text-lg font-bold text-maroon-deep"><RatingStars rating={feedback.rating} /> {feedback.rating.toFixed(1)} / 5</span>
                  <p className="mt-1 text-xs font-semibold text-charcoal/65">from {feedback.ratingCount} {feedback.marketplace === "Myntra" ? "verified buyers" : "ratings"}</p>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_150px]">
                <div>
                  <ul className="space-y-4" aria-label={`Featured ${feedback.marketplace} reviews rated four stars or above`}>
                    {feedback.reviews.map((review, index) => (
                      <li className="border-l-2 border-gold pl-4" key={`${review.date}-${index}`}>
                        <div className="flex items-center gap-2 text-xs font-bold text-maroon">
                          <RatingStars rating={review.rating} />
                          <span>{review.rating}★ featured marketplace review</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-charcoal/75">“{review.quote}”</p>
                        <p className="mt-2 text-xs text-charcoal/55">Verified marketplace buyer · {review.date}</p>
                      </li>
                    ))}
                  </ul>
                  <a className="focus-ring mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-maroon hover:underline" href={feedback.listingUrl} rel="noreferrer" target="_blank">
                    View {feedback.marketplace} source listing <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <p className="mt-3 text-xs leading-5 text-charcoal/55">Observed {feedback.observedAt}. This is source-attributed marketplace feedback, not an AMZIRA verified-purchase review.</p>
                </div>
                {feedback.customerPhotos?.length ? (
                  <figure className="overflow-hidden rounded-lg border border-charcoal/10 bg-sandal/50">
                    <div className={`grid gap-2 p-2 ${feedback.customerPhotos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {feedback.customerPhotos.map((photo) => (
                        <div className="relative aspect-square overflow-hidden rounded-md" key={photo.url}>
                          <Image
                            alt={photo.alt}
                            className="object-cover"
                            fill
                            // Flipkart's review CDN serves these small source images directly,
                            // while Vercel's image optimizer can reject the request on plan limits.
                            sizes={feedback.customerPhotos && feedback.customerPhotos.length > 1 ? "75px" : "150px"}
                            src={photo.url}
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                    <figcaption className="flex items-center gap-2 p-3 text-[11px] font-semibold leading-4 text-charcoal/65">
                      <Camera className="h-3.5 w-3.5 shrink-0 text-maroon" aria-hidden="true" /> Customer review photo
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-charcoal/60">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald" aria-hidden="true" />
          Marketplace feedback is kept separate from AMZIRA product ratings until an exact seller SKU match is recorded.
        </p>
      </div>
    </section>
  );
}
