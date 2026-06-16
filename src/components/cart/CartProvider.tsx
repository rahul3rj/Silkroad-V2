"use client";

// CartProvider — mounts once in the layout.
// • If the user is logged in, loads their server cart and merges any guest items.
// • If the user logs out, clears the in-memory cart.
// • Keeps stock levels fresh on cart changes.

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);
  const onSignOut = useCartStore((s) => s.onSignOut);
  const refreshStock = useCartStore((s) => s.refreshStock);
  const items = useCartStore((s) => s.items);

  const prevStatusRef = useRef<string>("loading");

  useEffect(() => {
    if (status === "loading") return;

    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "authenticated" && session?.user?.id) {
      if (prevStatus === "unauthenticated") {
        // User just logged in — merge guest cart then load server cart
        mergeGuestCart();
      } else if (prevStatus === "loading") {
        // Page load with existing session — load server cart
        fetchCart();
      }
    }

    if (status === "unauthenticated" && prevStatus === "authenticated") {
      // User just logged out
      onSignOut();
    }
  }, [status, session, fetchCart, mergeGuestCart, onSignOut]);

  // Keep stock map fresh whenever items change
  useEffect(() => {
    if (items.length > 0) {
      refreshStock();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return <>{children}</>;
}
