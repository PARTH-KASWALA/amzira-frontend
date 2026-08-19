import { z } from "zod";

export const CART_KEY = "amzira_cart_v2";
export const LEGACY_CART_KEY = "amzira_next_cart";

export type GuestCartItem = {
  productId: string | number;
  variantId: string | number;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  stockAvailable: number;
};

const guestCartSchema = z.array(
  z.object({
    productId: z.union([z.string(), z.number()]),
    variantId: z.union([z.string(), z.number()]),
    slug: z.string(),
    name: z.string(),
    image: z.string(),
    price: z.coerce.number().nonnegative(),
    size: z.string(),
    quantity: z.coerce.number().int().min(1).max(10),
    stockAvailable: z.coerce.number().int().nonnegative().default(10)
  })
);

export function readGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = localStorage.getItem(CART_KEY);
    if (current) return guestCartSchema.parse(JSON.parse(current));

    const legacy = JSON.parse(localStorage.getItem(LEGACY_CART_KEY) || "[]") as Array<Record<string, unknown>>;
    const migrated = legacy.map((item) => ({
      ...item,
      variantId: item.variantId || `${item.productId}-${item.size}`,
      stockAvailable: 10
    }));
    const parsed = guestCartSchema.parse(migrated);
    writeGuestCart(parsed);
    localStorage.removeItem(LEGACY_CART_KEY);
    return parsed;
  } catch {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(LEGACY_CART_KEY);
    return [];
  }
}

export function writeGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("amzira-cart-updated"));
}

export function clearGuestCart() {
  writeGuestCart([]);
}
