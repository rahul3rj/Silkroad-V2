// src/types/next-auth.d.ts
// Extends the default Auth.js v5 types to include our custom fields:
//   • session.user.id        — needed everywhere we do DB queries from the client
//   • session.user.role      — drives role-based UI + middleware guards
//   • session.user.brandId   — the brand a brand-admin manages (null otherwise)
//   • session.user.brandSlug — convenience slug for storefront links
//   • session.user.brandName — convenience display name for the admin panel
// Without this, TypeScript won't know these fields exist on the session object.

import type { DefaultSession } from "next-auth";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      brandId: string | null;
      brandSlug: string | null;
      brandName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    brandId?: string | null;
    brandSlug?: string | null;
    brandName?: string | null;
  }
}
