export const LIVE_CATEGORY_SLUG = "kids-pattu-pavadai";
export const LIVE_CATEGORY_PATH = `/category/${LIVE_CATEGORY_SLUG}`;

export const comingSoonDepartments = {
  women: {
    name: "Women's collection",
    headline: "A new ceremony wardrobe is taking shape.",
    description:
      "We are carefully developing our women's collection. For now, discover our South Indian lehenga choli edit for girls.",
    image: "/images/occasions/bride.webp",
    imageAlt: "South Indian occasion wear styled for a future women's collection"
  },
  men: {
    name: "Men's collection",
    headline: "The men's ceremony edit is coming soon.",
    description:
      "Our first menswear collection is still being prepared. Until it is ready, the girls' lehenga choli edit remains our focus.",
    image: "/images/occasions/sherwani.webp",
    imageAlt: "South Indian menswear styling for a future men's collection"
  },
  "kids-boys": {
    name: "Boys' collection",
    headline: "Little gentlemen, your edit is next.",
    description:
      "Boys' festive styles are in development. Our current kids collection is created exclusively for girls.",
    image: "/images/footer/heritage-illustration-footer.webp",
    imageAlt: "Illustrated South Indian celebration scene for a future boys' collection"
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
  return slug === LIVE_CATEGORY_SLUG;
}
