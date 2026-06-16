// src/app/api/orders/[id]/route.ts
// GET   /api/orders/[id]  — fetch a single order (must belong to the authenticated user)
// PATCH /api/orders/[id]  — user can cancel their own order (PENDING or PROCESSING only)

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/db/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          productImage: true,
          brandName: true,
          size: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

// ── PATCH — user cancels their own order ──────────────────────────────────────
export async function PATCH(_req: NextRequest, { params }: Params) {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Must own the order
  if (order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Can only cancel PENDING or PROCESSING orders
  if (order.status !== "PENDING" && order.status !== "PROCESSING") {
    return NextResponse.json(
      { error: `Cannot cancel an order with status: ${order.status}` },
      { status: 422 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ order: updated });
}
