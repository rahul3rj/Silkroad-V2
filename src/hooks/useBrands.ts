"use client";

// useBrands — fetches all active brands from /api/brands.
// Returns brand list + derived filter pills for the brands page.

import { useEffect, useState } from "react";
import type { BrandData } from "@/types/product";

export function useBrands() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: BrandData[]) => setBrands(data))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  // "View All" + brand names as filter pills
  const brandFilterPills = [
    "View All",
    ...brands.map((b) => b.name),
  ];

  return { brands, brandFilterPills, loading };
}
