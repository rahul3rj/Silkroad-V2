"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AccountShell } from "@/components/account/AccountShell";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/types/cart";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WishlistItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  isSale: boolean;
  image: string;
  inStock: boolean;
  addedAt: string;
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="border border-black/8 flex gap-4 p-4 animate-pulse">
      <div className="w-20 h-24 bg-black/5 shrink-0" />
      <div className="flex-1 flex flex-col gap-2 py-0.5">
        <div className="h-2 bg-black/6 rounded w-1/3" />
        <div className="h-3 bg-black/8 rounded w-3/4" />
        <div className="h-2 bg-black/5 rounded w-1/4 mt-1" />
        <div className="h-2 bg-black/5 rounded w-1/5 mt-auto" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const isLoggedIn = !!session?.user?.id;

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch wishlist from DB
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setItems(data.items as WishlistItem[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  // Remove an item from the wishlist
  const handleRemove = async (productId: string, itemId: string) => {
    setRemovingId(itemId);
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    } catch {
      // silently ignore
    } finally {
      setRemovingId(null);
    }
  };

  // Add to cart from wishlist
  const handleAddToBag = (item: WishlistItem) => {
    if (!item.inStock) return;

    const cartItem: CartItem = {
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      slug: item.slug,
      brand: item.brand,
      size: "One Size",
      quantity: 1,
      price: item.price,
    };

    addItem(cartItem, isLoggedIn);
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  // While session is loading, show skeleton
  if (status === "loading" || (isLoggedIn && loading)) {
    return (
      <AccountShell active="/wishlist" breadcrumb="My Wishlist" title="My Account">
        <div className="border-b border-black/8 pb-5 mb-8 flex items-center justify-between">
          <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
            My Wishlist
          </h2>
          <span className="w-12 h-2 bg-black/6 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell active="/wishlist" breadcrumb="My Wishlist" title="My Account">
      {/* Section header */}
      <div className="border-b border-black/8 pb-5 mb-8 flex items-center justify-between">
        <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
          My Wishlist
        </h2>
        <span className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="w-12 h-12 border border-black/10 flex items-center justify-center mx-auto mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/30">
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
            Your wishlist is empty
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mb-8 max-w-xs mx-auto">
            Save pieces you love by tapping the heart icon on any product page.
          </p>
          <Link
            href="/"
            className="inline-block px-10 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 transition-all duration-300"
          >
            Discover Pieces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const isRemoving = removingId === item.id;
            const isAdded = addedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`border border-black/8 group hover:border-black/20 transition-all duration-300 flex gap-4 p-4 ${
                  isRemoving ? "opacity-40 pointer-events-none scale-[0.99]" : ""
                }`}
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.slug}`}
                  className="w-20 h-24 bg-black/5 shrink-0 overflow-hidden block relative"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-700"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="font-[metropolis] text-[8px] tracking-[0.15em] uppercase text-black/50">
                        Sold Out
                      </span>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                  <div>
                    <p className="font-[metropolisSemiBold] text-[9px] tracking-[0.15em] uppercase text-[#787878]">
                      {item.brand}
                    </p>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-[metropolis] text-[12px] text-black tracking-wide leading-snug mt-0.5 hover:opacity-60 transition-opacity duration-200 line-clamp-2 block"
                    >
                      {item.name}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      {item.isSale && item.originalPrice > item.price && (
                        <span className="font-[metropolis] text-[10px] text-[#aaa] line-through tracking-wider">
                          ${item.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <p
                        className={`font-[metropolis] text-[12px] tracking-wider ${
                          item.isSale ? "text-rose-600" : "text-black"
                        }`}
                      >
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {item.inStock ? (
                        <button
                          onClick={() => handleAddToBag(item)}
                          className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase border px-3 py-1.5 transition-all duration-200 ${
                            isAdded
                              ? "border-black bg-black text-white"
                              : "border-black/15 text-black hover:bg-black hover:text-white hover:border-black"
                          }`}
                        >
                          {isAdded ? "Added ✓" : "Add to Bag"}
                        </button>
                      ) : (
                        <button
                          className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878] border border-black/10 px-3 py-1.5 cursor-not-allowed"
                          disabled
                        >
                          Sold Out
                        </button>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.productId, item.id)}
                        aria-label="Remove from wishlist"
                        className="w-7 h-7 flex items-center justify-center text-black/25 hover:text-rose-500 transition-colors duration-200"
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M1 1l10 10M11 1L1 11"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
