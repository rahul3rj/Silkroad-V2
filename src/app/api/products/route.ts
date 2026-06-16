// src/app/api/products/route.ts
// GET /api/products — public catalogue read for the storefront.
// Returns products in the same shape as the legacy `ProductData` mock so the
// existing ProductCard / ProductGrid components work unchanged.
//
// Query params (all optional):
//   ?category=women|men|bags   filter by category slug
//   ?brand=<brandSlug>         filter by brand slug
//   ?isNew=true                only new arrivals
//   ?q=<text>                  search name / tags / brand name
//   ?limit=<n>                 cap results
//
// Prices are stored in cents in the DB and returned here in whole dollars
// (÷100) to match what the UI expects.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    brand: { select: { name: true; slug: true } };
    category: { select: { slug: true } };
    variants: { select: { size: true } };
  };
}>;

function toProductDTO(p: ProductWithRelations) {
  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    brandSlug: p.brand.slug,
    category: p.category.slug,
    subcategory: p.subcategory ?? "",
    price: p.price / 100,
    salePrice: p.salePrice != null ? p.salePrice / 100 : undefined,
    imageSrc: p.imageSrc,
    images: p.images.length > 0 ? p.images : [p.imageSrc],
    colors: (p.colors ?? []) as { name: string; hex: string }[],
    sizes,
    isNew: p.isNew,
    isSale: p.isSale,
    description: p.description,
    tags: p.tags,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const isNew = searchParams.get("isNew");
  const q = (searchParams.get("q") ?? "").trim();
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : undefined;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (isNew === "true") where.isNew = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const random = searchParams.get("random") === "true";

  let products: ProductWithRelations[];

  if (random) {
    // For random picks: fetch a larger pool then shuffle in JS.
    // This avoids needing raw SQL while still giving true randomness.
    const pool = await prisma.product.findMany({
      where,
      take: Math.max((limit ?? 8) * 6, 50), // fetch a generous pool to shuffle from
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { slug: true } },
        variants: { orderBy: { size: "asc" }, select: { size: true } },
      },
    });
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    products = limit ? pool.slice(0, limit) : pool;
  } else {
    products = await prisma.product.findMany({
      where,
      orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { slug: true } },
        variants: { orderBy: { size: "asc" }, select: { size: true } },
      },
    });
  }

  return NextResponse.json(products.map(toProductDTO));
}
