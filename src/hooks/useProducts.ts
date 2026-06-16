"use client";

// useProducts — client hook to load storefront products from /api/products.
// Pass a query string like "category=women" or "brand=gucci" (or "" for all).

import { useEffect, useState } from "react";
import type { ProductData } from "@/types/product";

export function useProducts(query = "") {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/products${query ? `?${query}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProductData[]) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  return { products, loading };
}
