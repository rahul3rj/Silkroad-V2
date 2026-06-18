"use client";

import { useState, useMemo, useCallback } from "react";
import { ProductFilters, FilterState } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLoader } from "@/components/product/PageLoader";
import { newInSubcategories } from "@/lib/config/categories";
import type { ProductData } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";

const DEFAULT_FILTERS: FilterState = {
  subcategories: [],
  colors: [],
  sizes: [],
  priceRange: [0, 50000],
  sortBy: "newest",
};

// New-in subcategory filter handles both category ("Women","Men","Accessories")
// and subcategory (e.g. "Dresses", "Suits") pills
function applyNewInSubcat(source: ProductData[], filters: FilterState) {
  const cats = filters.subcategories;
  if (cats.length === 0) return source;

  const categoryMap: Record<string, string> = {
    Women: "women",
    Men: "men",
    Accessories: "bags",
  };

  return source.filter((p) => {
    return cats.some((s) => {
      if (categoryMap[s]) return p.category === categoryMap[s];
      return p.subcategory.toLowerCase() === s.toLowerCase();
    });
  });
}

const INITIAL_COUNT = 8;
const LOAD_MORE_COUNT = 16;

export default function NewInPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const { products: newInProducts, loading } = useProducts("isNew=true");

  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f);
    setVisibleCount(INITIAL_COUNT);
  }, []);

  // Apply the New In-specific category pill filter in the page.
  // We then pass `gridFilters` to ProductGrid with subcategories cleared
  // so the grid doesn't try to match category labels ("Women", "Men", "Accessories")
  // against product.subcategory ("Dresses", "Suits", …) and zero everything out.
  const products = useMemo(
    () => applyNewInSubcat(newInProducts, filters),
    [newInProducts, filters]
  );

  const gridFilters = useMemo(
    () => ({ ...filters, subcategories: [] }),
    [filters]
  );

  if (loading) return <PageLoader />;

  return (
    <section className="min-h-screen w-full bg-white pt-16 page-content-enter">
      {/* Page Header */}
      <div className="w-full flex flex-col items-center py-12 bg-white">
        <h1 className="font-[metropolis] text-black text-2xl md:text-3xl tracking-[0.04em]">
          New In
        </h1>
      </div>

      {/* Sticky Filter Bar + Drawer */}
      <ProductFilters
        subcategories={newInSubcategories}
        onChange={handleFiltersChange}
        resultCount={products.length}
        searchLabel="New Arrivals"
      />

      {/* Flat 4-col Product Grid */}
      <div className="w-full px-4 md:px-10 py-8 md:py-14">
        <ProductGrid
          products={products}
          filters={gridFilters}
          visibleCount={visibleCount}
          onShowMore={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
        />
      </div>
    </section>
  );
}
