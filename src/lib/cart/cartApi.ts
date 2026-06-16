// src/lib/cart/cartApi.ts
// Thin fetch wrappers around the /api/cart routes.
// All functions throw on non-OK responses.

import type { CartItem } from "@/types/cart";

/** Fetch the server cart for the logged-in user. */
export async function fetchServerCart(): Promise<CartItem[]> {
  const res = await fetch("/api/cart", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  const data = await res.json();
  return data.items as CartItem[];
}

/** Add (or increment) an item in the server cart. */
export async function addToServerCart(
  productId: string,
  size: string,
  quantity = 1
): Promise<void> {
  const res = await fetch("/api/cart", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, size, quantity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to add to cart");
  }
}

/** Set an exact quantity for a line item (quantity=0 removes it). */
export async function updateServerCartItem(
  productId: string,
  size: string,
  quantity: number
): Promise<void> {
  const res = await fetch(`/api/cart/${encodeURIComponent(productId)}/${encodeURIComponent(size)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to update cart");
  }
}

/** Remove a single line item from the server cart. */
export async function removeFromServerCart(
  productId: string,
  size: string
): Promise<void> {
  const res = await fetch(`/api/cart/${encodeURIComponent(productId)}/${encodeURIComponent(size)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove from cart");
}

/** Clear the entire server cart. */
export async function clearServerCart(): Promise<void> {
  const res = await fetch("/api/cart", {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to clear cart");
}

/** Fetch stock levels for the given items. Returns a productId:size → stock map. */
export async function fetchStock(
  items: Array<{ productId: string; size: string }>
): Promise<Record<string, number>> {
  if (items.length === 0) return {};
  const res = await fetch("/api/cart/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) return {};
  const data = await res.json();
  return data.stock as Record<string, number>;
}
