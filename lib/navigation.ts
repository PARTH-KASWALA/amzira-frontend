import { Heart, HelpCircle, MapPin, Search, ShoppingBag, UserRound } from "lucide-react";
import { comingSoonPath, LIVE_CATEGORY_PATH } from "@/lib/storefront";

export const navGroups = [
  {
    label: "Kids",
    href: LIVE_CATEGORY_PATH,
    status: "live" as const,
    intro: "South Indian lehenga choli for girls and their biggest celebration days.",
    quickLinks: [
      ["Shop all girls' styles", LIVE_CATEGORY_PATH],
      ["Temple border lehenga", LIVE_CATEGORY_PATH],
      ["Pattu pavadai", LIVE_CATEGORY_PATH],
      ["Boys' collection", comingSoonPath("kids-boys")]
    ],
    columns: [
      {
        title: "Girls' Lehenga Choli",
        links: [
          ["South Indian Lehenga Choli", LIVE_CATEGORY_PATH],
          ["Kanjeevaram-Inspired Lehenga", LIVE_CATEGORY_PATH],
          ["Silk Choli Sets", LIVE_CATEGORY_PATH],
          ["Temple Border Lehenga", LIVE_CATEGORY_PATH]
        ]
      },
      {
        title: "Pattu Pavadai",
        links: [
          ["Pattu Pavadai Sets", LIVE_CATEGORY_PATH],
          ["Silk Skirt and Blouse", LIVE_CATEGORY_PATH],
          ["Festive Dupatta Sets", LIVE_CATEGORY_PATH],
          ["View All Girls' Styles", LIVE_CATEGORY_PATH]
        ]
      },
      {
        title: "Coming Soon",
        links: [
          ["Boys' Festive Wear", comingSoonPath("kids-boys")],
          ["Women's Collection", comingSoonPath("women")],
          ["Men's Collection", comingSoonPath("men")]
        ]
      }
    ],
    promos: [
      {
        title: "Girls' Lehenga Choli",
        cta: "Shop the collection",
        href: LIVE_CATEGORY_PATH,
        image: "/images/hero-upgrade/green-kids-lehenga-front.webp"
      },
      {
        title: "Temple Silk Details",
        cta: "View the edit",
        href: LIVE_CATEGORY_PATH,
        image: "/images/hero-upgrade/blue-kids-lehenga-front.webp"
      }
    ]
  },
  {
    label: "Women",
    href: comingSoonPath("women"),
    status: "coming-soon" as const,
    intro: "",
    quickLinks: [],
    columns: [],
    promos: []
  },
  {
    label: "Men",
    href: comingSoonPath("men"),
    status: "coming-soon" as const,
    intro: "",
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
