"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ProductData } from "@/types/product";
import { useBrands } from "@/hooks/useBrands";
import { ProductCard } from "@/components/product/ProductCard";
import { PageLoader } from "@/components/product/PageLoader";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import type { CartItem } from "@/types/cart";

// ── Accordion item ──────────────────────────────────────────────────────────
function AccordionRow({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-black/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <span className="font-[metropolisSemiBold] text-[10px] tracking-[0.2em] uppercase text-black">
          {label}
        </span>
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
          className="text-black/40 group-hover:text-black text-lg leading-none select-none"
        >
          +
        </span>
      </button>
      {open && children && (
        <div className="pb-4 font-[metropolis] text-[11px] text-[#787878] leading-relaxed tracking-wide">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Product Slider ──────────────────────────────────────────────────────────
// Uses scrollLeft + requestAnimationFrame easeOutExpo — no broken % math
function ProductSlider({
  products,
}: {
  products: ProductData[];
}) {
  const [page, setPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const PER_PAGE = 4;
  const totalPages = Math.ceil(products.length / PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, pi) =>
    products.slice(pi * PER_PAGE, (pi + 1) * PER_PAGE),
  );

  const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const slideTo = (target: number) => {
    const el = trackRef.current;
    if (!el || animating || target < 0 || target >= totalPages) return;

    const startX = el.scrollLeft;
    const endX = target * el.offsetWidth;
    const duration = 700;
    const t0 = performance.now();

    setAnimating(true);
    setPage(target);

    const step = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      el.scrollLeft = startX + (endX - startX) * easeOutExpo(t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.scrollLeft = endX;
        setAnimating(false);
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="w-full bg-white pb-16">
      <div className="relative">
        {/* ── Scroll track ── */}
        <div
          ref={trackRef}
          className="flex w-full"
          style={
            {
              overflowX: "scroll",
              scrollbarWidth: "none",
            } as React.CSSProperties
          }
        >
          {pages.map((pageProducts, pi) => (
            <div
              key={pi}
              className="shrink-0 px-10"
              style={{ minWidth: "100%" }}
            >
              <div className="grid grid-cols-4 gap-5">
                {pageProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className="min-w-0 overflow-hidden"
                    style={{
                      opacity: animating ? 0.88 : 1,
                      transform: animating ? "scale(0.984)" : "scale(1)",
                      transition: `opacity 0.4s ease ${idx * 0.05}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 0.05}s`,
                    }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ‹ Prev */}
        <button
          onClick={() => slideTo(page - 1)}
          aria-label="Previous"
          className="absolute left-4 top-[33vh] -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-black hover:text-white hover:scale-105 transition-all duration-300"
          style={{
            opacity: page === 0 ? 0 : 1,
            pointerEvents: page === 0 ? "none" : "auto",
          }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="mr-0.5">
            <path
              d="M7 1L1 7l6 6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* › Next */}
        <button
          onClick={() => slideTo(page + 1)}
          aria-label="Next"
          className="absolute right-4 top-[33vh] -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-black hover:text-white hover:scale-105 transition-all duration-300"
          style={{
            opacity: page === totalPages - 1 ? 0 : 1,
            pointerEvents: page === totalPages - 1 ? "none" : "auto",
          }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="ml-0.5">
            <path
              d="M1 1l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Dot pill indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => slideTo(i)}
              style={{
                width: i === page ? "20px" : "6px",
                height: "2px",
                background: i === page ? "#000" : "#d4d4d4",
                borderRadius: "1px",
                transition:
                  "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.productSlug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ProductData[]>([]);
  const { brands } = useBrands();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [readMore, setReadMore] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [addedStatus, setAddedStatus] = useState(false);

  // ── Per-product inventory map (size → stock) fetched on page load ──────────
  // This ensures out-of-stock is shown even when the item isn't in the cart.
  const [sizeStockMap, setSizeStockMap] = useState<Record<string, number>>({});

  // ── Wishlist state ──────────────────────────────────────────────────────────
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // ── Bottom Slider Tab State ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"you-may-like" | "recently-viewed">("you-may-like");
  const [recentlyViewed, setRecentlyViewed] = useState<ProductData[]>([]);

  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const addItem = useCartStore((s) => s.addItem);
  const stockMap = useCartStore((s) => s.stockMap);
  const openCart = useUIStore((s) => s.openCart);

  // Load the product by slug
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProduct(null);
    fetch(`/api/products/${productSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ProductData | null) => {
        if (active) setProduct(data);
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productSlug]);

  // Load related products (same category) once we know the product's category
  useEffect(() => {
    if (!product) return;
    let active = true;
    fetch(`/api/products?category=${product.category}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProductData[]) => {
        if (active) setRelated(data.filter((p) => p.slug !== productSlug));
      })
      .catch(() => {
        if (active) setRelated([]);
      });
    return () => {
      active = false;
    };
  }, [product, productSlug]);

  // Fetch stock levels for every size of this product
  useEffect(() => {
    if (!product || product.sizes.length === 0) return;
    let active = true;

    const items = product.sizes.map((size) => ({
      productId: product.id,
      size,
    }));

    fetch("/api/cart/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => (r.ok ? r.json() : { stock: {} }))
      .then((data: { stock: Record<string, number> }) => {
        if (active) setSizeStockMap(data.stock);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [product]);

  // Check if this product is already in the user's wishlist
  useEffect(() => {
    if (!isLoggedIn || !product) return;
    fetch("/api/wishlist", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items: Array<{ productId: string }> }) => {
        setWishlisted(data.items.some((i) => i.productId === product.id));
      })
      .catch(() => {});
  }, [isLoggedIn, product]);

  // Record this product view + fetch recently viewed list (logged-in users only)
  useEffect(() => {
    if (!isLoggedIn || !product) return;

    // Fire-and-forget: record the view (upsert + auto-prune to 8)
    fetch("/api/recently-viewed", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    }).catch(() => {});

    // Fetch the updated recently-viewed list for the tab
    fetch("/api/recently-viewed", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products: ProductData[] }) => {
        // Exclude the current product from the "recently viewed" slider
        setRecentlyViewed(data.products.filter((p) => p.slug !== product.slug));
      })
      .catch(() => {});
  }, [isLoggedIn, product]);

  // Toggle wishlist for the current product
  const handleWishlistToggle = useCallback(async () => {
    if (!product) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (wishlistLoading) return;

    setWishlistLoading(true);
    const nextState = !wishlisted;
    setWishlisted(nextState); // optimistic update

    try {
      if (nextState) {
        await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
      } else {
        await fetch(`/api/wishlist?productId=${product.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
    } catch {
      setWishlisted(!nextState); // revert on error
    } finally {
      setWishlistLoading(false);
    }
  }, [product, isLoggedIn, wishlisted, wishlistLoading, router]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    const sizeKey = `${product.id}:${selectedSize || "One Size"}`;
    const available = stockMap[sizeKey];
    if (available !== undefined && available === 0) return; // out of stock

    const itemToAdd: CartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.imageSrc,
      slug: product.slug,
      brand: product.brand,
      size: selectedSize || "One Size",
      quantity: 1,
      price:
        product.isSale && product.salePrice ? product.salePrice : product.price,
    };

    addItem(itemToAdd, isLoggedIn);
    setAddedStatus(true);

    setTimeout(() => {
      openCart();
      setAddedStatus(false);
    }, 450);
  };

  const brandLogo = brands.find((b) => b.slug === product?.brandSlug)?.logoUrl;

  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-16">
        <p className="font-[metropolis] text-[#aaa] text-sm tracking-wider">
          Product not found.
        </p>
      </section>
    );
  }

  const displayPrice =
    product.isSale && product.salePrice ? product.salePrice : product.price;

  // If only 1 image, repeat 3× as dummy so gallery layout is testable.
  // Use real images array when available; fall back to imageSrc only if images is empty.
  const rawImages =
    product.images?.filter(Boolean).length >= 1
      ? product.images.filter(Boolean)
      : [product.imageSrc, product.imageSrc, product.imageSrc];

  const descShort = product.description.slice(0, 160);
  const descFull = product.description;

  return (
    <main className="w-full bg-white pt-16">
      {/* ════════════ TWO-COLUMN LAYOUT ════════════ */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[55%_45%] items-start">
        {/* ── LEFT: Stacked images ── */}
        <div className="w-full bg-[#f7f6f5]">
          {rawImages.map((src, i) => (
            <div key={i} className="relative w-full">
              <span className="absolute top-5 left-5 z-10 font-[metropolis] text-[10px] tracking-[0.15em] text-white mix-blend-difference px-2 py-0.5 pointer-events-none">
                [{String(i + 1).padStart(2, "0")}]
              </span>
              <img
                src={src}
                alt={`${product.name} — view ${i + 1}`}
                className="w-full object-cover object-top"
                style={{ minHeight: "90vh" }}
              />
            </div>
          ))}
        </div>

        {/* ── RIGHT: Product info (sticky) ── */}
        <div className="sticky top-16 bg-white px-10 py-12 lg:px-14 lg:py-14">
          <p className="font-[metropolis] text-[10px] tracking-[0.25em] uppercase text-[#aaa] mb-3">
            {product.category}
          </p>

          <h1 className="font-[metropolisSemiBold] text-2xl md:text-3xl tracking-[0.04em] uppercase text-black leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-5">
            {product.isSale && product.salePrice && (
              <span className="font-[metropolis] text-sm text-[#aaa] line-through tracking-widest">
                ${product.price}.00
              </span>
            )}
            <span className="font-[metropolis] text-sm tracking-widest text-black">
              ${displayPrice}.00
            </span>
          </div>

          <div className="flex gap-3 mb-6">
            {product.colors.map((color) => (
              <span
                key={color.hex}
                title={color.name}
                className="w-4 h-4 rounded-full cursor-pointer ring-offset-2 hover:ring-2 shadow-sm transition-all duration-200"
                style={{
                  backgroundColor: color.hex,
                  ["--tw-ring-color" as string]: color.hex + "4d",
                }}
              />
            ))}
          </div>

          <div className="w-full h-px bg-black/8 mb-5" />

          {/* Brand row */}
          <div className="flex items-center justify-between mb-5">
            <span className="font-[metropolisSemiBold] text-[10px] tracking-[0.2em] uppercase text-black">
              Brand
            </span>
            <Link
              href={`/brands/${product.brandSlug}`}
              className="flex items-center gap-1.5 group/bl"
            >
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt={product.brand}
                  className="h-4 w-auto object-contain grayscale brightness-0 opacity-50 group-hover/bl:opacity-100 transition-opacity duration-200"
                />
              ) : (
                <span className="font-[metropolisSemiBold] text-[9px] tracking-[0.2em] uppercase text-[#787878] group-hover/bl:text-black transition-colors duration-200">
                  {product.brand}
                </span>
              )}
              <svg
                width="5"
                height="9"
                viewBox="0 0 5 9"
                fill="none"
                className="text-[#aaa] group-hover/bl:text-black transition-colors duration-200"
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

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.2em] uppercase text-black">
                  Size
                </p>
                {sizeError && (
                  <span className="font-[metropolisSemiBold] text-[9px] tracking-wider uppercase text-red-500 animate-pulse">
                    Please select a size
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const stockKey = `${product.id}:${sz}`;
                  // Prefer the live stockMap from cartStore if present (post-cart-load),
                  // otherwise fall back to the product-page stock fetch.
                  const stockLevel =
                    stockMap[stockKey] !== undefined
                      ? stockMap[stockKey]
                      : sizeStockMap[stockKey];
                  const isSizeOOS = stockLevel !== undefined && stockLevel === 0;

                  return (
                    <button
                      key={sz}
                      disabled={isSizeOOS}
                      onClick={() => {
                        if (isSizeOOS) return;
                        setSelectedSize(sz);
                        setSizeError(false);
                      }}
                      title={isSizeOOS ? "Out of stock" : sz}
                      className={`relative w-10 h-10 text-[10px] font-[metropolis] tracking-widest uppercase border transition-all duration-200 overflow-hidden ${
                        isSizeOOS
                          ? "border-black/10 text-black/20 cursor-not-allowed bg-[#fafafa]"
                          : selectedSize === sz
                            ? "border-black bg-black text-white"
                            : sizeError
                              ? "border-red-400 text-red-500 hover:border-black hover:text-black"
                              : "border-black/20 text-black/60 hover:border-black hover:text-black"
                      }`}
                    >
                      {sz}
                      {isSizeOOS && (
                        /* diagonal strikethrough line for out-of-stock sizes */
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(to top right, transparent calc(50% - 0.5px), rgba(0,0,0,0.15) calc(50% - 0.5px), rgba(0,0,0,0.15) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart + Wishlist Heart */}
          {(() => {
            const sizeKey = `${product.id}:${selectedSize || "One Size"}`;
            // Use cartStore stockMap first (more up-to-date after cart ops),
            // fall back to the product-page stock fetch.
            const available =
              stockMap[sizeKey] !== undefined
                ? stockMap[sizeKey]
                : sizeStockMap[sizeKey];
            const isOutOfStock = available !== undefined && available === 0;
            return (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 font-[metropolisSemiBold] text-[11px] tracking-[0.25em] uppercase py-4 transition-all duration-300 ${
                    isOutOfStock
                      ? "bg-black/20 text-white/60 cursor-not-allowed"
                      : addedStatus
                        ? "bg-zinc-800 text-zinc-300 scale-[0.985] cursor-default"
                        : sizeError
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.15)]"
                          : "bg-black text-white hover:bg-black/85 active:scale-[0.99]"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : addedStatus
                      ? "Added to Bag"
                      : "Add to Bag"}
                </button>

                {/* Wishlist heart button */}
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  title={
                    !isLoggedIn
                      ? "Sign in to save to wishlist"
                      : wishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                  }
                  className={`w-14 flex items-center justify-center border transition-all duration-300 group ${
                    wishlisted
                      ? "border-rose-400 bg-rose-50 hover:border-rose-500 hover:bg-rose-100"
                      : "border-black/20 hover:border-black/50 hover:bg-black/[0.02]"
                  } ${wishlistLoading ? "opacity-50 cursor-default" : ""}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={wishlisted ? "#f43f5e" : "none"}
                    className={`transition-all duration-300 ${
                      wishlisted
                        ? "text-rose-500 scale-110"
                        : "text-black/40 group-hover:text-black/70 group-hover:scale-105"
                    }`}
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                      stroke={wishlisted ? "#f43f5e" : "currentColor"}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })()}

          <p className="font-[metropolis] text-[10px] text-[#aaa] leading-relaxed tracking-wide mb-6">
            Our Digital Concierge is available if you have any question on this
            product.{" "}
            <a
              href="/contact"
              className="underline underline-offset-2 hover:text-black transition-colors duration-200"
            >
              Contact us
            </a>
          </p>

          {/* Description */}
          <div className="mb-6">
            <p className="font-[metropolis] text-[11px] text-[#555] leading-relaxed tracking-wide">
              {readMore ? descFull : descShort}
              {descFull.length > 160 && !readMore && "…"}
            </p>
            {descFull.length > 160 && (
              <button
                onClick={() => setReadMore((r) => !r)}
                className="font-[metropolis] text-[11px] tracking-wider text-black underline underline-offset-2 mt-2"
              >
                {readMore ? "Show Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Accordion */}
          <div className="border-b border-black/10 mb-4">
            <AccordionRow label="Product Features">
              <ul className="list-disc pl-4 space-y-1">
                {product.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </AccordionRow>
            <AccordionRow label="Fabric Care">
              Dry clean or hand wash in cold water. Do not tumble dry. Store in
              a cool, dry place away from direct sunlight.
            </AccordionRow>
            <AccordionRow label="Delivery & Returns">
              Enjoy complimentary standard shipping on orders over $150. Returns are accepted within 14 days of delivery.
              <br />
              <Link 
                href="/delivery-and-returns" 
                className="inline-block mt-3 font-[metropolis] text-[10px] tracking-wider text-black underline underline-offset-2 hover:text-black/60 transition-colors"
              >
                View full policy
              </Link>
            </AccordionRow>
            <AccordionRow label="Need Help?">
              Contact our concierge team via live chat, email or phone for
              styling advice and sizing support.
            </AccordionRow>
          </div>
        </div>
      </div>

      {/* ════════════ SLIDER TABS ════════════ */}
      {(related.length > 0 || recentlyViewed.length > 0 || isLoggedIn) && (
        <div className="w-full pt-16 bg-white border-t border-black/8">
          <div className="flex justify-center gap-10 mb-10">
            <button
              onClick={() => setActiveTab("you-may-like")}
              className={`font-[metropolis] text-[11px] tracking-[0.25em] uppercase pb-2 transition-all duration-300 relative ${
                activeTab === "you-may-like" ? "text-black" : "text-[#aaa] hover:text-black/70"
              }`}
            >
              You May Also Like
              {activeTab === "you-may-like" && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("recently-viewed")}
              className={`font-[metropolis] text-[11px] tracking-[0.25em] uppercase pb-2 transition-all duration-300 relative ${
                activeTab === "recently-viewed" ? "text-black" : "text-[#aaa] hover:text-black/70"
              }`}
            >
              Recently Viewed
              {activeTab === "recently-viewed" && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black" />
              )}
            </button>
          </div>
          {activeTab === "you-may-like" ? (
            <ProductSlider key="you-may-like" products={[...related].reverse()} />
          ) : isLoggedIn ? (
            recentlyViewed.length > 0 ? (
              <ProductSlider key="recently-viewed" products={recentlyViewed} />
            ) : (
              <div className="w-full pb-16 flex items-center justify-center">
                <p className="font-[metropolis] text-[11px] tracking-[0.2em] uppercase text-[#bbb]">
                  No recently viewed items yet
                </p>
              </div>
            )
          ) : (
            <div className="w-full pb-16 flex items-center justify-center gap-2">
              <p className="font-[metropolis] text-[11px] tracking-[0.2em] uppercase text-[#bbb]">
                <a href="/login" className="underline underline-offset-2 hover:text-black transition-colors duration-200">
                  Sign in
                </a>{" "}
                to see your recently viewed items
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
