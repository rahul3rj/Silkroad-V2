"use client";

import { useMemo } from "react";
import { ProductCard } from "./ProductCard";
import type { ProductData } from "@/types/product";
import type { FilterState } from "./ProductFilters";
import Link from "next/link";

interface ProductGridProps {
  products: ProductData[];
  filters?: FilterState;
  /** Navigate to a separate "all" page (old behaviour) */
  showMoreHref?: string;
  /** Cap visible products and show an inline Show More button */
  visibleCount?: number;
  /** Called when the inline Show More button is clicked */
  onShowMore?: () => void;
}

function applyFilters(
  products: ProductData[],
  filters?: FilterState
): ProductData[] {
  if (!filters) return products;

  let result = [...products];

  if (filters.subcategories.length > 0) {
    result = result.filter((p) =>
      filters.subcategories.some(
        (s) => p.subcategory.toLowerCase() === s.toLowerCase()
      )
    );
  }

  if (filters.colors.length > 0) {
    result = result.filter((p) =>
      p.colors.some((c) => filters.colors.includes(c.name))
    );
  }

  if (filters.sizes.length > 0) {
    result = result.filter((p) =>
      p.sizes.some((s) => filters.sizes.includes(s))
    );
  }

  result = result.filter((p) => {
    const price = p.isSale && p.salePrice ? p.salePrice : p.price;
    return price >= filters.priceRange[0] && price <= filters.priceRange[1];
  });

  switch (filters.sortBy) {
    case "price-asc":
      result.sort((a, b) => {
        const aP = a.isSale && a.salePrice ? a.salePrice : a.price;
        const bP = b.isSale && b.salePrice ? b.salePrice : b.price;
        return aP - bP;
      });
      break;
    case "price-desc":
      result.sort((a, b) => {
        const aP = a.isSale && a.salePrice ? a.salePrice : a.price;
        const bP = b.isSale && b.salePrice ? b.salePrice : b.price;
        return bP - aP;
      });
      break;
    case "newest":
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      break;
  }

  return result;
}

export function ProductGrid({
  products,
  filters,
  showMoreHref,
  visibleCount,
  onShowMore,
}: ProductGridProps) {
  const filtered = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  // When visibleCount is set, slice the results for progressive loading
  const visible = visibleCount !== undefined ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = visibleCount !== undefined && visibleCount < filtered.length;

  if (filtered.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center gap-4 text-center">
        <p className="font-[metropolis] text-[#787878] text-sm tracking-wider">
          No products match your current filters.
        </p>
        <p className="font-[metropolis] text-[#bbb] text-xs tracking-wider mt-1">
          Try adjusting your filter selection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 4-column grid — matches original page.tsx layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-16">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Inline Show More button (progressive loading) */}
      {hasMore && onShowMore && (
        <div className="w-full flex justify-center mt-20">
          <button
            onClick={onShowMore}
            className="premium-pill-btn group/btn relative overflow-hidden select-none text-center"
          >
            <div className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
            <div className="relative z-10 pointer-events-none mix-blend-difference text-white flex justify-center items-center overflow-hidden h-[22px]">
              <div className="relative overflow-hidden h-full flex flex-col justify-start">
                <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">
                  Show More
                </span>
                <span className="absolute left-0 top-0 block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover/btn:translate-y-0">
                  Show More
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Navigate-to-all link (legacy showMoreHref) */}
      {showMoreHref && (
        <div className="w-full flex justify-center mt-20">
          <Link
            href={showMoreHref}
            className="premium-pill-btn group/btn relative overflow-hidden select-none text-center"
          >
            <div className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
            <div className="relative z-10 pointer-events-none mix-blend-difference text-white flex justify-center items-center overflow-hidden h-[22px]">
              <div className="relative overflow-hidden h-full flex flex-col justify-start">
                <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">
                  Show More
                </span>
                <span className="absolute left-0 top-0 block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover/btn:translate-y-0">
                  Show More
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
