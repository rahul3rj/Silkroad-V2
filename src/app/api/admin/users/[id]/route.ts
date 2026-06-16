// src/app/api/admin/users/[id]/route.ts
// PATCH /api/admin/users/:id — assign or revoke a brand-admin role.
// Super-admin only. role + brandId are always changed together (atomically).
//
// Body:
//   { "action": "assign", "brandId": "<brand id>" }  → role=ADMIN, brandId set
//   { "action": "revoke" }                            → role=USER,  brandId cleared
//
// Super-admins (env-controlled) cannot be modified here — their role is derived
// from SUPER_ADMIN_EMAILS on every sign-in.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/guards";
import { AssignRoleSchema } from "@/lib/validations/product";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireSuperAdmin();
  if (gate.response) return gate.response;

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = AssignRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  // Target must exist
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Super-admins are managed via env — never demoted/altered through this endpoint
  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Super-admins are managed via SUPER_ADMIN_EMAILS and cannot be changed here." },
      { status: 403 }
    );
  }

  if (parsed.data.action === "assign") {
    const { brandId } = parsed.data;
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: "ADMIN", brandId },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        brand: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json(updated);
  }

  // action === "revoke"
  const updated = await prisma.user.update({
    where: { id },
    data: { role: "USER", brandId: null },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      brand: { select: { id: true, name: true, slug: true } },
    },
  });
  return NextResponse.json(updated);
}
