// src/app/api/admin/products/route.ts
// GET  /api/admin/products — list products for the current admin.
//   - ADMIN:       returns only their brand's products.
//   - SUPER_ADMIN: returns all products across all brands (includes brandName).
// POST /api/admin/products — create a product. Brand-admin only.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, requireBrandAdmin } from "@/lib/guards";
import type { SessionUser } from "@/lib/guards";
import { CreateProductSchema } from "@/lib/validations/product";

async function resolveBrandId(user: SessionUser): Promise<string | null> {
  if (user.brandId) return user.brandId;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { brandId: true } });
  return dbUser?.brandId ?? null;
}

// ── GET — inventory ───────────────────────────────────────────────────────────
export async function GET() {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const brandId = isSuperAdmin ? null : await resolveBrandId(user);

  const products = await prisma.product.findMany({
    // Include both active AND hidden products so admins can manage visibility.
    // (Public shop routes still filter by isActive: true separately.)
    where: isSuperAdmin ? undefined : { brandId: brandId! },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { slug: true, name: true } },
      variants:  { orderBy: { size: "asc" }, select: { id: true, size: true, stock: true } },
      brand:     { select: { name: true, slug: true } },
    },
  });

  const shaped = products.map((p) => ({
    id:           p.id,
    slug:         p.slug,
    name:         p.name,
    category:     p.category.slug,
    subcategory:  p.subcategory,
    price:        p.price,
    salePrice:    p.salePrice,
    imageSrc:     p.imageSrc,
    isNew:        p.isNew,
    isSale:       p.isSale,
    isActive:     p.isActive,
    variants:     p.variants,
    totalStock:   p.variants.reduce((sum, v) => sum + v.stock, 0),
    brandName:    p.brand.name,
    brandSlug:    p.brand.slug,
  }));

  return NextResponse.json({ products: shaped, isSuperAdmin });
}

// ── POST — create product ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  const gate = await requireBrandAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;

  const body = await request.json().catch(() => null);
  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Resolve the category id from its slug
  const category = await prisma.category.findUnique({
    where: { slug: data.category },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  // Slug must be globally unique
  const slugTaken = await prisma.product.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (slugTaken) {
    return NextResponse.json(
      { error: "A product with this slug already exists." },
      { status: 409 }
    );
  }

  // De-duplicate variants by size (last one wins) to satisfy the unique constraint
  const variantBySize = new Map<string, number>();
  for (const v of data.variants) variantBySize.set(v.size, v.stock);

  try {
    const product = await prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        brandId: user.brandId!, // forced from session — client cannot set this
        categoryId: category.id,
        subcategory: data.subcategory,
        price: Math.round(data.price * 100),
        salePrice: data.salePrice != null ? Math.round(data.salePrice * 100) : null,
        imageSrc: data.imageSrc,
        images: data.images ?? [],
        colors: JSON.parse(JSON.stringify(data.colors ?? [])),
        tags: data.tags ?? [],
        isNew: data.isNew ?? false,
        isSale: data.isSale ?? (data.salePrice != null),
        isActive: true,
        variants: {
          create: Array.from(variantBySize.entries()).map(([size, stock]) => ({ size, stock })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json(
      { error: "Could not create the product. Please try again." },
      { status: 500 }
    );
  }
}
