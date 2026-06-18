"use client";

// /admin/inventory — inventory page.
// ADMIN:       shows only their own brand's products (active + hidden).
// SUPER_ADMIN: shows all products across every brand, with a Brand column.
//              The "+ Add Product" button is hidden for super-admins.

import React, { useEffect, useState, useCallback } from "react";
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
  isActive: boolean;
  variants: VariantRow[];
  totalStock: number;
  brandName: string;
  brandSlug: string;
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const CATEGORY_LABEL: Record<string, string> = { bags: "Accessories" };
const displayCategory = (slug: string) =>
  CATEGORY_LABEL[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);

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

// ── Expanded panel with editable stock ────────────────────────────────────────
function ExpandedStock({
  product,
  onSave,
}: {
  product: ProductRow;
  onSave: (productId: string, variants: { id: string; stock: number }[]) => Promise<void>;
}) {
  const [localStock, setLocalStock] = useState<Record<string, number>>(
    () => Object.fromEntries(product.variants.map((v) => [v.id, v.stock]))
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalStock(Object.fromEntries(product.variants.map((v) => [v.id, v.stock])));
  }, [product.variants]);

  const isDirty = product.variants.some((v) => localStock[v.id] !== v.stock);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await onSave(
        product.id,
        product.variants.map((v) => ({ id: v.id, stock: localStock[v.id] ?? v.stock }))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateQty = (id: string, delta: number, raw?: number) =>
    setLocalStock((prev) => ({
      ...prev,
      [id]: raw !== undefined ? Math.max(0, raw) : Math.max(0, (prev[id] ?? 0) + delta),
    }));

  return (
    <tr className="bg-[#fafafa]">
      <td colSpan={99} className="px-7 py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <p className="font-[metropolis] text-[9px] tracking-[0.2em] uppercase text-[#787878] mb-3">
              Stock by Size
            </p>
            {product.variants.length === 0 ? (
              <p className="font-[metropolis] text-[10px] text-[#bbb]">No stock data</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {product.variants.map((v) => {
                  const qty = localStock[v.id] ?? v.stock;
                  return (
                    <div
                      key={v.id}
                      className={`flex flex-col items-center border px-3 pt-2 pb-2.5 min-w-[56px] transition-colors duration-150 ${
                        qty === 0 ? "border-black/30 bg-white" : "border-black/10 bg-white"
                      }`}
                    >
                      <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878] mb-1.5">
                        {v.size}
                      </span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateQty(v.id, -1)}
                          className="text-[#bbb] hover:text-black transition-colors text-base leading-none w-4 text-center">−</button>
                        <input
                          type="number" min={0} value={qty}
                          onChange={(e) => updateQty(v.id, 0, Number(e.target.value) || 0)}
                          className="w-8 text-center font-[metropolisSemiBold] text-[13px] text-black bg-transparent outline-none border-b border-transparent focus:border-black/30 transition-colors duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button type="button" onClick={() => updateQty(v.id, 1)}
                          className="text-[#bbb] hover:text-black transition-colors text-base leading-none w-4 text-center">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2">
              {product.isNew && (
                <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-[#787878]">New Arrival</span>
              )}
              {product.isSale && (
                <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-[#787878]">On Sale</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 pt-6">
            {isDirty && (
              <button type="button" onClick={handleSave} disabled={saving}
                className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-5 py-2.5 hover:bg-black/80 transition-colors duration-200 disabled:opacity-40">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            )}
            {saved && !isDirty && (
              <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878]">Saved ✓</span>
            )}
            {saveError && (
              <p className="font-[metropolis] text-[9px] text-red-500 tracking-wider">{saveError}</p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "active" | "hidden">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  // ── Hard delete ─────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    setDeleting(true);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    setExpandedId(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Delete failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      fetch("/api/admin/products", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setProducts(data.products))
        .catch(() => {});
    } finally {
      setDeleting(false);
    }
  }, []);

  // ── Visibility toggle ───────────────────────────────────────────────────────
  const handleToggleVisibility = useCallback(async (product: ProductRow) => {
    setTogglingId(product.id);
    const newActive = !product.isActive;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: newActive } : p))
    );
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newActive ? "show" : "hide" }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Could not update visibility.");
      }
    } catch (err) {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !newActive } : p))
      );
      setError(err instanceof Error ? err.message : "Could not update visibility.");
    } finally {
      setTogglingId(null);
    }
  }, []);

  // ── Stock save ──────────────────────────────────────────────────────────────
  const handleStockSave = useCallback(
    async (productId: string, variants: { id: string; stock: number }[]) => {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed.");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                variants: json.variants,
                totalStock: (json.variants as VariantRow[]).reduce(
                  (s: number, v: VariantRow) => s + v.stock,
                  0
                ),
              }
            : p
        )
      );
    },
    []
  );

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const brands = ["all", ...Array.from(new Set(products.map((p) => p.brandName))).sort()];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.subcategory ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.brandName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchBrand = brandFilter === "all" || p.brandName === brandFilter;
    const matchVis =
      visibilityFilter === "all" ||
      (visibilityFilter === "active" && p.isActive) ||
      (visibilityFilter === "hidden" && !p.isActive);
    return matchSearch && matchCat && matchBrand && matchVis;
  });

  const hiddenCount = products.filter((p) => !p.isActive).length;
  const colCount = isSuperAdmin ? 7 : 6;

  return (
    <section className="min-h-screen bg-white pt-6.5 pb-24">
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
                : `${products.length} product${products.length !== 1 ? "s" : ""}${hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ""}`}
            </p>
          </div>
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
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-4 py-2 border transition-all duration-200 ${
                    categoryFilter === cat
                      ? "bg-black text-white border-black"
                      : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                  }`}>
                  {cat === "all" ? "All" : displayCategory(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Brand filter — super-admin only */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#bbb] mr-1">Brand:</span>
                {brands.map((b) => (
                  <button key={b} onClick={() => setBrandFilter(b)}
                    className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-4 py-2 border transition-all duration-200 ${
                      brandFilter === b
                        ? "bg-black text-white border-black"
                        : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                    }`}>
                    {b === "all" ? "All Brands" : b}
                  </button>
                ))}
              </div>
            )}

            {/* Visibility filter */}
            <div className="flex items-center gap-2">
              <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#bbb] mr-1">Show:</span>
              {(["all", "active", "hidden"] as const).map((v) => (
                <button key={v} onClick={() => setVisibilityFilter(v)}
                  className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-4 py-2 border transition-all duration-200 ${
                    visibilityFilter === v
                      ? "bg-black text-white border-black"
                      : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                  }`}>
                  {v === "all" ? "All" : v === "active" ? "Visible" : "Hidden"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-black/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                {["Product", ...(isSuperAdmin ? ["Brand"] : []), "Category", "Price", "Total Stock", "Status", ""].map((h) => (
                  <th key={h}
                    className="px-7 py-3 text-left font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] font-normal whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={colCount}
                    className="px-7 py-12 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
                    {products.length === 0 ? "No products yet" : "No products match your filters"}
                  </td>
                </tr>
              )}

              {filtered.map((product) => {
                const isExpanded = expandedId === product.id;
                const isConfirmingDelete = confirmDeleteId === product.id;
                const isToggling = togglingId === product.id;

                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className={`transition-colors cursor-pointer ${
                        product.isActive ? "hover:bg-black/[0.015]" : "bg-[#fafafa] hover:bg-black/[0.02]"
                      }`}
                      onClick={() => {
                        if (isConfirmingDelete) return;
                        setExpandedId(isExpanded ? null : product.id);
                        setConfirmDeleteId(null);
                      }}
                    >
                      {/* Product */}
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 border border-black/10 overflow-hidden bg-[#f9f9f9] shrink-0 transition-opacity ${!product.isActive ? "opacity-40" : ""}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.imageSrc} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-[metropolis] text-[12px] transition-colors ${product.isActive ? "text-black" : "text-[#bbb]"}`}>
                                {product.name}
                              </p>
                              {!product.isActive && (
                                <span className="font-[metropolis] text-[8px] tracking-[0.18em] uppercase border border-black/20 px-2 py-0.5 text-[#bbb]">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-0.5">
                              {product.subcategory}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand — super-admin only */}
                      {isSuperAdmin && (
                        <td className="px-7 py-4">
                          <a href={`/brands/${product.brandSlug}`} target="_blank" rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-[metropolis] text-[11px] text-black hover:underline underline-offset-2">
                            {product.brandName}
                          </a>
                        </td>
                      )}

                      {/* Category */}
                      <td className="px-7 py-4 font-[metropolis] text-[11px] text-[#787878]">
                        {displayCategory(product.category)}
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

                      {/* Status */}
                      <td className="px-7 py-4">
                        <StockBadge qty={product.totalStock} />
                      </td>

                      {/* Actions */}
                      <td className="px-7 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>

                          {/* Hide / Unhide toggle */}
                          {!isConfirmingDelete && (
                            <button
                              type="button"
                              title={product.isActive ? "Hide product from shop" : "Make product visible"}
                              disabled={isToggling}
                              onClick={() => handleToggleVisibility(product)}
                              className="w-7 h-7 flex items-center justify-center text-[#bbb] hover:text-black transition-colors duration-150 disabled:opacity-30"
                            >
                              {product.isActive ? (
                                /* eye-off icon */
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              ) : (
                                /* eye icon */
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                              )}
                            </button>
                          )}

                          {/* Delete */}
                          {!isConfirmingDelete ? (
                            <button type="button" title="Delete product permanently"
                              onClick={() => setConfirmDeleteId(product.id)}
                              className="w-7 h-7 flex items-center justify-center text-[#bbb] hover:text-red-500 transition-colors duration-150">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => handleDelete(product.id)} disabled={deleting}
                                className="font-[metropolis] text-[9px] tracking-[0.12em] uppercase text-white bg-black px-2.5 py-1 hover:bg-red-600 transition-colors duration-150 disabled:opacity-50 whitespace-nowrap">
                                {deleting ? "…" : "Yes, delete"}
                              </button>
                              <button type="button" onClick={() => setConfirmDeleteId(null)}
                                className="font-[metropolis] text-[9px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-150">
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Expand chevron */}
                          {!isConfirmingDelete && (
                            <button type="button"
                              onClick={() => { setExpandedId(isExpanded ? null : product.id); setConfirmDeleteId(null); }}
                              className="w-7 h-7 flex items-center justify-center text-[#787878] hover:text-black transition-colors duration-150">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded stock editor */}
                    {isExpanded && (
                      <ExpandedStock key={`${product.id}-expand`} product={product} onSave={handleStockSave} />
                    )}
                  </React.Fragment>
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
