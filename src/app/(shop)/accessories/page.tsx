"use client";

import { useState, useCallback } from "react";
import { ProductFilters, FilterState } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLoader } from "@/components/product/PageLoader";
import { bagsSubcategories } from "@/lib/config/categories";
import { useProducts } from "@/hooks/useProducts";

const DEFAULT_FILTERS: FilterState = {
  subcategories: [],
  colors: [],
  sizes: [],
  priceRange: [0, 50000],
  sortBy: "newest",
};

const INITIAL_COUNT = 8;
const LOAD_MORE_COUNT = 16;

export default function AccessoriesPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const { products, loading } = useProducts("category=bags");

  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f);
    setVisibleCount(INITIAL_COUNT);
  }, []);

  if (loading) return <PageLoader />;

  return (
    <section className="min-h-screen w-full bg-white pt-16 page-content-enter">
      {/* Page Header */}
      <div className="w-full flex flex-col items-center py-12 bg-white">
        <h1 className="font-[metropolis] text-black text-2xl md:text-3xl tracking-[0.04em]">
          Accessories
        </h1>
      </div>

      {/* Sticky Filter Bar + Drawer */}
      <ProductFilters
        subcategories={bagsSubcategories}
        onChange={handleFiltersChange}
        resultCount={products.length}
        searchLabel="Accessories"
      />

      {/* Flat 4-col Product Grid */}
      <div className="w-full px-4 md:px-10 py-8 md:py-14">
        <ProductGrid
          products={products}
          filters={filters}
          visibleCount={visibleCount}
          onShowMore={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
        />
      </div>
    </section>
  );
}
