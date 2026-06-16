"use client";

// useWishlist — persist wishlist in localStorage
// TODO: Sync with backend when user is authenticated
import { useState } from "react";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const toggle = (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("wishlist", JSON.stringify(next));
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return { wishlist, toggle, isWishlisted };
}
