export type Category = {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId?: number | null;
  displayOrder: number;
};

export type ProductVariant = {
  id: string | number;
  size: string;
  color?: string | null;
  sku?: string;
  stockQuantity: number;
  additionalPrice?: number;
};

export type Product = {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  basePrice: number;
  salePrice: number;
  discountPercentage: number;
  primaryImage: string;
  images: string[];
  fabric?: string | null;
  careInstructions?: string | null;
  occasions: string[];
  variants: ProductVariant[];
  avgRating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

const localImage = (path: string) => `/images/${path}`;

export const fallbackCategories: Category[] = [
  {
    id: "kids-pattu-pavadai",
    name: "South Indian Kids Lehenga Choli",
    slug: "kids-pattu-pavadai",
    description:
      "Silk lehenga choli and pattu pavadai sets for girls, designed for weddings, pujas, festivals, and comfortable celebration days.",
    imageUrl: localImage("hero-upgrade/green-kids-lehenga-front.webp"),
    displayOrder: 1
  }
];

export const fallbackProducts: Product[] = [
  {
    id: "sil-001",
    name: "Meenakshi Temple Border Kanjeevaram Half Saree",
    slug: "meenakshi-temple-border-kanjeevaram-half-saree",
    description:
      "Pure mulberry silk langa voni with a magenta skirt, contrast tissue drape, temple korvai border, and embroidered raw silk blouse.",
    categorySlug: "half-saree",
    categoryName: "Traditional Half Sarees",
    basePrice: 32999,
    salePrice: 24999,
    discountPercentage: 24,
    primaryImage: localImage("occasions/lehenga.webp"),
    images: [
      localImage("occasions/lehenga.webp"),
      localImage("occasions/team-bride.webp"),
      localImage("occasions/bride_side.webp")
    ],
    fabric: "Pure Kanjeevaram Silk",
    careInstructions: "Dry clean only. Store folded in muslin away from direct sunlight.",
    occasions: ["Half Saree Function", "Wedding", "Festival"],
    variants: ["Unstitched", "S", "M", "L", "XL", "Custom"].map((size, index) => ({
      id: `sil-001-${index}`,
      size,
      color: "Kanjivaram Magenta",
      stockQuantity: index === 5 ? 2 : 6
    })),
    avgRating: 4.9,
    reviewCount: 128,
    inStock: true,
    badge: "Bestseller"
  },
  {
    id: "sil-002",
    name: "Rukumani Tissue Silk Shimmering Langa Voni",
    slug: "rukumani-tissue-silk-shimmering-langa-voni",
    description:
      "Golden tissue silk langa voni with organza drape, gota patti highlights, and soft celebratory movement for sangeet or reception.",
    categorySlug: "tissue-organza",
    categoryName: "Tissue & Organza",
    basePrice: 22999,
    salePrice: 18499,
    discountPercentage: 19,
    primaryImage: localImage("occasions/reception.webp"),
    images: [localImage("occasions/reception.webp"), localImage("occasions/sangeet.webp")],
    fabric: "Golden Tissue Silk & Organza",
    careInstructions: "Dry clean. Steam lightly from inside lining.",
    occasions: ["Engagement", "Sangeet", "Reception"],
    variants: ["Unstitched", "S", "M", "L", "XL"].map((size, index) => ({
      id: `sil-002-${index}`,
      size,
      color: "Sun Gold",
      stockQuantity: 5
    })),
    avgRating: 4.8,
    reviewCount: 94,
    inStock: true,
    badge: "Trending"
  },
  {
    id: "sil-003",
    name: "Valli Royal Red Kanjivaram Bridal Pattu Lehenga",
    slug: "valli-royal-red-kanjivaram-bridal-pattu-lehenga",
    description:
      "A ceremonial bridal lehenga choli woven with heavy Kanjivaram silk, antique gold zardozi, peacock motifs, and maggam-work blouse detail.",
    categorySlug: "bridal-lehenga",
    categoryName: "Bridal Pattu Lehengas",
    basePrice: 59999,
    salePrice: 45999,
    discountPercentage: 23,
    primaryImage: localImage("occasions/bride.webp"),
    images: [localImage("occasions/bride.webp"), localImage("occasions/bride_side.webp"), localImage("occasions/wedding.webp")],
    fabric: "Heavy Kanjeevaram Mulberry Silk",
    careInstructions: "Dry clean only. Air after each wear before storage.",
    occasions: ["Muhurtham", "Wedding", "Bridal"],
    variants: ["Unstitched", "S", "M", "L", "XL", "Custom"].map((size, index) => ({
      id: `sil-003-${index}`,
      size,
      color: "Bridal Crimson",
      stockQuantity: index === 5 ? 1 : 4
    })),
    avgRating: 5,
    reviewCount: 156,
    inStock: true,
    badge: "Bridal Choice"
  },
  {
    id: "sil-004",
    name: "Kamala Emerald & Turmeric Brocade Langa Voni",
    slug: "kamala-emerald-turmeric-brocade-langa-voni",
    description:
      "Emerald skirt with turmeric-gold brocade, contrast voni, and jacquard texture for mehendi, puja, and festive family functions.",
    categorySlug: "half-saree",
    categoryName: "Traditional Half Sarees",
    basePrice: 19999,
    salePrice: 15999,
    discountPercentage: 20,
    primaryImage: localImage("occasions/mehendi.webp"),
    images: [localImage("occasions/mehendi.webp"), localImage("occasions/haldi.webp")],
    fabric: "Chanderi Silk & Brocade",
    occasions: ["Mehendi", "Festival", "Puja"],
    variants: ["S", "M", "L", "XL"].map((size, index) => ({
      id: `sil-004-${index}`,
      size,
      color: "Emerald Green",
      stockQuantity: 7
    })),
    avgRating: 4.7,
    reviewCount: 62,
    inStock: true,
    badge: "Popular"
  },
  {
    id: "sil-005",
    name: "Subhadra Handloom Kanchipuram Silk Lehenga",
    slug: "subhadra-handloom-kanchipuram-silk-lehenga",
    description:
      "Handloom Kanchipuram lehenga with annam motifs, antique zari, and soft lining for reception and festive celebrations.",
    categorySlug: "kanjeevaram-lehenga",
    categoryName: "Kanjeevaram Silk Lehengas",
    basePrice: 34999,
    salePrice: 28999,
    discountPercentage: 17,
    primaryImage: localImage("occasions/lehenga.webp"),
    images: [localImage("occasions/lehenga.webp")],
    fabric: "Pure Kanchipuram Silk",
    occasions: ["Reception", "Festival", "Wedding Guest"],
    variants: ["Unstitched", "S", "M", "L", "XL"].map((size, index) => ({
      id: `sil-005-${index}`,
      size,
      color: "Royal Violet",
      stockQuantity: 5
    })),
    avgRating: 4.9,
    reviewCount: 87,
    inStock: true,
    badge: "Handloom"
  },
  {
    id: "sil-006",
    name: "Sri Valli Temple Border Girls Lehenga Choli",
    slug: "sri-valli-girls-traditional-pattu-pavadai",
    description:
      "A girls' South Indian lehenga choli set with soft cotton-silk lining and a festive zari border for weddings, pujas, and celebrations.",
    categorySlug: "kids-pattu-pavadai",
    categoryName: "South Indian Kids Lehenga Choli",
    basePrice: 7999,
    salePrice: 6499,
    discountPercentage: 18,
    primaryImage: localImage("hero-upgrade/green-kids-lehenga-front.webp"),
    images: [
      localImage("hero-upgrade/green-kids-lehenga-front.webp"),
      localImage("hero-upgrade/green-kids-lehenga-side.webp"),
      localImage("hero-upgrade/green-kids-lehenga-back.webp")
    ],
    fabric: "Soft Cotton Silk & Zari",
    occasions: ["Festival", "Puja", "Wedding"],
    variants: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"].map((size, index) => ({
      id: `sil-006-${index}`,
      size,
      color: "Rani Pink",
      stockQuantity: 8
    })),
    avgRating: 4.9,
    reviewCount: 142,
    inStock: true,
    badge: "Girls' Favorite"
  }
];

export function findFallbackProduct(slug: string) {
  return fallbackProducts.find((product) => product.slug === slug) || null;
}

export function findFallbackCategory(slug: string) {
  return fallbackCategories.find((category) => category.slug === slug) || null;
}
