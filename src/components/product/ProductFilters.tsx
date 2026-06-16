"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface FilterState {
  subcategories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
  sortBy: string;
}

const DEFAULT_FILTERS: FilterState = {
  subcategories: [],
  colors: [],
  sizes: [],
  priceRange: [0, 2000],
  sortBy: "newest",
};

interface ProductFiltersProps {
  subcategories: string[];
  /** Fired only when the user clicks "Apply Filters" */
  onChange?: (filters: FilterState) => void;
  resultCount?: number;
  searchLabel?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "popular", label: "Most Popular" },
];

const COLOR_OPTIONS = [
  { name: "Noir", hex: "#1a1a1a" },
  { name: "Ivory", hex: "#f5f0e8" },
  { name: "Camel", hex: "#c19a6b" },
  { name: "Sage", hex: "#8a9e7a" },
  { name: "Blush", hex: "#e8b4b8" },
  { name: "Bordeaux", hex: "#8b1a2e" },
  { name: "Forest", hex: "#2d4a3e" },
  { name: "Slate", hex: "#5a6472" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const MAX_PRICE = 2000;

export function ProductFilters({
  subcategories,
  onChange,
  resultCount,
  searchLabel,
}: ProductFiltersProps) {
  // ── Applied state (what the grid actually uses) ─────────────────
  const [applied, setApplied] = useState<FilterState>(DEFAULT_FILTERS);

  // ── Draft state (what the user is editing inside the drawer) ────
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTERS);

  // ── Drawer open/close ────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);
  const drawerBodyRef = useRef<HTMLDivElement>(null);

  // mounted guard — portals need client-side DOM
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── Subcategory pill filter (top bar) — synced with applied state ─
  // activeSubcat is the single-pill selection shown in the top bar.
  // It mirrors applied.subcategories[0] (or "View All" if empty).
  const activeSubcat =
    applied.subcategories.length === 0 ? "View All" : applied.subcategories[0];

  // ── Track navbar visibility to sync sticky top offset ────────────
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScrollRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 10) {
        setNavbarVisible(true);
      } else if (y < lastScrollRef.current) {
        setNavbarVisible(true);
      } else if (y > lastScrollRef.current) {
        setNavbarVisible(false);
      }
      lastScrollRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape key closes drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock BOTH html AND body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // When opening the drawer, seed draft from currently applied state
  const openDrawer = () => {
    setDraft({ ...applied });
    setDrawerOpen(true);
  };

  // Apply draft → applied, notify parent, close drawer
  // FIX: use draft as-is — no longer override subcategories with the top pill.
  // The top pill click already updates applied.subcategories directly.
  const applyFilters = () => {
    const next: FilterState = { ...draft };
    setApplied(next);
    onChange?.(next);
    closeDrawer();
  };

  // Clear all draft & applied
  const clearAll = () => {
    setDraft(DEFAULT_FILTERS);
    const next = { ...DEFAULT_FILTERS };
    setApplied(next);
    onChange?.(next);
  };

  // Subcategory pill click — applies immediately, also syncs draft
  const handleSubcatClick = (cat: string) => {
    const next: FilterState = {
      ...applied,
      subcategories: cat === "View All" ? [] : [cat],
    };
    setApplied(next);
    // Keep draft in sync so opening the drawer reflects the current state
    setDraft((d) => ({
      ...d,
      subcategories: cat === "View All" ? [] : [cat],
    }));
    onChange?.(next);
  };

  // Draft toggle helpers
  const toggleDraftColor = (name: string) =>
    setDraft((d) => ({
      ...d,
      colors: d.colors.includes(name)
        ? d.colors.filter((c) => c !== name)
        : [...d.colors, name],
    }));

  const toggleDraftSize = (size: string) =>
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(size)
        ? d.sizes.filter((s) => s !== size)
        : [...d.sizes, size],
    }));

  // Count of ALL applied non-default filters (for badge on Filters button)
  const appliedCount =
    applied.subcategories.length +
    applied.colors.length +
    applied.sizes.length +
    (applied.priceRange[0] !== 0 || applied.priceRange[1] !== MAX_PRICE
      ? 1
      : 0) +
    (applied.sortBy !== "newest" ? 1 : 0);

  // Draft count (for the Apply button label) — counts all non-default draft choices
  const draftCount =
    draft.subcategories.length +
    draft.colors.length +
    draft.sizes.length +
    (draft.priceRange[0] !== 0 || draft.priceRange[1] !== MAX_PRICE ? 1 : 0) +
    (draft.sortBy !== "newest" ? 1 : 0);

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div
        className="w-full flex flex-col border-b border-black/10 bg-white sticky z-30 transition-[top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ top: navbarVisible ? "64px" : "0px" }}
      >
        {/* Subcategory Pill Row */}
        <div className="w-full flex items-center px-10 pt-4 pb-3 overflow-x-auto hide-scrollbar gap-0">
          {subcategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSubcatClick(cat)}
              className={`shrink-0 px-5 py-1.5 text-[10px] tracking-[0.15em] font-[metropolis] uppercase transition-all duration-300 border mr-2 ${
                activeSubcat === cat
                  ? "border-black bg-black text-white"
                  : "border-black/20 text-black hover:border-black/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort + Results + Filters row */}
        <div className="w-full flex items-center justify-between px-10 py-3 border-t border-black/5">
          {/* Sort By (applied immediately, top bar) */}
          <div className="flex items-center gap-2 text-[10px] font-[metropolis] text-black tracking-[0.12em] uppercase">
            <span className="text-[#787878]">Sort By</span>
            <div className="relative flex items-center">
              <select
                value={applied.sortBy}
                onChange={(e) => {
                  const next = { ...applied, sortBy: e.target.value };
                  setApplied(next);
                  // Keep draft in sync too
                  setDraft((d) => ({ ...d, sortBy: e.target.value }));
                  onChange?.(next);
                }}
                className="bg-transparent border-none outline-none text-black font-[metropolis] text-[10px] tracking-[0.12em] uppercase cursor-pointer appearance-none pr-5"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <svg
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
                className="absolute right-0 pointer-events-none opacity-50"
              >
                <path
                  d="M1 1l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Results + Filters button */}
          <div className="flex items-center gap-5">
            {resultCount !== undefined && (
              <span className="text-[10px] font-[metropolis] text-[#787878] tracking-[0.12em]">
                {resultCount} results{searchLabel ? ` for ${searchLabel}` : ""}
              </span>
            )}

            <button
              onClick={openDrawer}
              className="flex items-center gap-2 text-[10px] font-[metropolisSemiBold] uppercase tracking-[0.18em] text-black hover:opacity-60 transition-opacity duration-300"
            >
              Filters
              {appliedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px] font-bold">
                  {appliedCount}
                </span>
              )}
              {/* Sliders icon */}
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <line
                  x1="0"
                  y1="2"
                  x2="16"
                  y2="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="11"
                  cy="2"
                  r="2"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <line
                  x1="0"
                  y1="7"
                  x2="16"
                  y2="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="5"
                  cy="7"
                  r="2"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <line
                  x1="0"
                  y1="12"
                  x2="16"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="11"
                  cy="12"
                  r="2"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Backdrop and Drawer Portal ───────────────────────────────── */}
      {mounted &&
        createPortal(
          <>
            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            <div
        onClick={closeDrawer}
        aria-hidden="true"
        style={{ pointerEvents: drawerOpen ? "auto" : "none" }}
        className={`fixed inset-0 z-[60] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawerOpen
            ? "bg-black/40 backdrop-blur-[2px]"
            : "bg-transparent backdrop-blur-none"
        }`}
      />

      {/* ── Filter Drawer ─────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-dvh w-[400px] max-w-[92vw] bg-white z-[70] flex flex-col shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Drawer Header ── */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
              Filters
            </h2>
            {draftCount > 0 && (
              <span className="text-[9px] font-[metropolis] text-[#787878] tracking-wider">
                ({draftCount} selected)
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            {draftCount > 0 && (
              <button
                onClick={() => setDraft(DEFAULT_FILTERS)}
                className="text-[9px] font-[metropolis] text-[#787878] tracking-[0.15em] uppercase hover:text-black transition-colors duration-200"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors duration-200"
              aria-label="Close filters"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Drawer Body — scrollable, touch scroll inside ── */}
        <div
          ref={drawerBodyRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="px-8 py-6 space-y-0">
            {/* ── Sort By ── */}
            <DrawerSection title="Sort By">
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setDraft((d) => ({ ...d, sortBy: o.value }))}
                    className={`px-3 py-3 text-[9px] tracking-[0.13em] font-[metropolis] uppercase text-left border transition-all duration-200 ${
                      draft.sortBy === o.value
                        ? "border-black bg-black text-white"
                        : "border-black/15 text-black hover:border-black/50"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </DrawerSection>

            {/* ── Category ── */}
            <DrawerSection title="Category">
              <div className="flex flex-wrap gap-2">
                {subcategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        subcategories:
                          cat === "View All"
                            ? []
                            : d.subcategories.includes(cat)
                              ? d.subcategories.filter((s) => s !== cat)
                              : [...d.subcategories, cat],
                      }))
                    }
                    className={`px-4 py-2 text-[9px] tracking-[0.15em] font-[metropolis] uppercase transition-all duration-200 border ${
                      (cat === "View All" &&
                        draft.subcategories.length === 0) ||
                      draft.subcategories.includes(cat)
                        ? "border-black bg-black text-white"
                        : "border-black/15 text-black hover:border-black/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </DrawerSection>

            {/* ── Color ── */}
            <DrawerSection title="Color">
              <div className="flex flex-wrap gap-4 pt-1">
                {COLOR_OPTIONS.map((color) => {
                  const selected = draft.colors.includes(color.name);
                  const isLight =
                    color.hex === "#f5f0e8" || color.hex === "#f5f0e0";
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggleDraftColor(color.name)}
                      title={color.name}
                      className={`block w-8 h-8 rounded-full border transition-all duration-200 relative ${
                        selected
                          ? "ring-2 ring-offset-2 ring-black scale-110"
                          : "hover:scale-105 border-black/10"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4l3 3 5-6"
                              stroke={isLight ? "#000" : "#fff"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </DrawerSection>

            {/* ── Size ── */}
            <DrawerSection title="Size">
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const selected = draft.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleDraftSize(size)}
                      className={`px-4 py-2.5 text-[10px] tracking-[0.15em] font-[metropolis] uppercase border transition-all duration-200 ${
                        selected
                          ? "border-black bg-black text-white"
                          : "border-black/20 text-black hover:border-black/60"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </DrawerSection>

            {/* ── Price Range ── */}
            <DrawerSection title="Price Range">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-[metropolis] text-black tracking-wider">
                    ${draft.priceRange[0]}
                  </span>
                  <span className="text-[10px] font-[metropolis] text-black tracking-wider">
                    $
                    {draft.priceRange[1] === MAX_PRICE
                      ? `${MAX_PRICE}+`
                      : draft.priceRange[1]}
                  </span>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    step={50}
                    value={draft.priceRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < draft.priceRange[1])
                        setDraft((d) => ({
                          ...d,
                          priceRange: [val, d.priceRange[1]],
                        }));
                    }}
                    className="w-full cursor-pointer accent-black"
                  />
                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    step={50}
                    value={draft.priceRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > draft.priceRange[0])
                        setDraft((d) => ({
                          ...d,
                          priceRange: [d.priceRange[0], val],
                        }));
                    }}
                    className="w-full cursor-pointer accent-black"
                  />
                </div>
              </div>
            </DrawerSection>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <div className="px-8 py-5 border-t border-black/10 shrink-0 space-y-2">
          <button
            onClick={applyFilters}
            className="w-full py-4 bg-black text-white text-[10px] tracking-[0.25em] font-[metropolisSemiBold] uppercase hover:bg-black/80 transition-colors duration-300"
          >
            Apply Filters{draftCount > 0 ? ` (${draftCount})` : ""}
          </button>
          {appliedCount > 0 && (
            <button
              onClick={clearAll}
              className="w-full py-3 text-black text-[9px] tracking-[0.2em] font-[metropolis] uppercase hover:opacity-50 transition-opacity duration-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
          </>,
          document.body
        )}
    </>
  );
}

// ── Collapsible section inside the drawer ───────────────────────────────────
function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-black/8 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-4"
      >
        <span className="text-[10px] font-[metropolisSemiBold] tracking-[0.22em] uppercase text-black">
          {title}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
