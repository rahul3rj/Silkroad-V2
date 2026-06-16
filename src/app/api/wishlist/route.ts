// src/app/api/wishlist/route.ts
// GET    /api/wishlist              — fetch the logged-in user's wishlist
// POST   /api/wishlist              — add a product to the wishlist
// DELETE /api/wishlist?productId=  — remove a product from the wishlist

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ─── GET — return all wishlist items for the authenticated user ───────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageSrc: true,
          price: true,
          salePrice: true,
          isSale: true,
          brand: { select: { name: true } },
          variants: {
            select: { size: true, stock: true },
            orderBy: { size: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const wishlistItems = items.map((item) => {
    const totalStock = item.product.variants.reduce(
      (sum, v) => sum + v.stock,
      0
    );
    const displayPrice =
      item.product.isSale && item.product.salePrice
        ? item.product.salePrice / 100
        : item.product.price / 100;

    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      brand: item.product.brand.name,
      price: displayPrice,
      originalPrice: item.product.price / 100,
      isSale: item.product.isSale,
      image: item.product.imageSrc,
      inStock: totalStock > 0,
      addedAt: item.createdAt,
    };
  });

  return NextResponse.json({ items: wishlistItems });
}

// ─── POST — add a product to the wishlist ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { productId } = body as { productId: string };

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const wishlistItem = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
    update: {}, // Already exists — no-op
    create: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json({ wishlistItem }, { status: 201 });
}

// ─── DELETE — remove a product from the wishlist ──────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId query param is required" },
      { status: 400 }
    );
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json({ success: true });
}
