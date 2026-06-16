"use client";

import type { CartItem as CartItemType } from "@/types/cart";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface CartItemProps {
  item: CartItemType;
  dark?: boolean;
}

export function CartItem({ item, dark = true }: CartItemProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const stockMap = useCartStore((s) => s.stockMap);

  const stockKey = `${item.productId}:${item.size}`;
  const availableStock = stockMap[stockKey];
  // If stock is known and we're already at max, disable +
  const atMaxStock = availableStock !== undefined && item.quantity >= availableStock;
  const outOfStock = availableStock !== undefined && availableStock === 0;

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.size, item.quantity - 1, isLoggedIn);
    } else {
      removeItem(item.productId, item.size, isLoggedIn);
    }
  };

  const handleIncrement = () => {
    if (atMaxStock) return;
    updateQuantity(item.productId, item.size, item.quantity + 1, isLoggedIn);
  };

  return (
    <div className={`flex gap-5 py-4 border-b last:border-b-0 group ${
      dark ? "border-zinc-900/60" : "border-black/5"
    }`}>
      {/* Product Image Thumbnail */}
      <Link
        href={`/product/${item.slug}`}
        className={`w-20 h-24 rounded-sm overflow-hidden shrink-0 block relative border ${
          dark ? "bg-zinc-900 border-zinc-900" : "bg-black/5 border-black/5"
        }`}
      >
        <img
          src={item.productImage}
          alt={item.productName}
          className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
        />
      </Link>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between text-sm py-0.5">
        <div>
          {/* Brand & Name */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-[metropolisSemiBold] text-[9px] tracking-[0.15em] uppercase text-zinc-500 mb-0.5">
                {item.brand}
              </p>
              <Link
                href={`/product/${item.slug}`}
                className={`font-[metropolis] text-[11px] tracking-wide leading-snug transition-colors duration-200 ${
                  dark ? "text-white hover:text-zinc-300" : "text-black hover:text-black/70"
                }`}
              >
                {item.productName}
              </Link>
            </div>
            {/* Price */}
            <p className={`font-[metropolis] text-[11px] tracking-wider pl-2 shrink-0 ${
              dark ? "text-white" : "text-black"
            }`}>
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>

          {/* Attributes */}
          <p className="text-zinc-500 font-[metropolis] text-[10px] tracking-wider mt-1.5 flex items-center gap-1.5">
            <span className="uppercase text-[9px] text-zinc-600">Size:</span>
            <span className={`font-medium ${dark ? "text-zinc-400" : "text-zinc-700"}`}>{item.size}</span>
          </p>

          {/* Out of stock warning */}
          {outOfStock && (
            <p className="text-[9px] font-[metropolis] text-red-500 tracking-wider mt-1">
              Out of stock
            </p>
          )}
          {/* At max stock warning */}
          {!outOfStock && atMaxStock && (
            <p className="text-[9px] font-[metropolis] text-amber-600 tracking-wider mt-1">
              Max available: {availableStock}
            </p>
          )}
        </div>

        {/* Quantity and Remove Action row */}
        <div className="flex justify-between items-center mt-3">
          {/* Quantity Selector */}
          <div className={`flex items-center border rounded-[3px] p-0.5 ${
            dark ? "bg-zinc-900 border-zinc-800/40" : "bg-black/5 border-black/10"
          }`}>
            {/* − button — always enabled (removes item if qty reaches 0) */}
            <button
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className={`w-5 h-5 flex items-center justify-center active:scale-75 transition-all duration-150 text-[10px] select-none ${
                dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
              }`}
            >
              —
            </button>

            <span className={`w-6 text-center text-[10px] font-[metropolis] tracking-wider select-none ${
              dark ? "text-white" : "text-black"
            }`}>
              {item.quantity}
            </span>

            {/* + button — disabled when at max stock */}
            <button
              onClick={handleIncrement}
              aria-label="Increase quantity"
              disabled={atMaxStock}
              aria-disabled={atMaxStock}
              title={atMaxStock ? `Only ${availableStock} available` : undefined}
              className={`w-5 h-5 flex items-center justify-center transition-all duration-150 text-[10px] select-none ${
                atMaxStock
                  ? "opacity-30 cursor-not-allowed"
                  : dark
                  ? "text-zinc-400 hover:text-white active:scale-75"
                  : "text-zinc-500 hover:text-black active:scale-75"
              }`}
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeItem(item.productId, item.size, isLoggedIn)}
            className={`text-[9px] font-[metropolisSemiBold] tracking-[0.15em] uppercase transition-all duration-200 ${
              dark ? "text-zinc-500 hover:text-red-400" : "text-black/50 hover:text-red-600"
            }`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
