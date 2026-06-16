// src/app/api/admin/brands/route.ts
// GET  /api/admin/brands — list all brands (for the super-admin assignment dropdown).
// POST /api/admin/brands — create a new brand. Super-admin only.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/guards";
import { z } from "zod";

const CreateBrandSchema = z.object({
  name:    z.string().min(1).max(100),
  slug:    z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  tagline: z.string().max(200).optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function GET() {
  const gate = await requireSuperAdmin();
  if (gate.response) return gate.response;

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      isActive: true,
      _count: { select: { products: true, admins: true } },
    },
  });

  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const gate = await requireSuperAdmin();
  if (gate.response) return gate.response;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateBrandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const { name, slug, tagline, logoUrl, website } = parsed.data;

  const existing = await prisma.brand.findUnique({ where: { slug }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "A brand with this slug already exists." }, { status: 409 });
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug,
      tagline: tagline || null,
      logoUrl: logoUrl || null,
      website: website || null,
      isActive: true,
    },
  });

  return NextResponse.json({ brand }, { status: 201 });
}