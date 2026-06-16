// src/app/api/admin/users/route.ts
// GET /api/admin/users?q=<search> — search users by name or email.
// Super-admin only. Used by the Brand Manage panel to find accounts to promote.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/guards";

export async function GET(request: Request) {
  const gate = await requireSuperAdmin();
  if (gate.response) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    take: 25,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      brandId: true,
      brand: { select: { id: true, name: true, slug: true } },
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}
