// src/app/api/cart/[productId]/[size]/route.ts
// PATCH  — update quantity for a specific cart item
// DELETE — remove a specific cart item

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

interface Params {
  params: Promise<{ productId: string; size: string }>;
}

// ─── PATCH — set quantity for a specific line item ────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { productId, size } = await params;
  const { quantity } = (await req.json()) as { quantity: number };

  if (typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  // quantity = 0 means remove
  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
        size,
      },
    });
    return NextResponse.json({ success: true });
  }

  // Validate against stock
  const variant = await prisma.variant.findUnique({
    where: { productId_size: { productId, size } },
    select: { stock: true },
  });

  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  if (quantity > variant.stock) {
    return NextResponse.json(
      { error: "Not enough stock", available: variant.stock },
      { status: 409 }
    );
  }

  const updated = await prisma.cartItem.updateMany({
    where: {
      userId: session.user.id,
      productId,
      size,
    },
    data: { quantity },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE — remove a specific line item ────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { productId, size } = await params;

  await prisma.cartItem.deleteMany({
    where: {
      userId: session.user.id,
      productId,
      size,
    },
  });

  return NextResponse.json({ success: true });
}
