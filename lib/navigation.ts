import { Heart, HelpCircle, MapPin, Search, ShoppingBag, UserRound } from "lucide-react";

export const navGroups = [
  {
    label: "Women",
    href: "/women",
    columns: [
      {
        title: "Lehenga Choli",
        links: [
          ["Bridal Pattu Lehengas", "/category/bridal-lehenga"],
          ["Kanjeevaram Silk Lehengas", "/category/kanjeevaram-lehenga"],
          ["Tissue & Organza", "/category/tissue-organza"],
          ["Traditional Half Sarees", "/category/half-saree"]
        ]
      },
      {
        title: "Shop By Occasion",
        links: [
          ["Muhurtham", "/women?occasion=muhurtham"],
          ["Reception", "/women?occasion=reception"],
          ["Sangeet", "/women?occasion=sangeet"],
          ["Festival", "/women?occasion=festival"]
        ]
      }
    ]
  },
  {
    label: "Men",
    href: "/men",
    columns: [
      {
        title: "Wedding Wear",
        links: [
          ["Sherwani", "/men?style=sherwani"],
          ["Kurta Jacket Sets", "/men?style=kurta-jacket"],
          ["Indo Western", "/men?style=indo-western"],
          ["Wedding Guest", "/men?occasion=wedding-guest"]
        ]
      }
    ]
  },
  {
    label: "Kids",
    href: "/kids",
    columns: [
      {
        title: "Celebration Wear",
        links: [
          ["Pattu Pavadai", "/category/kids-pattu-pavadai"],
          ["Girls Lehenga", "/kids?style=girls-lehenga"],
          ["Boys Kurta Sets", "/kids?style=boys-kurta"],
          ["Festive Ready", "/kids?occasion=festival"]
        ]
      }
    ]
  },
  {
    label: "Bridal",
    href: "/category/bridal-lehenga",
    columns: [
      {
        title: "Bride Edits",
        links: [
          ["Muhurtham Reds", "/category/bridal-lehenga"],
          ["Temple Zari", "/category/kanjeevaram-lehenga"],
          ["Custom Stitching", "/appointments"],
          ["Video Styling", "/appointments"]
        ]
      }
    ]
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
