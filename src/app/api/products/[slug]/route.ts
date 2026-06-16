// src/app/api/products/[slug]/route.ts
// GET /api/products/:slug — public single-product read for the product detail page.
// Returns the same `ProductData`-compatible shape as the list endpoint.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const p = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { slug: true } },
      variants: { orderBy: { size: "asc" }, select: { size: true } },
    },
  });

  if (!p) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));

  return NextResponse.json({
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
  });
}
