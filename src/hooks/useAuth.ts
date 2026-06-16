"use client";

// useAuth — convenience hook that reads from the Zustand authStore.
// The store is kept in sync with the real Auth.js session by AuthStoreSync.
// Use this instead of useSession() for simple role/user checks in UI components.

import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return {
    user,
    isLoggedIn,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    // A brand admin OR a super admin both have admin-panel access
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    isBrandAdmin: user?.role === "ADMIN",
    isUser: user?.role === "USER",
  };
}
