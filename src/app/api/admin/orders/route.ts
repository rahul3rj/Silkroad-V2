// src/app/api/admin/orders/route.ts
// GET   /api/admin/orders         — list brand-scoped orders (newest first)
// PATCH /api/admin/orders         — bulk status update (not needed, use [id] route)

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db/prisma";

// ── GET — list orders for this admin's brand ──────────────────────────────────
export async function GET() {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;

  // SUPER_ADMIN sees all orders; brand ADMIN sees only their brand's orders
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const orders = await prisma.order.findMany({
    where: isSuperAdmin
      ? undefined
      : {
          items: {
            some: {
              product: {
                brandId: user.brandId ?? "__none__",
              },
            },
          },
        },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
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
          product: {
            select: { brandId: true },
          },
        },
      },
    },
  });

  // For brand admins, filter items to only their brand's products
  const sanitised = orders.map((order) => ({
    ...order,
    items: isSuperAdmin
      ? order.items
      : order.items.filter((item) => item.product?.brandId === user.brandId),
  }));

  return NextResponse.json({ orders: sanitised });
}
