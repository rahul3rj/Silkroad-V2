// src/store/cartStore.ts
// Hybrid cart store — Zustand with localStorage persistence.
//
// ┌─ Guest (not logged in) ──────────────────────────────────────────────────┐
// │  All mutations are local-only (localStorage via zustand persist).        │
// └─────────────────────────────────────────────────────────────────────────┘
// ┌─ Logged-in user ─────────────────────────────────────────────────────────┐
// │  Mutations fire immediately to local state (optimistic) AND sync to DB.  │
// │  On sign-in the guest cart is merged into the DB then cleared locally.   │
// │  fetchCart() hydrates the local store from the DB on mount.              │
// └─────────────────────────────────────────────────────────────────────────┘
//
// Stock awareness:
//   stockMap: Record<"productId:size", number>  — refreshed after mutations.
//   CartItem.quantity is always clamped to the available stock before add/update.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import {
  fetchServerCart,
  addToServerCart,
  updateServerCartItem,
  removeFromServerCart,
  clearServerCart,
  fetchStock,
} from "@/lib/cart/cartApi";

// ─── Extended CartItem with optional stock field ──────────────────────────────
export type CartItemWithStock = CartItem & { stock?: number };

interface CartStore {
  items: CartItemWithStock[];
  /** productId:size → available stock (0 = out of stock) */
  stockMap: Record<string, number>;
  /** Whether the last server sync is in progress */
  syncing: boolean;

  // ── Computed (derived from items) ─────────────────────────────────────────
  itemCount: number;
  total: number;

  // ── Mutations ─────────────────────────────────────────────────────────────
  addItem: (item: CartItem, isLoggedIn: boolean) => Promise<void>;
  removeItem: (productId: string, size: string, isLoggedIn: boolean) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number, isLoggedIn: boolean) => Promise<void>;
  clearCart: (isLoggedIn: boolean) => Promise<void>;

  // ── Auth lifecycle ────────────────────────────────────────────────────────
  /** Call on mount when user is logged in — loads DB cart into store. */
  fetchCart: () => Promise<void>;
  /** Call after login — merges guest cart into DB, then replaces local state. */
  mergeGuestCart: () => Promise<void>;
  /** Call after logout — clears in-memory items (localStorage guest cart starts fresh). */
  onSignOut: () => void;

  // ── Stock ─────────────────────────────────────────────────────────────────
  refreshStock: () => Promise<void>;
}

