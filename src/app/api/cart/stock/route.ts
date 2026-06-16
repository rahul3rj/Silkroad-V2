// src/app/api/cart/stock/route.ts
// POST /api/cart/stock
// Body: { items: Array<{ productId: string; size: string }> }
// Returns: { stock: Record<"productId:size", number> }
// Used by the client to check inventory levels and disable + button.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body?.items as Array<{ productId: string; size: string }> | undefined;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ stock: {} });
  }

  // Fetch all relevant variants in one query
  const variants = await prisma.variant.findMany({
    where: {
      OR: items.map((i) => ({ productId: i.productId, size: i.size })),
    },
    select: { productId: true, size: true, stock: true },
  });

  // Map to "productId:size" → stock
  const stock: Record<string, number> = {};
  for (const v of variants) {
    stock[`${v.productId}:${v.size}`] = v.stock;
  }

  return NextResponse.json({ stock });
}
