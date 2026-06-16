"use client";

import { useState } from "react";
import { ProductFilters, FilterState } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLoader } from "@/components/product/PageLoader";
import { menSubcategories } from "@/lib/config/categories";
import { useProducts } from "@/hooks/useProducts";

const DEFAULT_FILTERS: FilterState = {
  subcategories: [],
  colors: [],
  sizes: [],
  priceRange: [0, 2000],
  sortBy: "newest",
};

export default function MenPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { products, loading } = useProducts("category=men");

  if (loading) return <PageLoader />;

  return (
    <section className="min-h-screen w-full bg-white pt-16 page-content-enter">
      {/* Page Header */}
      <div className="w-full flex flex-col items-center py-12 bg-white">
        <h1 className="font-[metropolis] text-black text-2xl md:text-3xl tracking-[0.04em]">
          Men&apos;s Clothing
        </h1>
      </div>

      {/* Sticky Filter Bar + Drawer */}
      <ProductFilters
        subcategories={menSubcategories}
        onChange={setFilters}
        resultCount={products.length}
        searchLabel="Men"
      />

      {/* Flat 4-col Product Grid */}
      <div className="w-full px-10 py-14">
        <ProductGrid
          products={products}
          filters={filters}
          showMoreHref="/men/all"
        />
      </div>
    </section>
  );
}
