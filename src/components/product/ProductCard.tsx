"use client";

import Link from "next/link";
import type { ProductData } from "@/types/product";

interface ProductCardProps {
  product: ProductData;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice =
    product.isSale && product.salePrice ? product.salePrice : product.price;

  return (
    <div className="flex flex-col justify-start w-full min-w-0 max-w-full group cursor-pointer overflow-hidden">
      {/* ── Image ── */}
      <Link
        href={`/product/${product.slug}`}
        className="block w-full min-w-0 h-[35vh] md:h-[70vh] overflow-hidden relative bg-[#f7f6f5]"
      >
        <img
          src={product.imageSrc}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/[0.01] group-hover:bg-black/[0.05] transition-colors duration-[1200ms] z-10" />

        {product.isNew && (
          <span className="absolute top-3 left-3 z-20 px-2 py-0.5 text-[8px] tracking-[0.18em] font-[metropolisSemiBold] uppercase mix-blend-difference text-white">
            New In
          </span>
        )}
        {product.isSale && (
          <span className="absolute top-3 right-3 z-20 px-2 py-0.5 text-[8px] tracking-[0.18em] font-[metropolisSemiBold] uppercase bg-black/80 text-white">
            Sale
          </span>
        )}
      </Link>

      {/* ── Card Meta ── */}
      <div className="w-full flex flex-col justify-start mt-4 select-none">
        {/* Name + Price */}
        <Link
          href={`/product/${product.slug}`}
          className="w-full flex justify-between items-center"
        >
          <span className="text-xs font-[metropolis] text-black truncate max-w-[60%]">
            {product.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {product.isSale && product.salePrice && (
              <span className="text-[10px] font-[metropolis] text-[#aaa] line-through tracking-widest">
                ${product.price}
              </span>
            )}
            <span className="text-xs font-[metropolis] tracking-widest text-[#787878]">
              ${displayPrice}
            </span>
          </div>
        </Link>

        {/* Color swatches + Brand */}
        <div className="w-full flex items-center justify-between mt-3.5 min-h-[20px]">
          <div className="flex gap-3">
            {(product.colors ?? []).map((color) => (
              <span
                key={color.hex}
                title={color.name}
                className="w-3.5 h-3.5 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ring-offset-2 hover:ring-2 shadow-sm shrink-0"
                style={{
                  backgroundColor: color.hex,
                  ["--tw-ring-color" as string]: `color-mix(in srgb, ${color.hex} 50%, transparent)`,
                }}
              />
            ))}
          </div>

          <Link
            href={`/brands/${product.brandSlug}`}
            className="flex items-center gap-1 group/brand shrink-0 ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[9px] font-[metropolisSemiBold] tracking-[0.18em] uppercase text-[#787878] group-hover/brand:text-black transition-colors duration-200">
              {product.brand}
            </span>
            <svg
              width="5"
              height="9"
              viewBox="0 0 5 9"
              fill="none"
              className="text-[#aaa] group-hover/brand:text-black transition-colors duration-200 shrink-0"
            >
              <path
                d="M1 1l3 3.5L1 8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
