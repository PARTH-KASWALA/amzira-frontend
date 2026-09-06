import {
  GIRLS_LEHENGA_CATEGORY_SLUG,
  LIVE_CATEGORY_SLUG,
  PATTU_PAVADAI_CATEGORY_SLUG
} from "@/lib/storefront";

export type CollectionLandingPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  categorySlug: string;
  subcategory?: string;
  occasion?: string;
  supportingHeading: string;
  supportingParagraphs: string[];
};

export const collectionLandingPages: CollectionLandingPage[] = [
  {
    slug: "girls-pattu-pavadai",
    title: "Girls’ Pattu Pavadai for Weddings & Festivals",
    description:
      "Shop girls’ pattu pavadai with South Indian borders, zari details, and age-led fits for weddings, Pongal, puja, and family celebrations.",
    intro:
      "Discover pattu pavadai sets designed for the moments families photograph, celebrate, and remember. Filter by age, size, and ceremony-ready style before choosing her look.",
    categorySlug: PATTU_PAVADAI_CATEGORY_SLUG,
    subcategory: "classic-pattu-pavadai",
    supportingHeading: "A classic South Indian celebration edit",
    supportingParagraphs: [
      "AMZIRA’s girls’ pattu pavadai edit brings together traditional skirt-and-choli silhouettes, festive zari work, and comfortable proportions for growing children.",
      "Check the product page for the available age band, garment measurements, fabric notes, delivery estimate, and return eligibility before ordering."
    ]
  },
  {
    slug: "south-indian-girls-lehenga-choli",
    title: "South Indian Girls’ Lehenga Choli",
    description:
      "Explore South Indian girls’ lehenga choli in temple borders, festive silk textures, peacock work, and celebration-ready colors at AMZIRA.",
    intro:
      "Shop the complete South Indian girls’ lehenga choli edit for temple ceremonies, birthdays, weddings, festivals, and family gatherings.",
    categorySlug: GIRLS_LEHENGA_CATEGORY_SLUG,
    supportingHeading: "Find her ceremony silhouette",
    supportingParagraphs: [
      "From temple-border lehengas to festive silk-inspired sets, each style is organized around the color, finish, occasion, and age range families actually shop for.",
      "Use the size guide alongside each product’s available variants so the outfit feels special and comfortable throughout the celebration."
    ]
  },
  {
    slug: "wedding-outfits-for-girls",
    title: "Wedding Outfits for Girls",
    description:
      "Shop wedding lehenga choli and pattu pavadai for girls with South Indian temple borders, zari work, and celebration-ready fits.",
    intro:
      "Choose a wedding outfit for her next muhurtham, reception, family ceremony, or wedding guest moment with clear size and delivery guidance.",
    categorySlug: LIVE_CATEGORY_SLUG,
    occasion: "wedding",
    supportingHeading: "Wedding-ready details parents can shop confidently",
    supportingParagraphs: [
      "Wedding dressing should look ceremonial without making movement difficult. Explore ready-to-wear styles with clearly listed sizes, fabric notes, and occasion details.",
      "Before adding to cart, review the garment measurements, dispatch information, pincode delivery estimate, and return policy shown on the product page."
    ]
  },
  {
    slug: "pongal-pattu-pavadai",
    title: "Pongal Pattu Pavadai for Girls",
    description:
      "Find Pongal-ready pattu pavadai for girls with festive colors, gold zari details, and South Indian celebration styling from AMZIRA.",
    intro:
      "Dress her for Pongal celebrations, family visits, temple mornings, and festive photographs with a bright South Indian pattu pavadai edit.",
    categorySlug: PATTU_PAVADAI_CATEGORY_SLUG,
    subcategory: "gold-zari-pattu-pavadai",
    occasion: "festival",
    supportingHeading: "Festive color and traditional shine",
    supportingParagraphs: [
      "Pongal dressing is about color, movement, and a sense of occasion. This edit focuses on festive pattu pavadai silhouettes with gold zari and family-celebration appeal.",
      "Festival availability can change quickly, so confirm the live size stock and dispatch estimate before ordering."
    ]
  },
  {
    slug: "navratri-girls-lehenga",
    title: "Navratri Lehenga Choli for Girls",
    description:
      "Shop Navratri lehenga choli for girls in festive silk textures, bright colors, zari details, and comfortable age-led sizes.",
    intro:
      "Explore festive lehenga choli styles for Navratri gatherings, garba evenings, puja, and family celebrations.",
    categorySlug: GIRLS_LEHENGA_CATEGORY_SLUG,
    subcategory: "festive-silk-lehenga-choli",
    occasion: "festival",
    supportingHeading: "Made for movement and festive photographs",
    supportingParagraphs: [
      "A girls’ Navratri outfit should feel joyful, easy to move in, and distinctive in photographs. Browse by color, age band, and available size before choosing her style.",
      "Product pages include the details parents need to compare fabric, lining, pieces included, delivery, and exchange eligibility."
    ]
  },
  {
    slug: "puja-outfits-for-girls",
    title: "Puja Outfits for Girls",
    description:
      "Shop comfortable South Indian puja outfits for girls, including pattu pavadai and lehenga choli with traditional borders and festive details.",
    intro:
      "Find a graceful puja outfit for girls with traditional color, comfortable fit guidance, and clear delivery information for the family occasion.",
    categorySlug: LIVE_CATEGORY_SLUG,
    subcategory: "classic-pattu-pavadai",
    occasion: "temple-ceremony",
    supportingHeading: "A graceful edit for temple and family ceremonies",
    supportingParagraphs: [
      "AMZIRA’s puja edit brings together South Indian girls’ occasionwear for temple visits, house pujas, naming ceremonies, and intimate family gatherings.",
      "Use the age and size recommendation on each product page to choose a comfortable fit for a full ceremony day."
    ]
  }
];

export function getCollectionLandingPage(slug: string) {
  return collectionLandingPages.find((page) => page.slug === slug) || null;
}