// Helper to derive totals
function computeTotals(items: CartItemWithStock[]) {
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { itemCount, total };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      stockMap: {},
      syncing: false,
      itemCount: 0,
      total: 0,

      // ── addItem ────────────────────────────────────────────────────────────
      addItem: async (item, isLoggedIn) => {
        // Clamp quantity to available stock if we know it
        const stockKey = `${item.productId}:${item.size}`;
        const available = get().stockMap[stockKey];
        const existingQty =
          get().items.find((i) => i.productId === item.productId && i.size === item.size)
            ?.quantity ?? 0;

        if (available !== undefined && existingQty + item.quantity > available) {
          // Silently cap — callers should check before calling
          const allowed = Math.max(0, available - existingQty);
          if (allowed === 0) return;
          item = { ...item, quantity: allowed };
        }

        // Optimistic local update
        set((s) => {
          const existing = s.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          const newItems = existing
            ? s.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...s.items, item];
          return { items: newItems, ...computeTotals(newItems) };
        });

        if (isLoggedIn) {
          set({ syncing: true });
          try {
            await addToServerCart(item.productId, item.size, item.quantity);
          } catch (e) {
            console.error("[cart] addItem sync failed", e);
          } finally {
            set({ syncing: false });
            // Refresh stock after add
            get().refreshStock();
          }
        }
      },

      // ── removeItem ────────────────────────────────────────────────────────
      removeItem: async (productId, size, isLoggedIn) => {
        set((s) => {
          const newItems = s.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          );
          return { items: newItems, ...computeTotals(newItems) };
        });

        if (isLoggedIn) {
          set({ syncing: true });
          try {
            await removeFromServerCart(productId, size);
          } catch (e) {
            console.error("[cart] removeItem sync failed", e);
          } finally {
            set({ syncing: false });
          }
        }
      },

      // ── updateQuantity ────────────────────────────────────────────────────
      updateQuantity: async (productId, size, quantity, isLoggedIn) => {
        if (quantity <= 0) {
          return get().removeItem(productId, size, isLoggedIn);
        }

        // Clamp to available stock
        const stockKey = `${productId}:${size}`;
        const available = get().stockMap[stockKey];
        const clamped = available !== undefined ? Math.min(quantity, available) : quantity;

        set((s) => {
          const newItems = s.items.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity: clamped } : i
          );
          return { items: newItems, ...computeTotals(newItems) };
        });

        if (isLoggedIn) {
          set({ syncing: true });
          try {
            await updateServerCartItem(productId, size, clamped);
          } catch (e) {
            console.error("[cart] updateQuantity sync failed", e);
          } finally {
            set({ syncing: false });
          }
        }
      },

      // ── clearCart ─────────────────────────────────────────────────────────
      clearCart: async (isLoggedIn) => {
        set({ items: [], itemCount: 0, total: 0 });

        if (isLoggedIn) {
          set({ syncing: true });
          try {
            await clearServerCart();
          } catch (e) {
            console.error("[cart] clearCart sync failed", e);
          } finally {
            set({ syncing: false });
          }
        }
      },

      // ── fetchCart (load from DB on mount) ─────────────────────────────────
      fetchCart: async () => {
        set({ syncing: true });
        try {
          const serverItems = await fetchServerCart();
          // Build stock map from items that carry stock field
          const stockMap: Record<string, number> = {};
          for (const item of serverItems) {
            if ((item as CartItemWithStock).stock !== undefined) {
              stockMap[`${item.productId}:${item.size}`] = (item as CartItemWithStock).stock!;
            }
          }
          set({ items: serverItems, stockMap, ...computeTotals(serverItems) });
        } catch (e) {
          console.error("[cart] fetchCart failed", e);
        } finally {
          set({ syncing: false });
        }
      },

      // ── mergeGuestCart (call right after login) ───────────────────────────
      mergeGuestCart: async () => {
        const guestItems = get().items;
        set({ syncing: true });

        try {
          // Push each guest item to the server (server upserts / increments)
          for (const item of guestItems) {
            try {
              await addToServerCart(item.productId, item.size, item.quantity);
            } catch {
              // Non-fatal — stock conflicts just won't be added
            }
          }
          // Replace local state with authoritative server cart
          const serverItems = await fetchServerCart();
          const stockMap: Record<string, number> = {};
          for (const item of serverItems) {
            if ((item as CartItemWithStock).stock !== undefined) {
              stockMap[`${item.productId}:${item.size}`] = (item as CartItemWithStock).stock!;
            }
          }
          set({ items: serverItems, stockMap, ...computeTotals(serverItems) });
        } catch (e) {
          console.error("[cart] mergeGuestCart failed", e);
        } finally {
          set({ syncing: false });
        }
      },

      // ── onSignOut ─────────────────────────────────────────────────────────
      onSignOut: () => {
        set({ items: [], itemCount: 0, total: 0, stockMap: {} });
      },

      // ── refreshStock ─────────────────────────────────────────────────────
      refreshStock: async () => {
        const items = get().items;
        if (items.length === 0) return;

        try {
          const stockMap = await fetchStock(
            items.map((i) => ({ productId: i.productId, size: i.size }))
          );
          set({ stockMap });
        } catch (e) {
          console.error("[cart] refreshStock failed", e);
        }
      },
    }),
    {
      name: "silkroad-cart",
      // Only persist items to localStorage (not syncing flag or stockMap)
      partialize: (state) => ({ items: state.items }),
      // Re-compute derived values when rehydrating from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { itemCount, total } = computeTotals(state.items);
          state.itemCount = itemCount;
          state.total = total;
        }
      },
    }
  )
);
