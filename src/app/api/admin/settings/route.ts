// src/app/api/admin/settings/route.ts
// GET   /api/admin/settings — fetch the current admin's brand profile + display prefs
// PATCH /api/admin/settings — update tagline, logoUrl, contactEmail, display prefs
//
// Access: ADMIN (scoped to their own brandId) or SUPER_ADMIN.
// For SUPER_ADMIN the brandId may not be in the JWT (no brand assigned to them),
// so we fall back to a fresh DB lookup to resolve it.
// Read-only fields (name, slug) are never mutated here.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/guards";
import type { SessionUser } from "@/lib/guards";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  tagline:        z.string().max(200).optional().nullable(),
  logoUrl:        z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  contactEmail:   z.string().email("Must be a valid email").optional().nullable().or(z.literal("")),
  showNewBadge:   z.boolean().optional(),
  showSaleBadge:  z.boolean().optional(),
  showOutOfStock: z.boolean().optional(),
  allowReviews:   z.boolean().optional(),
});

/**
 * Resolves the brandId for the current admin.
 * - ADMIN:       uses brandId from session JWT (set at sign-in).
 * - SUPER_ADMIN: no brandId in the JWT — look it up fresh from the DB.
 *   If they still have no brand, returns null.
 */
async function resolveBrandId(user: SessionUser): Promise<string | null> {
  if (user.brandId) return user.brandId;

  // JWT may be stale — re-query the DB for the user's current brandId
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { brandId: true },
  });
  return dbUser?.brandId ?? null;
}

// ── GET — load brand settings ─────────────────────────────────────────────────
export async function GET() {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;

  // Fetch the current user's profile (always needed)
  const adminUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, image: true, role: true },
  });

  const brandId = await resolveBrandId(user);

  // Super-admin with no brand → return platform-level settings only
  if (!brandId) {
    const [totalBrands, totalProducts, totalUsers] = await Promise.all([
      prisma.brand.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: "USER" } }),
    ]);
    return NextResponse.json({
      role: "SUPER_ADMIN",
      admin: adminUser,
      platform: { totalBrands, totalProducts, totalUsers },
    });
  }

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: {
      id:             true,
      name:           true,
      slug:           true,
      tagline:        true,
      logoUrl:        true,
      contactEmail:   true,
      showNewBadge:   true,
      showSaleBadge:  true,
      showOutOfStock: true,
      allowReviews:   true,
      _count:         { select: { products: true, admins: true } },
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  return NextResponse.json({ role: user.role, brand, admin: adminUser });
}

// ── PATCH — save brand settings ───────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;

  const brandId = await resolveBrandId(user);
  if (!brandId) {
    return NextResponse.json(
      { error: "No brand is associated with this account." },
      { status: 400 }
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = UpdateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  const { tagline, logoUrl, contactEmail, showNewBadge, showSaleBadge, showOutOfStock, allowReviews } = parsed.data;

  const updated = await prisma.brand.update({
    where: { id: brandId },
    data: {
      ...(tagline       !== undefined && { tagline:       tagline || null }),
      ...(logoUrl       !== undefined && { logoUrl:       logoUrl || null }),
      ...(contactEmail  !== undefined && { contactEmail:  contactEmail || null }),
      ...(showNewBadge  !== undefined && { showNewBadge }),
      ...(showSaleBadge !== undefined && { showSaleBadge }),
      ...(showOutOfStock !== undefined && { showOutOfStock }),
      ...(allowReviews  !== undefined && { allowReviews }),
    },
    select: {
      id:             true,
      name:           true,
      slug:           true,
      tagline:        true,
      logoUrl:        true,
      contactEmail:   true,
      showNewBadge:   true,
      showSaleBadge:  true,
      showOutOfStock: true,
      allowReviews:   true,
    },
  });

  return NextResponse.json({ brand: updated });
}
