// src/app/api/recently-viewed/route.ts
// GET  /api/recently-viewed — fetch the current user's 8 most recently viewed products
// POST /api/recently-viewed — record a product view (upsert), then prune to max 8
//
// Logic:
//   1. Upsert: if the product was already viewed, just bump viewedAt to now.
//   2. After upsert, count total rows for this user.
//   3. If count > 8, delete the oldest row(s) so only 8 remain.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/guards";

const MAX_RECENTLY_VIEWED = 8;

// ── GET — fetch recently viewed ───────────────────────────────────────────────
export async function GET() {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const rows = await prisma.recentlyViewed.findMany({
    where:   { userId: user.id },
    orderBy: { viewedAt: "desc" },
    take:    MAX_RECENTLY_VIEWED,
    select: {
      viewedAt: true,
      product: {
        select: {
          id:          true,
          slug:        true,
          name:        true,
          imageSrc:    true,
          price:       true,
          salePrice:   true,
          isSale:      true,
          isNew:       true,
          subcategory: true,
          colors:      true,   // Json field — [{ name, hex }]
          brand:       { select: { name: true, slug: true } },
          category:    { select: { slug: true } },
        },
      },
    },
  });

  // Shape to match the ProductData interface used by ProductCard
  const products = rows.map((r) => ({
    id:          r.product.id,
    slug:        r.product.slug,
    name:        r.product.name,
    imageSrc:    r.product.imageSrc,
    price:       r.product.price / 100,
    salePrice:   r.product.salePrice ? r.product.salePrice / 100 : null,
    isSale:      r.product.isSale,
    isNew:       r.product.isNew,
    subcategory: r.product.subcategory,
    brand:       r.product.brand.name,
    brandSlug:   r.product.brand.slug,
    category:    r.product.category.slug,
    viewedAt:    r.viewedAt,
    colors:      (r.product.colors ?? []) as { name: string; hex: string }[],
    // safe defaults for fields not needed in card context
    images:      [] as string[],
    sizes:       [] as string[],
    tags:        [] as string[],
    description: "",
  }));

  return NextResponse.json({ products });
}

// ── POST — record a view ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  let productId: string | undefined;
  try {
    const body = await req.json();
    productId = typeof body?.productId === "string" ? body.productId : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  // Verify the product actually exists
  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Upsert: bump viewedAt if already seen, create new row otherwise
  await prisma.recentlyViewed.upsert({
    where:  { userId_productId: { userId: user.id, productId } },
    update: { viewedAt: new Date() },
    create: { userId: user.id, productId, viewedAt: new Date() },
  });

  // Prune: keep only the 8 most recent for this user
  const all = await prisma.recentlyViewed.findMany({
    where:   { userId: user.id },
    orderBy: { viewedAt: "desc" },
    select:  { id: true },
  });

  if (all.length > MAX_RECENTLY_VIEWED) {
    const toDelete = all.slice(MAX_RECENTLY_VIEWED).map((r) => r.id);
    await prisma.recentlyViewed.deleteMany({
      where: { id: { in: toDelete } },
    });
  }

  return NextResponse.json({ ok: true });
}
