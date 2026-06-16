// src/app/api/admin/orders/[id]/route.ts
// GET   /api/admin/orders/[id]  — fetch a single order (admin view)
// PATCH /api/admin/orders/[id]  — update order status

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

// Admin-allowed status transitions — admins can only advance orders forward.
// Cancellation is the customer's right only (via /api/orders/[id]).
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
  REFUNDED:   [],
};

const PatchSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().max(100).optional(),
  trackingCarrier: z.string().max(100).optional(),
  adminNote: z.string().max(500).optional(),
});

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

// ── PATCH — update order status ───────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const { status: newStatus, trackingNumber, trackingCarrier, adminNote } = parsed.data;

  // Fetch current order
  const existing = await prisma.order.findUnique({
    where: { id },
    select: { status: true, userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Validate transition
  const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${existing.status} to ${newStatus}` },
      { status: 422 }
    );
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (trackingCarrier !== undefined) updateData.trackingCarrier = trackingCarrier;
  if (adminNote !== undefined) updateData.adminNote = adminNote;
  if (newStatus === "SHIPPED") updateData.shippedAt = new Date();
  if (newStatus === "DELIVERED") updateData.deliveredAt = new Date();

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { items: true },
  });

  return NextResponse.json({ order: updated });
}
