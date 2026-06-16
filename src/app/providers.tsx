"use client";
// src/app/providers.tsx
// Client-side provider wrapper — keeps the root layout a Server Component
// while giving all child Client Components access to useSession().

import { SessionProvider } from "next-auth/react";
import { AuthStoreSync } from "@/components/auth/AuthStoreSync";
import { CartProvider } from "@/components/cart/CartProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStoreSync />
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
