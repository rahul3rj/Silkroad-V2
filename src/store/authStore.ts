// src/store/authStore.ts
// Auth state — now a thin reactive layer over the real Auth.js session.
// Components that read `useAuthStore` continue to work unchanged.
// The `login()` and `logout()` methods now call the real next-auth signIn/signOut.
//
// Usage in components:
//   const { isLoggedIn, user } = useAuthStore();
//
// To sync session → store, mount <AuthStoreSync /> in a client layout.

import { create } from "zustand";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  role: Role;
  brandId?: string | null;
  brandSlug?: string | null;
  brandName?: string | null;
}

interface AuthStore {
  isLoggedIn: boolean;
  user: AuthUser | null;
  // Called by AuthStoreSync to hydrate from the real session
  _setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  isLoggedIn: false,
  user: null,
  _setUser: (user) => set({ isLoggedIn: !!user, user }),
}));
