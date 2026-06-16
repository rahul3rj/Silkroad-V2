"use client";

// /admin/inventory — inventory page.
// ADMIN:       shows only their own brand's products.
// SUPER_ADMIN: shows all products across every brand, with a Brand column.
//              The "+ Add Product" button is hidden for super-admins.

import { useEffect, useState } from "react";
import Link from "next/link";

interface VariantRow {
  id: string;
  size: string;
  stock: number;
}
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  price: number;
  salePrice: number | null;
  imageSrc: string;
  isNew: boolean;
  isSale: boolean;
  variants: VariantRow[];
  totalStock: number;
  brandName: string;
  brandSlug: string;
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0)
    return (
      <span className="font-[metropolisSemiBold] text-[9px] tracking-[0.18em] uppercase border border-black px-2.5 py-1 text-black">
        Out of Stock
      </span>
    );
  if (qty <= 3)
    return (
      <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/30 px-2.5 py-1 text-[#787878]">
        Low Stock
      </span>
    );
  return (
    <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/15 px-2.5 py-1 text-[#bbb]">
      In Stock
    </span>
  );
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load inventory.");
        return r.json();
      })
      .then((data: { products: ProductRow[]; isSuperAdmin: boolean }) => {
        setProducts(data.products);
        setIsSuperAdmin(data.isSuperAdmin);
      })
      .catch(() => setError("Could not load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const brands = ["all", ...Array.from(new Set(products.map((p) => p.brandName))).sort()];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.subcategory ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.brandName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchBrand = brandFilter === "all" || p.brandName === brandFilter;
    return matchSearch && matchCat && matchBrand;
  });

  // Column headers differ between super-admin (has Brand col) and brand-admin
  const headers = isSuperAdmin
    ? ["Product", "Brand", "Category", "Price", "Total Stock", "Status", ""]
    : ["Product", "Category", "Price", "Total Stock", "Status", ""];

  return (
    <section className="min-h-screen bg-white pt-12 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">
          {isSuperAdmin ? "Platform" : "Inventory"}
        </span>
        {isSuperAdmin && (
          <>
            <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
            <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Inventory</span>
          </>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
        {/* Page title */}
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Inventory</h1>
            <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
              {loading
                ? "Loading…"
                : isSuperAdmin
                ? `${products.length} product${products.length !== 1 ? "s" : ""} across all brands`
                : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Only brand-admins see the Add Product button */}
          {!isSuperAdmin && !loading && (
            <Link
              href="/admin/products/add"
              className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-8 py-3 hover:bg-black/80 transition-colors duration-300"
            >
              + Add Product
            </Link>
          )}
        </div>

        {error && (
          <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider mb-5">{error}</p>
        )}

        {/* Filters */}
        <div className="border-b border-black/8 pb-6 mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative max-w-xs">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder={isSuperAdmin ? "Search products or brands…" : "Search products…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-black/15 pl-9 pr-4 py-2.5 font-[metropolis] text-[11px] tracking-wider text-black placeholder:text-[#bbb] outline-none focus:border-black/50 transition-colors duration-200 bg-white"
              />
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-4 py-2 border transition-all duration-200 capitalize ${
                    categoryFilter === cat
                      ? "bg-black text-white border-black"
                      : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand filter — super-admin only */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#bbb] mr-1">Brand:</span>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-4 py-2 border transition-all duration-200 ${
                    brandFilter === b
                      ? "bg-black text-white border-black"
                      : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                  }`}
                >
                  {b === "all" ? "All Brands" : b}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-black/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-7 py-3 text-left font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-7 py-12 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase"
                  >
                    {products.length === 0
                      ? "No products yet"
                      : "No products match your filters"}
                  </td>
                </tr>
              )}

              {filtered.map((product) => {
                const isExpanded = expandedId === product.id;
                return (
                  <>
                    <tr
                      key={product.id}
                      className="hover:bg-black/[0.015] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : product.id)}
                    >
                      {/* Product */}
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-black/10 overflow-hidden bg-[#f9f9f9] shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.imageSrc} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-[metropolis] text-[12px] text-black">{product.name}</p>
                            <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-0.5">
                              {product.subcategory}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand — super-admin only */}
                      {isSuperAdmin && (
                        <td className="px-7 py-4">
                          <a
                            href={`/brands/${product.brandSlug}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-[metropolis] text-[11px] text-black hover:underline underline-offset-2"
                          >
                            {product.brandName}
                          </a>
                        </td>
                      )}

                      {/* Category */}
                      <td className="px-7 py-4 font-[metropolis] text-[11px] text-[#787878] capitalize">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="px-7 py-4">
                        <span className="font-[metropolisSemiBold] text-[12px] text-black">
                          {usd(product.isSale && product.salePrice ? product.salePrice : product.price)}
                        </span>
                        {product.isSale && product.salePrice && (
                          <span className="font-[metropolis] text-[10px] text-[#bbb] line-through ml-2">
                            {usd(product.price)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-7 py-4">
                        <span className="font-[metropolisSemiBold] text-[12px] text-black">{product.totalStock}</span>
                        <span className="font-[metropolis] text-[10px] text-[#bbb] ml-1.5">units</span>
                      </td>

                      {/* Status badge */}
                      <td className="px-7 py-4">
                        <StockBadge qty={product.totalStock} />
                      </td>

                      {/* Expand chevron */}
                      <td className="px-7 py-4 text-right">
                        <span className={`font-[metropolis] text-[#787878] text-sm transition-transform inline-block duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                          ▾
                        </span>
                      </td>
                    </tr>

                    {/* Expanded row — size breakdown */}
                    {isExpanded && (
                      <tr key={`${product.id}-expand`} className="bg-[#fafafa]">
                        <td colSpan={headers.length} className="px-7 py-5">
                          <p className="font-[metropolis] text-[9px] tracking-[0.2em] uppercase text-[#787878] mb-3">
                            Stock by Size
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.variants.length === 0 ? (
                              <p className="font-[metropolis] text-[10px] text-[#bbb]">No stock data</p>
                            ) : (
                              product.variants.map((v) => (
                                <div
                                  key={v.id}
                                  className={`flex flex-col items-center justify-center w-14 h-12 border text-center ${
                                    v.stock === 0
                                      ? "border-black bg-black text-white"
                                      : v.stock <= 3
                                      ? "border-black/30 bg-white"
                                      : "border-black/10 bg-white"
                                  }`}
                                >
                                  <p className={`font-[metropolisSemiBold] text-[10px] tracking-wider ${v.stock === 0 ? "text-white" : "text-black"}`}>
                                    {v.size}
                                  </p>
                                  <p className={`font-[metropolis] text-[11px] ${v.stock === 0 ? "text-white/70" : v.stock <= 3 ? "text-[#787878]" : "text-[#bbb]"}`}>
                                    {v.stock}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2">
                            {product.isNew && (
                              <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-[#787878]">
                                New Arrival
                              </span>
                            )}
                            {product.isSale && (
                              <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-[#787878]">
                                On Sale
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-5 flex gap-5 font-[metropolis] text-[10px] tracking-wider text-[#bbb] uppercase">
          <span>■ Out of Stock</span>
          <span className="text-[#787878]">▪ Low (≤ 3)</span>
          <span>▫ In Stock</span>
        </div>
      </div>
    </section>
  );
}
