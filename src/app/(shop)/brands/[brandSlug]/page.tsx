"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ProductFilters, FilterState } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLoader } from "@/components/product/PageLoader";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";

const DEFAULT_FILTERS: FilterState = {
  subcategories: [],
  colors: [],
  sizes: [],
  priceRange: [0, 2000],
  sortBy: "newest",
};

export default function BrandPage() {
  const params = useParams();
  const brandSlug = params.brandSlug as string;

  const { brands } = useBrands();
  const brand = brands.find((b) => b.slug === brandSlug);
  const { products: brandProducts, loading } = useProducts(`brand=${brandSlug}`);
  const subcategories = useMemo(
    () => ["View All", ...Array.from(new Set(brandProducts.map((p) => p.subcategory)))],
    [brandProducts]
  );

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const displayName = brand?.name ?? brandSlug.replace(/-/g, " ");
  const tagline = brand?.tagline ?? "";

  if (loading) return <PageLoader />;

  return (
    <section className="min-h-screen w-full bg-white pt-16 page-content-enter">
      {/* ── Brand Header ── */}
      <div className="w-full flex flex-col items-center pt-12 pb-8 bg-white px-10">
        {/* Brand logo or fallback text */}
        {brand?.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={displayName}
            className="max-h-16 w-auto object-contain grayscale brightness-0 mb-2"
          />
        ) : (
          <h1 className="font-[orion] text-black text-3xl md:text-4xl tracking-[0.08em] uppercase text-center">
            {displayName}
          </h1>
        )}
        {tagline && (
          <p className="font-[metropolis] text-[#aaa] text-[11px] tracking-[0.18em] uppercase mt-4 text-center">
            {tagline}
          </p>
        )}
        {/* Count */}
        <p className="font-[metropolis] text-[#bbb] text-[10px] tracking-wider mt-5">
          {brandProducts.length} {brandProducts.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {/* ── Thin divider ── */}
      <div className="w-full h-px bg-black/8" />

      {/* ── Sticky Filter Bar ── */}
      <ProductFilters
        subcategories={subcategories}
        onChange={setFilters}
        resultCount={brandProducts.length}
        searchLabel={displayName}
      />

      {/* ── Product Grid ── */}
      <div className="w-full px-10 py-14">
        {brandProducts.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center gap-4 text-center">
            <p className="font-[metropolis] text-[#787878] text-sm tracking-wider">
              No products found for this brand.
            </p>
          </div>
        ) : (
          <ProductGrid products={brandProducts} filters={filters} />
        )}
      </div>
    </section>
  );
}
