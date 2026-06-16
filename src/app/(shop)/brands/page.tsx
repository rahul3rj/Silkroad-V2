"use client";

import { useState, useMemo } from "react";
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

export default function BrandsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { products: allProducts, loading } = useProducts();
  const { brands, brandFilterPills } = useBrands();

  // Brand pills filter by brand name (subcategories field stores brand names here).
  // We then pass `gridFilters` to ProductGrid with subcategories cleared so the
  // grid doesn't try to match brand names against product.subcategory and zero
  // out the already-filtered results.
  const products = useMemo(() => {
    if (filters.subcategories.length === 0) return allProducts;
    return allProducts.filter((p) =>
      filters.subcategories.some(
        (s) => p.brand.toLowerCase() === s.toLowerCase()
      )
    );
  }, [filters.subcategories, allProducts]);

  const gridFilters = useMemo(
    () => ({ ...filters, subcategories: [] }),
    [filters]
  );

  if (loading) return <PageLoader />;

  return (
    <section className="min-h-screen w-full bg-white pt-16 page-content-enter">
      {/* ── Page Header ── */}
      <div className="w-full flex flex-col items-center py-12 bg-white">
        <h1 className="font-[metropolis] text-black text-2xl md:text-3xl tracking-[0.04em]">
          Brands
        </h1>
      </div>

      {/* ── Brand Logo Marquee Strip ── */}
      <div className="w-full overflow-hidden border-y border-black/8 py-5 bg-white">
        <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((b, i) => (
            <a
              key={`${b.slug}-${i}`}
              href={`/brands/${b.slug}`}
              className="shrink-0 flex items-center opacity-30 hover:opacity-100 transition-opacity duration-300"
            >
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  title={b.name}
                  className="h-5 w-auto object-contain grayscale brightness-0"
                  loading="lazy"
                />
              ) : (
                <span className="font-[orion] text-[11px] tracking-[0.3em] uppercase">
                  {b.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* ── Sticky Filter Bar (brand names as pills) ── */}
      <ProductFilters
        subcategories={brandFilterPills}
        onChange={setFilters}
        resultCount={products.length}
        searchLabel="Brands"
      />

      {/* ── Products Grid ── */}
      <div className="w-full px-10 py-14">
        <ProductGrid products={products} filters={gridFilters} />
      </div>
    </section>
  );
}
