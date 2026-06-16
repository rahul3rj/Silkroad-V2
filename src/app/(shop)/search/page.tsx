// /search — Search page with two states:
// 1. Empty state: shows curated categories ("Iconic Pieces for Her/Him")
// 2. Results state: shows filtered product grid with sort + filters bar
//
// Products come from /api/products (live DB) — Fuse and suggestions are built
// from the API response so newly added products are always searchable.

"use client";

import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Fuse from "fuse.js";
import {
  ProductFilters,
  FilterState,
} from "@/components/product/ProductFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { PageLoader } from "@/components/product/PageLoader";
import type { ProductData } from "@/types/product";

// ─── Filter logic ─────────────────────────────────────────────────────────────
function applyFilters(
  products: ProductData[],
  filters: FilterState,
): ProductData[] {
  let result = [...products];

  if (filters.subcategories.length > 0) {
    result = result.filter((p) =>
      filters.subcategories.some(
        (sub) =>
          p.subcategory.toLowerCase() === sub.toLowerCase() ||
          p.category.toLowerCase() === sub.toLowerCase(),
      ),
    );
  }

  if (filters.colors.length > 0) {
    result = result.filter((p) =>
      p.colors.some((c) => filters.colors.includes(c.name)),
    );
  }

  if (filters.sizes.length > 0) {
    result = result.filter((p) =>
      p.sizes.some((s) => filters.sizes.includes(s)),
    );
  }

  result = result.filter(
    (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
  );

  switch (filters.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      break;
  }

  return result;
}

// ─── Subcategory list for search results ─────────────────────────────────────
const SEARCH_SUBCATEGORIES = [
  "View All",
  "Women",
  "Men",
  "Bags",
  "Dresses",
  "Suits",
  "Blazers",
  "Outerwear",
  "Knitwear",
];

// ─── Suggestion types ─────────────────────────────────────────────────────────
interface Suggestion {
  text: string;
  type: "brand" | "category" | "product";
  matches?: [number, number][];
}

interface SuggestionItem {
  text: string;
  type: Suggestion["type"];
}

// Build deduplicated suggestion list from live product data
function buildSuggestions(products: ProductData[]): SuggestionItem[] {
  const seen = new Set<string>();
  const items: SuggestionItem[] = [];

  const add = (text: string, type: SuggestionItem["type"]) => {
    const key = `${type}:${text.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ text, type });
    }
  };

  // Brands first (highest priority in dropdown)
  [...new Set(products.map((p) => p.brand))].forEach((b) => add(b, "brand"));
  // Subcategories
  [...new Set(products.map((p) => p.subcategory))].forEach((c) => add(c, "category"));
  // Tags
  [...new Set(products.flatMap((p) => p.tags))].forEach((t) => add(t, "category"));
  // Product names
  products.forEach((p) => add(p.name, "product"));

  return items;
}

// Highlight matched portion using Fuse indices, fallback to substring matching
function HighlightMatch({
  text,
  matches,
  fallbackQuery,
}: {
  text: string;
  matches?: [number, number][];
  fallbackQuery: string;
}) {
  if (!matches || matches.length === 0) {
    const q = fallbackQuery.trim();
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        <span className="font-[metropolisSemiBold]">{text.slice(0, idx + q.length)}</span>
        <span className="text-black/40">{text.slice(idx + q.length)}</span>
      </span>
    );
  }

  const elements: React.ReactNode[] = [];
  let lastIdx = 0;
  const sortedMatches = [...matches].sort((a, b) => a[0] - b[0]);

  sortedMatches.forEach(([start, end], i) => {
    if (start > lastIdx) {
      elements.push(
        <span key={`unmatched-${i}`} className="text-black/40">
          {text.slice(lastIdx, start)}
        </span>
      );
    }
    elements.push(
      <span key={`matched-${i}`} className="font-[metropolisSemiBold]">
        {text.slice(start, end + 1)}
      </span>
    );
    lastIdx = end + 1;
  });

  if (lastIdx < text.length) {
    elements.push(
      <span key="suffix" className="text-black/40">
        {text.slice(lastIdx)}
      </span>
    );
  }

  return <span>{elements}</span>;
}

// ─── Animated search input with autocomplete dropdown ────────────────────────
function SearchInput({
  value,
  onChange,
  onClear,
  suggestions,
  onPickSuggestion,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  suggestions: Suggestion[];
  onPickSuggestion: (text: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(suggestions.length > 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(-1);
  }, [suggestions]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      onPickSuggestion(suggestions[activeIdx].text);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto relative group/search">
      <input
        ref={inputRef}
        id="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Search"
        autoComplete="off"
        spellCheck={false}
        className="w-full px-1 bg-transparent border-b border-black/40 focus:border-black outline-none py-2 px-0 text-[18px] font-[metropolis] text-black placeholder:text-black/40 tracking-wide transition-colors duration-300 pr-8"
      />

      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-200"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black scale-x-0 group-focus-within/search:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left" />

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-[100] overflow-hidden">
          <ul role="listbox">
            {suggestions.map((s, i) => (
              <li
                key={s.text}
                role="option"
                aria-selected={i === activeIdx}
                onMouseDown={() => {
                  onPickSuggestion(s.text);
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100 ${
                  i === activeIdx ? "bg-black/[0.04]" : "hover:bg-black/[0.02]"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 opacity-30">
                  <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="font-[metropolis] text-[13px] tracking-wide text-black">
                  <HighlightMatch text={s.text} matches={s.matches} fallbackQuery={value} />
                </span>
                {s.type === "brand" && (
                  <span className="ml-auto font-[metropolis] text-[9px] tracking-[0.2em] text-black/25 uppercase shrink-0">
                    Brand
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-black/[0.06] px-4 py-3">
            <Link
              href="/brands"
              onMouseDown={(e) => e.preventDefault()}
              className="font-[metropolis] text-[11px] tracking-[0.18em] uppercase text-black underline underline-offset-2 hover:opacity-50 transition-opacity duration-200"
            >
              Visit Brands
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label, index }: { label: string; index: string }) {
  return (
    <div className="w-full flex items-center justify-between mb-6 px-10">
      <span className="font-[metropolis] text-black text-[13px] tracking-wide">{label}</span>
      <span className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] text-[#787878]">[ {index} ]</span>
    </div>
  );
}

function ShowMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center mt-12 mb-4">
      <button
        onClick={onClick}
        className="premium-pill-btn group/btn relative overflow-hidden select-none text-center"
      >
        <div className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
        <div className="relative z-10 pointer-events-none mix-blend-difference text-white flex justify-center items-center overflow-hidden h-[22px]">
          <div className="relative overflow-hidden h-full flex flex-col justify-start">
            <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">Show More</span>
            <span className="absolute left-0 top-0 block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover/btn:translate-y-0">Show More</span>
          </div>
        </div>
      </button>
    </div>
  );
}

type SearchPhase = "idle" | "exiting" | "loading" | "entering";

// ─── Inner component (needs Suspense because of useSearchParams) ──────────────
function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") ?? "";

  // Live DB product catalogue — loaded once on mount
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProductData[]) => setAllProducts(data))
      .catch(() => setAllProducts([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  // Fuse index — rebuilt whenever the catalogue changes
  const productFuse = useMemo(
    () =>
      new Fuse(allProducts, {
        keys: [
          { name: "brand", weight: 1.0 },
          { name: "subcategory", weight: 0.8 },
          { name: "category", weight: 0.7 },
          { name: "name", weight: 0.6 },
          { name: "tags", weight: 0.4 },
          { name: "description", weight: 0.2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [allProducts],
  );

  // Suggestion Fuse — rebuilt whenever catalogue changes
  const { suggestionItems, suggestionFuse } = useMemo(() => {
    const items = buildSuggestions(allProducts);
    const fuse = new Fuse(items, {
      keys: ["text"],
      threshold: 0.4,
      ignoreLocation: true,
      includeMatches: true,
      includeScore: true,
    });
    return { suggestionItems: items, suggestionFuse: fuse };
  }, [allProducts]);

  const searchProducts = useCallback(
    (query: string): ProductData[] => {
      if (!query.trim()) return [];
      return productFuse.search(query.trim()).map((r) => r.item);
    },
    [productFuse],
  );

  const getSuggestions = useCallback(
    (q: string): Suggestion[] => {
      const raw = q.trim();
      if (!raw || suggestionItems.length === 0) return [];
      const results = suggestionFuse.search(raw);
      return [...results]
        .sort((a, b) => {
          const scoreA = a.score ?? 0;
          const scoreB = b.score ?? 0;
          if (Math.abs(scoreA - scoreB) > 0.15) return scoreA - scoreB;
          const typePriority = { brand: 0, category: 1, product: 2 };
          return typePriority[a.item.type] - typePriority[b.item.type];
        })
        .slice(0, 5)
        .map((r) => {
          const textMatch = r.matches?.find((m) => m.key === "text");
          return {
            text: r.item.text,
            type: r.item.type,
            matches: textMatch?.indices as [number, number][] | undefined,
          };
        });
    },
    [suggestionFuse, suggestionItems],
  );

  const [query, setQuery] = useState(initialQ);
  const [committedQuery, setCommittedQuery] = useState(initialQ);
  const [filters, setFilters] = useState<FilterState>({
    subcategories: [],
    colors: [],
    sizes: [],
    priceRange: [0, 2000],
    sortBy: "newest",
  });
  const [visibleCount, setVisibleCount] = useState(8);
  const [phase, setPhase] = useState<SearchPhase>("idle");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const initialRender = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchedTrim = useRef(initialQ.trim());
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSearchTransition = useCallback(
    (nextQuery: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setPhase("exiting");
      debounceRef.current = setTimeout(() => {
        setCommittedQuery(nextQuery);
        setVisibleCount(8);
        setPhase("loading");
        const params = new URLSearchParams(window.location.search);
        if (nextQuery.trim()) params.set("q", nextQuery.trim());
        else params.delete("q");
        router.replace(`/search?${params.toString()}`, { scroll: false });
        debounceRef.current = setTimeout(() => {
          setPhase("entering");
          debounceRef.current = setTimeout(() => setPhase("idle"), 580);
        }, 320);
      }, 280);
    },
    [router],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuggestions(getSuggestions(query));
  }, [query, getSuggestions]);

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed === lastSearchedTrim.current) return;
      lastSearchedTrim.current = trimmed;
      triggerSearchTransition(trimmed);
    }, 500);
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleClear = () => { setQuery(""); setSuggestions([]); };
  const handlePickSuggestion = (text: string) => {
    setQuery(text);
    setSuggestions([]);
    const trimmed = text.trim();
    lastSearchedTrim.current = trimmed;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    triggerSearchTransition(trimmed);
  };
  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f);
    setVisibleCount(8);
  }, []);

  const hasQuery = committedQuery.trim().length > 0;
  const rawResults = hasQuery ? searchProducts(committedQuery) : [];
  const results = applyFilters(rawResults, filters);
  const visibleResults = results.slice(0, visibleCount);

  const contentClass =
    phase === "exiting" ? "search-content-exit" :
    phase === "loading" ? "opacity-0 pointer-events-none" :
    phase === "entering" ? "search-content-enter" : "";

  // Empty-state products from live catalogue
  const womenProducts = useMemo(
    () => allProducts.filter((p) => p.category === "women").slice(0, 4),
    [allProducts],
  );
  const menProducts = useMemo(
    () => allProducts.filter((p) => p.category === "men").slice(0, 4),
    [allProducts],
  );

  if (catalogLoading) return <PageLoader />;

  return (
    <section className="page-content-enter">
      <div className={`pt-24 ${hasQuery ? "pb-6" : "pb-10"} flex justify-center px-10`}>
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={handleClear}
          suggestions={suggestions}
          onPickSuggestion={handlePickSuggestion}
        />
      </div>

      <div className="relative min-h-[60vh]">
        {phase === "loading" && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-24 bg-white search-loader-enter">
            <img src="/loader.svg" alt="Searching…" className="w-10 h-10 opacity-80" />
          </div>
        )}

        <div className={contentClass}>
          {hasQuery ? (
            <>
              <ProductFilters
                subcategories={SEARCH_SUBCATEGORIES}
                onChange={handleFiltersChange}
                resultCount={results.length}
                searchLabel={committedQuery.trim()}
              />
              <div className="px-10 pt-8 pb-4 flex-1">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <p className="font-[metropolis] text-[#787878] text-[13px] tracking-widest uppercase mb-2">
                      No results found
                    </p>
                    <p className="font-[metropolis] text-[#aaa] text-xs">
                      Try a different search term or browse our collections
                    </p>
                    <Link
                      href="/new-in"
                      className="mt-8 text-[10px] font-[metropolisSemiBold] tracking-[0.22em] uppercase text-black border-b border-black pb-0.5 hover:opacity-50 transition-opacity duration-200"
                    >
                      Browse New In
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-x-5 gap-y-12">
                      {visibleResults.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                    {visibleCount < results.length && (
                      <ShowMoreButton onClick={() => setVisibleCount((c) => c + 8)} />
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <section className="mb-12">
                <SectionHeader label="Iconic Pieces for Her" index="01" />
                <div className="px-10 grid grid-cols-4 gap-x-5 gap-y-10">
                  {womenProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <SectionHeader label="Iconic Pieces for Him" index="02" />
                <div className="px-10 grid grid-cols-4 gap-x-5 gap-y-10">
                  {menProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>

              <div className="flex justify-center mt-4 mb-16">
                <Link href="/new-in" className="premium-pill-btn group/btn relative overflow-hidden select-none text-center">
                  <div className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
                  <div className="relative z-10 pointer-events-none mix-blend-difference text-white flex justify-center items-center overflow-hidden h-[22px]">
                    <div className="relative overflow-hidden h-full flex flex-col justify-start">
                      <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">Discover the Collection</span>
                      <span className="absolute left-0 top-0 block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover/btn:translate-y-0">Discover the Collection</span>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
