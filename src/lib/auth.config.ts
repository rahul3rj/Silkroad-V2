// src/lib/auth.config.ts
// Edge-compatible Auth.js config — NO Node.js-only imports.
// Used by middleware.ts (Edge runtime) to read the JWT session cookie.
//
// Must NOT import: prisma, bcryptjs, @auth/prisma-adapter, or any Node built-ins.
// The full auth config (with Prisma adapter, bcrypt, providers) lives in auth.ts.

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    // session: expose id, role, brand from the JWT token onto session.user
    async session({ session, token }) {
      if (session.user) {
        session.user.id        = token.id as string;
        session.user.role      = token.role as "USER" | "ADMIN" | "SUPER_ADMIN";
        session.user.brandId   = (token.brandId as string | null) ?? null;
        session.user.brandSlug = (token.brandSlug as string | null) ?? null;
        session.user.brandName = (token.brandName as string | null) ?? null;
        session.user.image     = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
