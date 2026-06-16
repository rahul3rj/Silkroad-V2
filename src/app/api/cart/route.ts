// src/app/api/cart/route.ts
// GET  /api/cart          — fetch the current user's DB cart
// POST /api/cart          — add / upsert an item
// DELETE /api/cart        — clear the entire cart

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ─── GET — return all cart items for the authenticated user ──────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
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
          brand: { select: { name: true } },
        },
      },
      variant: {
        select: { id: true, size: true, stock: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Normalise to the client CartItem shape
  const cartItems = items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    productName: item.product.name,
    productImage: item.product.imageSrc,
    slug: item.product.slug,
    brand: item.product.brand.name,
    size: item.size,
    quantity: item.quantity,
    // price in dollars (client uses dollars; DB stores cents)
    price: (item.product.salePrice ?? item.product.price) / 100,
    stock: item.variant.stock,
  }));

  return NextResponse.json({ items: cartItems });
}

// ─── POST — add or increment a cart item ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, size, quantity = 1 } = body as {
    productId: string;
    size: string;
    quantity?: number;
  };

  if (!productId || !size) {
    return NextResponse.json({ error: "productId and size are required" }, { status: 400 });
  }

  // Resolve the variant
  const variant = await prisma.variant.findUnique({
    where: { productId_size: { productId, size } },
    select: { id: true, stock: true },
  });

  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  // Check existing quantity in cart to validate against stock
  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId_size: {
        userId: session.user.id,
        productId,
        size,
      },
    },
    select: { quantity: true },
  });

  const currentQty = existing?.quantity ?? 0;
  const newQty = currentQty + quantity;

  if (newQty > variant.stock) {
    return NextResponse.json(
      { error: "Not enough stock", available: variant.stock },
      { status: 409 }
    );
  }

  // Upsert: create or increment quantity
  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_productId_size: {
        userId: session.user.id,
        productId,
        size,
      },
    },
    update: { quantity: { increment: quantity } },
    create: {
      userId: session.user.id,
      productId,
      variantId: variant.id,
      size,
      quantity,
    },
  });

  return NextResponse.json({ cartItem }, { status: 201 });
}

// ─── DELETE — clear the entire cart ──────────────────────────────────────────
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ success: true });
}
