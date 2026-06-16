"use client";

import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { CartItem } from "./CartItem";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function CartDrawer() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const cartOpen = useUIStore((s) => s.cartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.total);
  const itemCount = useCartStore((s) => s.itemCount);
  const clearCartFn = useCartStore((s) => s.clearCart);

  const drawerBodyRef = useRef<HTMLDivElement>(null);

  // mounted guard — portals need client-side DOM
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const shipping = subtotal >= 150 ? 0 : 9.99;
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, 150 - subtotal);

  // Lock body scroll when open
  useEffect(() => {
    if (cartOpen) {
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
  }, [cartOpen]);

  // Escape key closes drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      {/* Backdrop and Drawer Portal */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              onClick={closeCart}
              aria-hidden="true"
              style={{ pointerEvents: cartOpen ? "auto" : "none" }}
              className={`fixed inset-0 z-[60] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                cartOpen
                  ? "bg-black/40 backdrop-blur-[2px]"
                  : "bg-transparent backdrop-blur-none"
              }`}
            />

            {/* Drawer Panel */}
            <div
              className={`fixed top-0 right-0 h-dvh w-[400px] max-w-[92vw] bg-white z-[70] flex flex-col shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                cartOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
              Your Bag
            </h2>
            {itemCount > 0 && (
              <span className="text-[9px] font-[metropolis] text-[#787878] tracking-wider">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            {items.length > 0 && (
              <button
                onClick={() => clearCartFn(isLoggedIn)}
                className="text-[9px] font-[metropolis] text-[#787878] tracking-[0.15em] uppercase hover:text-black transition-colors duration-200"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors duration-200"
              aria-label="Close cart"
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

        {/* ── Free Shipping Progress Bar ── */}
        {subtotal > 0 && subtotal < 150 && (
          <div className="px-8 py-4 border-b border-black/5 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-[metropolis] text-[#787878] tracking-[0.12em] uppercase">
                Free shipping
              </span>
              <span className="text-[9px] font-[metropolis] text-black tracking-wider">
                ${freeShippingRemaining.toFixed(2)} away
              </span>
            </div>
            <div className="w-full h-[1px] bg-black/10 relative">
              <div
                className="absolute left-0 top-0 h-full bg-black transition-all duration-500"
                style={{ width: `${Math.min((subtotal / 150) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {subtotal >= 150 && items.length > 0 && (
          <div className="px-8 py-3.5 border-b border-black/5 shrink-0 flex items-center gap-2">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[9px] font-[metropolis] text-black tracking-[0.12em] uppercase">
              You qualify for free shipping
            </span>
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div
          ref={drawerBodyRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {items.length === 0 ? (
            /* ── Empty State ── */
            <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-12 h-12 border border-black/10 flex items-center justify-center mb-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/30">
                  <path
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
                Your Bag is Empty
              </p>
              <p className="font-[metropolis] text-[10px] tracking-[0.08em] text-[#787878] leading-relaxed mb-8 max-w-[220px]">
                Explore our curation to find your next luxury piece.
              </p>
              <button
                onClick={closeCart}
                className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-8 py-3.5 hover:bg-black/80 transition-colors duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* ── Items List ── */
            <div className="px-8 py-6 divide-y divide-black/5">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.size}`} item={item} dark={false} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer Summary ── */}
        {items.length > 0 && (
          <div className="px-8 py-6 border-t border-black/10 shrink-0 space-y-3">
            {/* Subtotal row */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-[metropolis] text-[#787878] tracking-[0.12em] uppercase">
                Subtotal
              </span>
              <span className="text-[10px] font-[metropolis] text-black tracking-wider">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {/* Shipping row */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-[metropolis] text-[#787878] tracking-[0.12em] uppercase">
                Shipping
              </span>
              <span className="text-[10px] font-[metropolis] text-black tracking-wider">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {/* Divider */}
            <div className="border-t border-black/8 pt-3 flex justify-between items-center">
              <span className="text-[10px] font-[metropolisSemiBold] tracking-[0.18em] uppercase text-black">
                Total
              </span>
              <span className="text-[10px] font-[metropolisSemiBold] tracking-wider text-black">
                ${total.toFixed(2)}
              </span>
            </div>
            {/* CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full mt-1 py-4 bg-black text-white text-[10px] tracking-[0.25em] font-[metropolisSemiBold] uppercase text-center hover:bg-black/80 transition-colors duration-300"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-3 text-black text-[9px] tracking-[0.2em] font-[metropolis] uppercase hover:opacity-50 transition-opacity duration-200"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
          </>,
          document.body
        )}
    </>
  );
}
