// src/app/api/admin/products/[id]/route.ts
//
// DELETE /api/admin/products/:id
//   Hard-deletes the product and all its variants from the DB.
//   OrderItems that referenced this product will have productId/variantId set
//   to NULL (SetNull cascade) — their snapshot fields keep historical accuracy.
//
// PATCH /api/admin/products/:id
//   Two modes depending on the body:
//   • { visibility: "hide" | "show" } — toggle isActive (hide/unhide)
//   • { variants: { id: string; stock: number }[] } — update stock quantities
//
// Brand-admins can only touch their own products.
// Super-admins can touch any product.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/guards";

// ── shared ownership check ─────────────────────────────────────────────────────
async function getOwnedProduct(id: string, userId: string, role: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, brandId: true, isActive: true },
  });
  if (!product) return { product: null, forbidden: false };
  if (role !== "SUPER_ADMIN" && product.brandId !== userId) {
    return { product: null, forbidden: true };
  }
  return { product, forbidden: false };
}

// ── DELETE — hard-delete ──────────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, brandId: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (user.role !== "SUPER_ADMIN" && product.brandId !== user.brandId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Hard-delete — variants cascade (onDelete: Cascade on Variant).
  // OrderItems get productId/variantId = NULL (onDelete: SetNull).
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

// ── PATCH — visibility toggle OR stock update ─────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  // ── Visibility toggle ────────────────────────────────────────────────────────
  if (typeof body.visibility === "string") {
    if (body.visibility !== "hide" && body.visibility !== "show") {
      return NextResponse.json(
        { error: 'visibility must be "hide" or "show".' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, brandId: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (user.role !== "SUPER_ADMIN" && product.brandId !== user.brandId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: body.visibility === "show" },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ success: true, isActive: updated.isActive });
  }

  // ── Stock update ─────────────────────────────────────────────────────────────
  if (!Array.isArray(body.variants)) {
    return NextResponse.json(
      { error: "Body must contain a variants array or a visibility field." },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, brandId: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (user.role !== "SUPER_ADMIN" && product.brandId !== user.brandId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updates = (body.variants as { id: string; stock: number }[]).filter(
    (v) => typeof v.id === "string" && typeof v.stock === "number" && v.stock >= 0
  );

  await Promise.all(
    updates.map((v) =>
      prisma.variant.update({
        where: { id: v.id },
        data: { stock: Math.round(v.stock) },
      })
    )
  );

  const fresh = await prisma.variant.findMany({
    where: { productId: id },
    orderBy: { size: "asc" },
    select: { id: true, size: true, stock: true },
  });

  return NextResponse.json({ variants: fresh });
}
