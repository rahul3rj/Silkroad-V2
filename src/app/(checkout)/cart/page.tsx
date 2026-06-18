"use client";

import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/components/cart/CartItem";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CartPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.total);
  const itemCount = useCartStore((s) => s.itemCount);
  const clearCartFn = useCartStore((s) => s.clearCart);

  const shipping = subtotal >= 150 ? 0 : 9.99;
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, 150 - subtotal);

  return (
    <section className="w-full min-h-screen bg-white pt-16 pb-24">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-4 md:px-10 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
        >
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          Cart
        </span>
      </div>

      {/* ── Centered content wrapper ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10">

        {/* ── Page title row ── */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="font-[metropolis] text-[24px] md:text-[28px] tracking-[-0.01em] text-black">
              Your Bag
            </h1>
            {itemCount > 0 && (
              <span className="font-[metropolis] text-[11px] text-[#787878] tracking-wider">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            {items.length > 0 && (
              <button
                onClick={() => clearCartFn(isLoggedIn)}
                className="font-[metropolis] text-[9px] text-[#787878] tracking-[0.15em] uppercase hover:text-black transition-colors duration-200"
              >
                Clear Bag
              </button>
            )}
            <Link
              href="/new-in"
              className="font-[metropolis] text-[9px] text-[#787878] tracking-[0.15em] uppercase hover:text-black transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Free Shipping Banner ── */}
        {items.length > 0 && (
          <div className="border-b border-black/5 pb-5 mb-8">
            {subtotal < 150 ? (
              <div className="flex flex-col gap-2 w-full max-w-sm">
                <div className="flex justify-between items-center">
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
            ) : (
              <div className="flex items-center gap-2">
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
          </div>
        )}

        {/* ── Body ── */}
        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center text-center py-32 px-6">
            <div className="w-14 h-14 border border-black/10 flex items-center justify-center mb-7">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/25">
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
            <p className="font-[metropolis] text-[10px] tracking-[0.08em] text-[#787878] leading-relaxed mb-9 max-w-[260px]">
              Explore our curation to find your next luxury piece.
            </p>
            <Link
              href="/new-in"
              className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-10 py-4 hover:bg-black/80 transition-colors duration-300"
            >
              Explore New In
            </Link>
          </div>
        ) : (
          /* ── Items + Summary Grid ── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* ── Left: Items List ── */}
            <div className="divide-y divide-black/5 border-t border-black/5">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.size}`}
                  item={item}
                  dark={false}
                />
              ))}
            </div>

            {/* ── Right: Sticky Order Summary ── */}
            <div className="sticky top-24 border border-black/10">
              {/* Summary Header */}
              <div className="px-7 py-5 border-b border-black/10">
                <h2 className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black">
                  Order Summary
                </h2>
              </div>

              {/* Summary Rows */}
              <div className="px-7 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-[metropolis] text-[#787878] tracking-[0.12em] uppercase">
                    Subtotal
                  </span>
                  <span className="text-[10px] font-[metropolis] text-black tracking-wider">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-[metropolis] text-[#787878] tracking-[0.12em] uppercase">
                    Shipping
                  </span>
                  <span className="text-[10px] font-[metropolis] text-black tracking-wider">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-[metropolis] text-[#787878] tracking-[0.12em] uppercase">
                    Estimated Tax
                  </span>
                  <span className="text-[10px] font-[metropolis] text-[#787878] tracking-wider">
                    Calculated at checkout
                  </span>
                </div>

                {/* Divider + Total */}
                <div className="border-t border-black/8 pt-4 flex justify-between items-center">
                  <span className="text-[10px] font-[metropolisSemiBold] tracking-[0.18em] uppercase text-black">
                    Total
                  </span>
                  <span className="text-[11px] font-[metropolisSemiBold] tracking-wider text-black">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-7 pb-7 space-y-2">
                <Link
                  href="/checkout"
                  className="block w-full py-4 bg-black text-white text-[10px] tracking-[0.25em] font-[metropolisSemiBold] uppercase text-center hover:bg-black/80 transition-colors duration-300"
                >
                  Proceed to Checkout
                </Link>
                <p className="text-center text-[8px] font-[metropolis] text-[#787878] tracking-[0.1em] uppercase pt-1">
                  Secure &amp; encrypted checkout
                </p>
              </div>

              {/* Promo Code */}
              <div className="px-7 pb-7 border-t border-black/8 pt-5">
                <p className="text-[9px] font-[metropolisSemiBold] tracking-[0.18em] uppercase text-black mb-3">
                  Promo Code
                </p>
                <div className="flex gap-0">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 border border-black/15 border-r-0 px-4 py-3 text-[10px] font-[metropolis] tracking-wider text-black placeholder:text-[#bbb] outline-none focus:border-black/40 transition-colors duration-200 bg-white"
                  />
                  <button className="px-5 py-3 border border-black/15 text-[9px] font-[metropolisSemiBold] tracking-[0.18em] uppercase text-black hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
