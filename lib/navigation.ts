import { Heart, HelpCircle, MapPin, Search, ShoppingBag, UserRound } from "lucide-react";
import {
  comingSoonPath,
  GIRLS_LEHENGA_CATEGORY_PATH,
  LIVE_CATEGORY_PATH,
  PATTU_PAVADAI_CATEGORY_PATH
} from "@/lib/storefront";

const subcategoryHref = (categoryPath: string, subcategory: string) =>
  `${categoryPath}?subcategory=${subcategory}`;

export const navGroups = [
  {
    label: "Kids",
    href: LIVE_CATEGORY_PATH,
    status: "live" as const,
    intro: "South Indian lehenga choli for girls and their biggest celebration days.",
    introCta: ["Shop all girls' styles", LIVE_CATEGORY_PATH],
    quickLinks: [
      ["Girls' Lehenga Choli", GIRLS_LEHENGA_CATEGORY_PATH],
      ["Pattu Pavadai", PATTU_PAVADAI_CATEGORY_PATH],
      ["Boys' Collection", comingSoonPath("kids-boys")],
      ["Coming Soon", comingSoonPath("women")],
      ["View All Kids", LIVE_CATEGORY_PATH]
    ],
    columns: [
      {
        title: "Girls' Lehenga Choli",
        links: [
          {
            label: "South Indian Lehenga Choli",
            description: "Classic festive silhouettes with contrast borders",
            href: subcategoryHref(GIRLS_LEHENGA_CATEGORY_PATH, "south-indian-lehenga-choli")
          },
          {
            label: "Temple & Peacock Work",
            description: "Heritage motifs for weddings and temple ceremonies",
            href: subcategoryHref(GIRLS_LEHENGA_CATEGORY_PATH, "temple-peacock-work-lehenga")
          },
          {
            label: "Koti Jacket Lehenga Sets",
            description: "Layered celebration sets with a woven jacket",
            href: subcategoryHref(GIRLS_LEHENGA_CATEGORY_PATH, "koti-jacket-lehenga-sets")
          },
          {
            label: "Festive Silk Lehenga Choli",
            description: "Soft lustre with gold-toned festive detailing",
            href: subcategoryHref(GIRLS_LEHENGA_CATEGORY_PATH, "festive-silk-lehenga-choli")
          }
        ],
        cta: ["View all girls' styles", GIRLS_LEHENGA_CATEGORY_PATH]
      },
      {
        title: "Pattu Pavadai",
        links: [
          {
            label: "Classic Pattu Pavadai",
            description: "Traditional skirt-and-choli sets for celebrations",
            href: subcategoryHref(PATTU_PAVADAI_CATEGORY_PATH, "classic-pattu-pavadai")
          },
          {
            label: "Peacock & Elephant Pattu",
            description: "South Indian heritage motifs in festive colour",
            href: subcategoryHref(PATTU_PAVADAI_CATEGORY_PATH, "peacock-elephant-pattu-pavadai")
          },
          {
            label: "Gold Zari Pattu Pavadai",
            description: "Rich zari borders for weddings and festivals",
            href: subcategoryHref(PATTU_PAVADAI_CATEGORY_PATH, "gold-zari-pattu-pavadai")
          }
        ],
        cta: ["View all pattu pavadai", PATTU_PAVADAI_CATEGORY_PATH]
      },
      {
        title: "Coming Soon",
        links: [
          {
            label: "Boys' Festive Wear",
            description: "Stylish outfits for little gentlemen",
            href: comingSoonPath("kids-boys")
          },
          {
            label: "Women's Collection",
            description: "Elegant edits for every celebration",
            href: comingSoonPath("women")
          },
          {
            label: "Men's Collection",
            description: "Timeless styles for every occasion",
            href: comingSoonPath("men")
          }
        ],
        cta: ["Explore coming soon", comingSoonPath("women")]
      }
    ],
    promos: [
      {
        title: "Girls' Lehenga Choli",
        cta: "Shop the collection",
        href: GIRLS_LEHENGA_CATEGORY_PATH,
        image: "/images/hero-upgrade/green-kids-lehenga-front.webp"
      },
      {
        title: "Temple Silk Details",
        cta: "View the edit",
        href: subcategoryHref(GIRLS_LEHENGA_CATEGORY_PATH, "temple-peacock-work-lehenga"),
        image: "/images/hero-upgrade/blue-kids-lehenga-front.webp"
      }
    ]
  },
  {
    label: "Women",
    href: comingSoonPath("women"),
    status: "coming-soon" as const,
    intro: "",
    introCta: ["", ""],
    quickLinks: [],
    columns: [],
    promos: []
  },
  {
    label: "Men",
    href: comingSoonPath("men"),
    status: "coming-soon" as const,
    intro: "",
    introCta: ["", ""],
    quickLinks: [],
    columns: [],
    promos: []
  }
];

export const utilityLinks = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Wishlist", href: "/account#wishlist", icon: Heart },
  { label: "Stores", href: "/stores", icon: MapPin },
  { label: "Support", href: "/contact-support", icon: HelpCircle },
  { label: "Account", href: "/account", icon: UserRound },
  { label: "Cart", href: "/cart", icon: ShoppingBag }
];
