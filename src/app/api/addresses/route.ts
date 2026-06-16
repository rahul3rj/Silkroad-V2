// src/app/api/addresses/route.ts
// GET  /api/addresses — list all addresses for the current user
// POST /api/addresses — create a new address

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const AddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required.").max(200),
  line1:    z.string().min(1, "Address line 1 is required.").max(300),
  line2:    z.string().max(300).optional().nullable(),
  city:     z.string().min(1, "City is required.").max(100),
  state:    z.string().min(1, "State is required.").max(100),
  postcode: z.string().min(1, "Postal code is required.").max(20),
  country:  z.string().min(1, "Country is required.").max(100),
  phone:    z.string().max(30).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isDefault: "desc" }, // default first
      { createdAt: "asc" },
    ],
  });

  return NextResponse.json(addresses);
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { isDefault, ...fields } = parsed.data;
  const userId = session.user.id;

  // Count existing addresses — first one is always default
  const existingCount = await prisma.address.count({ where: { userId } });
  const shouldBeDefault = isDefault || existingCount === 0;

  // If this will be default, clear all other defaults first
  if (shouldBeDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      ...fields,
      line2: fields.line2 ?? null,
      phone: fields.phone ?? null,
      isDefault: shouldBeDefault,
    },
  });

  return NextResponse.json(address, { status: 201 });
}
