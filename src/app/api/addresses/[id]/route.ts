// src/app/api/addresses/[id]/route.ts
// PATCH  /api/addresses/[id] — update an address (or set as default)
// DELETE /api/addresses/[id] — remove an address

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const UpdateSchema = z.object({
  fullName:  z.string().min(1).max(200).optional(),
  line1:     z.string().min(1).max(300).optional(),
  line2:     z.string().max(300).nullable().optional(),
  city:      z.string().min(1).max(100).optional(),
  state:     z.string().min(1).max(100).optional(),
  postcode:  z.string().min(1).max(20).optional(),
  country:   z.string().min(1).max(100).optional(),
  phone:     z.string().max(30).nullable().optional(),
  isDefault: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { isDefault, ...fields } = parsed.data;

  // If setting as default, clear all others first
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: {
      ...fields,
      ...(isDefault !== undefined ? { isDefault } : {}),
    },
  });

  return NextResponse.json(updated);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  const wasDefault = existing.isDefault;

  await prisma.address.delete({ where: { id } });

  // If deleted address was the default, promote the oldest remaining address
  if (wasDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
