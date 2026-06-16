// src/lib/auth.ts
// Auth.js v5 configuration — the single source of truth for authentication.
// Exports: auth, handlers, signIn, signOut  (re-used across the app)
//
// Providers:
//   • CredentialsProvider — email + bcrypt password (Silkroad accounts)
//   • GoogleProvider      — OAuth via Google
//   • AppleProvider       — OAuth via Apple  (placeholder — keys needed)
//
// Session strategy: "jwt" — REQUIRED when using the Credentials provider.
// The Credentials provider cannot write database sessions. Using "database"
// strategy causes useSession() to always return unauthenticated after a
// credentials login. JWT strategy stores the session in an encrypted cookie.
//
// Callbacks:
//   • jwt     → writes user.id and user.role into the JWT token on first sign-in
//   • session → reads from the token and exposes id + role on session.user
//   • signIn  → blocks suspended accounts (isActive = false)
//   • redirect → USER → "/", ADMIN → "/admin"

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { LoginSchema } from "@/lib/validations/auth";

// ─── Super-admin allowlist (env is the source of truth) ──────────────────────
// SUPER_ADMIN_EMAILS is a comma-separated list, e.g.
//   SUPER_ADMIN_EMAILS="owner@silkroad.com,you@example.com"
// Any account whose email is in this list is elevated to SUPER_ADMIN on sign-in,
// regardless of its DB role. Removing an email here demotes that account back to
// USER (or ADMIN if it still has a brandId) on its next sign-in. Nothing in the
// app or database can grant SUPER_ADMIN — only this env var can.
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // ─── Session ───────────────────────────────────────────────────────────────
  // "jwt" is REQUIRED for Credentials provider. The Credentials provider cannot
  // create database sessions — using "database" here means useSession() always
  // returns unauthenticated after an email/password login.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ─── Pages ─────────────────────────────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login", // Auth errors redirect back to login with ?error=
  },

  // ─── Providers ─────────────────────────────────────────────────────────────
  providers: [
    // ── Credentials (email + password) ──────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate shape
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // 3. Check account is active (not suspended)
        if (!user.isActive) return null;

        // 4. Verify password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // 5. Return user object — Auth.js encodes this into the JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // ── Google OAuth ─────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    // ── Apple OAuth ──────────────────────────────────────────────────────────
    AppleProvider({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
    }),
  ],

  // ─── Callbacks ─────────────────────────────────────────────────────────────
  callbacks: {
    // jwt: called whenever a JWT is created or updated.
    // On first sign-in, `user` is populated — resolve the effective role
    // (env super-admin always wins) and stamp role + brand context into the token.
    // On subsequent requests, `user` is undefined — token is returned as-is.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        // Pull the latest role + brand from the DB.
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: {
            role: true,
            image: true,
            email: true,
            brandId: true,
            brand: { select: { slug: true, name: true } },
          },
        });

        // ── Resolve effective role ──────────────────────────────────────────
        // 1. Email in SUPER_ADMIN_EMAILS  → SUPER_ADMIN (env wins, always)
        // 2. Otherwise keep the DB role, but demote a stale SUPER_ADMIN whose
        //    email is no longer in the env list (→ ADMIN if it has a brand, else USER)
        let role: "USER" | "ADMIN" | "SUPER_ADMIN" = dbUser?.role ?? "USER";
        const email = dbUser?.email ?? user.email;
        if (isSuperAdminEmail(email)) {
          role = "SUPER_ADMIN";
        } else if (role === "SUPER_ADMIN") {
          role = dbUser?.brandId ? "ADMIN" : "USER";
        }

        // Mirror the resolved role back to the DB so server-side queries that
        // read user.role stay consistent with the session.
        if (dbUser && dbUser.role !== role) {
          await prisma.user.update({ where: { id: user.id as string }, data: { role } });
        }

        token.role = role;
        token.brandId = dbUser?.brandId ?? null;
        token.brandSlug = dbUser?.brand?.slug ?? null;
        token.brandName = dbUser?.brand?.name ?? null;
        // Override token.picture with whatever is stored in DB (covers both
        // Google OAuth avatars and custom Supabase uploads)
        token.picture = dbUser?.image ?? token.picture ?? null;
      }
      return token;
    },

    // session: called whenever useSession() or getServerSession() is used.
    // Reads from the JWT token (not the DB) and exposes id, role, brand on session.user.
    async session({ session, token }) {
      if (session.user) {
        session.user.id        = token.id as string;
        session.user.role      = token.role as "USER" | "ADMIN" | "SUPER_ADMIN";
        session.user.brandId   = (token.brandId as string | null) ?? null;
        session.user.brandSlug = (token.brandSlug as string | null) ?? null;
        session.user.brandName = (token.brandName as string | null) ?? null;
        // token.picture is Auth.js's standard field for the user's avatar URL
        session.user.image     = (token.picture as string | null) ?? null;
      }
      return session;
    },

    // signIn: block suspended users from signing in via OAuth.
    // (Credentials users are blocked inside authorize() above.)
    async signIn({ user }) {
      if (!user?.email) return false;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { isActive: true },
      });
      // Allow sign-in if the user row doesn't exist yet (first OAuth login creates it)
      if (!dbUser) return true;
      return dbUser.isActive;
    },

    // redirect: honour same-origin callbackUrls, otherwise go to home/admin
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },

  // ─── Events ────────────────────────────────────────────────────────────────
  events: {
    // Ensure the role default is set when a new OAuth user is created.
    // The Prisma schema default handles this automatically, but this is a safety net.
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "USER" },
      });
    },
  },
});
