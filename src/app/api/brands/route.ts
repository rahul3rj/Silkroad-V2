// src/app/api/brands/route.ts
// GET /api/brands — public list of all active brands.
// Used by the storefront (marquee, filter pills, brand page headers, product logos).
// No auth required.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      logoUrl: true,
    },
  });

  return NextResponse.json(brands);
}
