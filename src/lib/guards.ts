// src/lib/guards.ts
// Server-side authorization helpers for API routes.
// Each returns either { user } on success or { response } with the error to return.
//
// Usage in a route handler:
//   const gate = await requireAdmin();
//   if (gate.response) return gate.response;
//   const { user } = gate;   // user.id, user.role, user.brandId

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  brandId: string | null;
  brandSlug: string | null;
  brandName: string | null;
};

type Gate =
  | { user: SessionUser; response?: undefined }
  | { user?: undefined; response: NextResponse };

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Any authenticated user. */
export async function requireUser(): Promise<Gate> {
  const session = await auth();
  if (!session?.user?.id) return { response: unauthorized() };
  return { user: session.user as SessionUser };
}

/** ADMIN or SUPER_ADMIN. */
export async function requireAdmin(): Promise<Gate> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return { response: unauthorized() };
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return { response: forbidden() };
  return { user };
}

/** A brand admin with a brand attached (the common case for catalogue writes). */
export async function requireBrandAdmin(): Promise<Gate> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return { response: unauthorized() };
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return { response: forbidden() };
  if (!user.brandId) {
    return {
      response: NextResponse.json(
        { error: "No brand is associated with this account." },
        { status: 400 }
      ),
    };
  }
  return { user };
}

/** SUPER_ADMIN only (platform management). */
export async function requireSuperAdmin(): Promise<Gate> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return { response: unauthorized() };
  if (user.role !== "SUPER_ADMIN") return { response: forbidden() };
  return { user };
}
