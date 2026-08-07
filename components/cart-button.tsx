"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/lib/catalog";

type CartItem = {
  productId: string | number;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
};

const CART_KEY = "amzira_next_cart";

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToLocalCart(product: Product, size: string, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.slug === product.slug && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.primaryImage,
      price: product.salePrice,
      size,
      quantity
    });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("amzira-cart-updated"));
}

export function AddToCartButton({
  product,
  size,
  className = ""
}: {
  product: Product;
  size?: string;
  className?: string;
}) {
  const [status, setStatus] = useState("Add to cart");
  const selectedSize = size || product.variants.find((variant) => variant.stockQuantity > 0)?.size || "Free";

  return (
    <button
      type="button"
      className={`btn-primary gap-2 ${className}`}
      disabled={!product.inStock}
      onClick={() => {
        addToLocalCart(product, selectedSize);
        setStatus("Added");
        window.setTimeout(() => setStatus("Add to cart"), 1800);
      }}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      {product.inStock ? status : "Sold out"}
    </button>
  );
}

export { CART_KEY };
