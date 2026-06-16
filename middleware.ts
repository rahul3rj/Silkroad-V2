// middleware.ts  (project root — next to package.json)
// Route protection using Auth.js v5 middleware.
//
// Route rules:
//   /admin/*         → ADMIN role required   (USER → redirect to /)
//   /account/*       → any authenticated user (GUEST → redirect to /login)
//   /checkout/*      → any authenticated user (GUEST → redirect to /login)
//   /profile/*       → any authenticated user (GUEST → redirect to /login)
//   /login, /signup  → redirect to / if already signed in
//
// Auth.js exports `auth` as middleware — it reads the session from the
// encrypted cookie on every request without hitting the DB.

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

// Routes that require any authenticated session
const USER_ROUTES = ["/account", "/checkout", "/profile", "/orders", "/wishlist"];
// Routes that require ADMIN or SUPER_ADMIN role
const ADMIN_ROUTES = ["/admin"];
// Routes that require SUPER_ADMIN only (platform-level management)
const SUPER_ADMIN_ROUTES = ["/admin/brand-manage"];
// Routes that should redirect logged-in users away (no point visiting login/signup when authed)
const AUTH_ROUTES = ["/login", "/signup"];

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role: "USER" | "ADMIN" | "SUPER_ADMIN" | null = session?.user?.role ?? null;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const path = nextUrl.pathname;

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  if (AUTH_ROUTES.some((r) => path.startsWith(r)) && isLoggedIn) {
    const destination = isAdmin ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, nextUrl));
  }

  // ── Super-admin-only routes (checked before generic admin routes) ─────────
  if (SUPER_ADMIN_ROUTES.some((r) => path.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "SUPER_ADMIN") {
      // Brand admins are sent back to their dashboard
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  // ── Admin routes — must be ADMIN or SUPER_ADMIN ───────────────────────────
  if (ADMIN_ROUTES.some((r) => path.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Authenticated but not an admin → send to home
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // ── Protected user routes — must be authenticated ─────────────────────────
  if (USER_ROUTES.some((r) => path.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

// Matcher — run middleware on all routes except:
//   • Next.js internals (_next/*)
//   • Static assets (images, fonts, etc.)
//   • Favicon / public files
//   • Auth.js own API routes (must NOT be intercepted — causes 404 on /api/auth/session)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|images|icons|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
