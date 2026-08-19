"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/lib/catalog";
import { addAuthenticatedCartItem } from "@/lib/api/cart";
import { ApiError } from "@/lib/api/browser-client";
import { CART_KEY, GuestCartItem, readGuestCart, writeGuestCart } from "@/lib/cart";
import { useSession } from "@/components/session-provider";

export function addToLocalCart(product: Product, variantId: string | number, quantity = 1) {
  const variant = product.variants.find((entry) => String(entry.id) === String(variantId));
  const size = variant?.size || "Free";
  const cart = readGuestCart();
  const existing = cart.find((item) => item.slug === product.slug && String(item.variantId) === String(variantId));
  if (existing) {
    existing.quantity = Math.min(existing.stockAvailable || 10, existing.quantity + quantity, 10);
  } else {
    const item: GuestCartItem = {
      productId: product.id,
      variantId,
      slug: product.slug,
      name: product.name,
      image: product.primaryImage,
      price: product.salePrice + (variant?.additionalPrice || 0),
      size,
      quantity,
      stockAvailable: variant?.stockQuantity || 10
    };
    cart.push(item);
  }
  writeGuestCart(cart);
}

export function AddToCartButton({
  product,
  variantId,
  className = ""
}: {
  product: Product;
  variantId?: string | number;
  className?: string;
}) {
  const { status: sessionStatus } = useSession();
  const [status, setStatus] = useState("Add to cart");
  const selectedVariant =
    product.variants.find((variant) => String(variant.id) === String(variantId)) ||
    product.variants.find((variant) => variant.stockQuantity > 0);
  const canAdd = product.inStock && Boolean(selectedVariant);

  async function addItem() {
    if (!selectedVariant) return;
    setStatus("Adding...");
    try {
      if (sessionStatus === "authenticated") {
        const productId = Number(product.id);
        const selectedVariantId = Number(selectedVariant.id);
        if (!Number.isInteger(productId) || !Number.isInteger(selectedVariantId)) {
          throw new ApiError("This preview item is not available in the live catalog.", 400);
        }
        await addAuthenticatedCartItem(productId, selectedVariantId);
        window.dispatchEvent(new CustomEvent("amzira-cart-updated"));
      } else {
        addToLocalCart(product, selectedVariant.id);
      }
      setStatus("Added to cart");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add item");
    }
    window.setTimeout(() => setStatus("Add to cart"), 2400);
  }

  return (
    <button
      type="button"
      className={`btn-primary gap-2 ${className}`}
      disabled={!canAdd || status === "Adding..."}
      onClick={() => void addItem()}
      aria-live="polite"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      {canAdd ? status : "Sold out"}
    </button>
  );
}

export { CART_KEY };
