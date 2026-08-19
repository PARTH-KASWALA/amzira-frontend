export const LIVE_CATEGORY_SLUG = "kids-pattu-pavadai";
export const LIVE_CATEGORY_PATH = `/category/${LIVE_CATEGORY_SLUG}`;
export const LIVE_CATEGORY_API_SLUG = process.env.NEXT_PUBLIC_LIVE_CATEGORY_API_SLUG || "kids";
export const GIRLS_LEHENGA_CATEGORY_SLUG = "girls-lehenga-choli";
export const PATTU_PAVADAI_CATEGORY_SLUG = "pattu-pavadai";
export const GIRLS_LEHENGA_CATEGORY_PATH = `/category/${GIRLS_LEHENGA_CATEGORY_SLUG}`;
export const PATTU_PAVADAI_CATEGORY_PATH = `/category/${PATTU_PAVADAI_CATEGORY_SLUG}`;

const CATEGORY_SUBCATEGORY_SLUGS: Record<string, string[]> = {
  [GIRLS_LEHENGA_CATEGORY_SLUG]: [
    "south-indian-lehenga-choli",
    "temple-peacock-work-lehenga",
    "koti-jacket-lehenga-sets",
    "festive-silk-lehenga-choli"
  ],
  [PATTU_PAVADAI_CATEGORY_SLUG]: [
    "classic-pattu-pavadai",
    "peacock-elephant-pattu-pavadai",
    "gold-zari-pattu-pavadai"
  ]
};

const LIVE_CHILD_CATEGORY_SLUGS = new Set([
  GIRLS_LEHENGA_CATEGORY_SLUG,
  PATTU_PAVADAI_CATEGORY_SLUG
]);

export const comingSoonDepartments = {
  women: {
    name: "Women's collection",
    headline: "A new ceremony wardrobe is taking shape.",
    description:
      "We are carefully developing our women's collection. For now, discover our South Indian lehenga choli edit for girls.",
    image: "/images/coming-soon/women-ceremony-hero.webp",
    imageAlt: "Woman wearing a deep rose and gold South Indian lehenga in a heritage courtyard"
  },
  men: {
    name: "Men's collection",
    headline: "The men's ceremony edit is coming soon.",
    description:
      "Our first menswear collection is still being prepared. Until it is ready, the girls' lehenga choli edit remains our focus.",
    image: "/images/coming-soon/men-ceremony-hero.webp",
    imageAlt: "Man wearing an ivory and antique-gold sherwani in a South Indian temple mandapam"
  },
  "kids-boys": {
    name: "Boys' collection",
    headline: "Little gentlemen, your edit is next.",
    description:
      "Boys' festive styles are in development. Our current kids collection is created exclusively for girls.",
    image: "/images/coming-soon/boys-ceremony-hero.webp",
    imageAlt: "Young boy wearing an ivory and emerald South Indian ceremony outfit in a temple courtyard"
  }
} as const;

export type ComingSoonDepartment = keyof typeof comingSoonDepartments;

export const unavailableCategoryDepartments: Record<string, ComingSoonDepartment> = {
  "bridal-lehenga": "women",
  "kanjeevaram-lehenga": "women",
  "half-saree": "women",
  "tissue-organza": "women"
};

export function comingSoonPath(department: ComingSoonDepartment) {
  return `/coming-soon/${department}`;
}

export function isLiveCategory(slug: string) {
  return slug === LIVE_CATEGORY_SLUG || slug === LIVE_CATEGORY_API_SLUG || LIVE_CHILD_CATEGORY_SLUGS.has(slug);
}

export function publicCategorySlug(slug: string) {
  return slug === LIVE_CATEGORY_API_SLUG ? LIVE_CATEGORY_SLUG : slug;
}

export function apiCategorySlug(slug: string) {
  return slug === LIVE_CATEGORY_SLUG || LIVE_CHILD_CATEGORY_SLUGS.has(slug) ? LIVE_CATEGORY_API_SLUG : slug;
}

export function categorySubcategorySlugs(slug: string) {
  return CATEGORY_SUBCATEGORY_SLUGS[slug] || [];
}
