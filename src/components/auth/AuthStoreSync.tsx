"use client";
// src/components/auth/AuthStoreSync.tsx
// Bridges the real Auth.js session into the Zustand authStore.
// Mount this once inside the Providers wrapper (in providers.tsx).
// Whenever the session changes (login, logout, token refresh), the store updates.

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

export function AuthStoreSync() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((s) => s._setUser);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      const { id, name, email, image, role, brandId, brandSlug, brandName } =
        session.user as {
          id: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
          role: "USER" | "ADMIN" | "SUPER_ADMIN";
          brandId?: string | null;
          brandSlug?: string | null;
          brandName?: string | null;
        };

      const parts = (name ?? "").trim().split(" ");
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ");

      setUser({
        id,
        firstName,
        lastName,
        email: email ?? "",
        image,
        role: role ?? "USER",
        brandId: brandId ?? null,
        brandSlug: brandSlug ?? null,
        brandName: brandName ?? null,
      });
    } else {
      setUser(null);
    }
  }, [session, status, setUser]);

  return null; // Render nothing — side-effect only
}
