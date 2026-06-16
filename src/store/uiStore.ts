// src/store/uiStore.ts
// UI state — drawer/menu open states
import { create } from "zustand";

interface UIStore {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  authOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openAuth: () => void;
  closeAuth: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  authOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
}));
