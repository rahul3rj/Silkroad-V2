// src/app/api/users/me/route.ts
// GET    /api/users/me — returns the current user's profile fields
// PATCH  /api/users/me — updates name, phone, dob for the current user
// DELETE /api/users/me — permanently deletes the account and all related data

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().max(50).optional().default(""),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().nullable(),
  dob: z.string().optional().nullable(), // ISO date string "YYYY-MM-DD" or null
});

// ── GET — load current profile ────────────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dob: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Split name into firstName / lastName for the form
  const parts = (user.name ?? "").trim().split(" ");
  return NextResponse.json({
    ...user,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    // Serialize dob as "YYYY-MM-DD" string (or null) for the date input
    dob: user.dob ? user.dob.toISOString().split("T")[0] : null,
  });
}

// ── PATCH — save profile changes ──────────────────────────────────────────────
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, dob } = parsed.data;

  // If email changed, make sure it's not taken by another account
  if (email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "This email is already in use." },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone: phone ?? null,
      // Parse "YYYY-MM-DD" → Date (UTC midnight), or clear the field
      dob: dob ? new Date(`${dob}T00:00:00.000Z`) : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dob: true,
      image: true,
      role: true,
    },
  });

  const parts = (updated.name ?? "").trim().split(" ");
  return NextResponse.json({
    ...updated,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    dob: updated.dob ? updated.dob.toISOString().split("T")[0] : null,
  });
}

// ── DELETE — permanently delete account ───────────────────────────────────────
// Prisma cascades handle related rows: addresses, cartItems, orders,
// wishlistItems, recentlyViewed, accounts, sessions (all have onDelete: Cascade)
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete the avatar from Supabase Storage if one was uploaded
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (user?.image && supabaseUrl && user.image.includes(supabaseUrl)) {
    const marker = `/object/public/avatars/`;
    const idx = user.image.indexOf(marker);
    if (idx !== -1) {
      const path = user.image.slice(idx + marker.length);
      await fetch(`${supabaseUrl}/storage/v1/object/avatars/${path}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${serviceKey}` },
      }).catch(() => { /* non-fatal */ });
    }
  }

  // Delete the user row — cascades to all related tables
  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ ok: true });
}
