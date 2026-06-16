// src/app/api/admin/stats/route.ts
// GET /api/admin/stats
// Returns brand-scoped dashboard stats for the logged-in admin.
// SUPER_ADMIN sees platform-wide stats. ADMIN sees only their brand.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;
  const { user } = gate;

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  // ── Build a brand-scoped "where" clause for order items ──────────────────
  // For brand admins we filter orders that contain at least one item belonging
  // to their brand. Revenue/stats are only for that brand's items.
  const brandId = user.brandId ?? "";

  // ── 1. Products ──────────────────────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: isSuperAdmin ? {} : { brandId },
    select: {
      id: true,
      name: true,
      imageSrc: true,
      isNew: true,
      isSale: true,
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
  });

  const totalProducts = products.length;
  const newProducts = products.filter((p) => p.isNew).length;
  const saleProducts = products.filter((p) => p.isSale).length;

  // Low-stock: variants with stock > 0 and <= 3; out-of-stock: stock === 0
  let lowStockItems = 0;
  let outOfStockItems = 0;
  for (const p of products) {
    for (const v of p.variants) {
      if (v.stock === 0) outOfStockItems++;
      else if (v.stock <= 3) lowStockItems++;
    }
  }

  // ── 2. Orders + items ────────────────────────────────────────────────────
  // Fetch all order items for this brand's products so we can compute revenue
  const orderItemsRaw = await prisma.orderItem.findMany({
    where: isSuperAdmin ? {} : { product: { brandId } },
    select: {
      id: true,
      unitPrice: true,
      quantity: true,
      productName: true,
      productId: true,
      size: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          shippingFullName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by order id so we can compute per-order totals for this brand
  const orderMap = new Map<
    string,
    {
      id: string;
      status: string;
      createdAt: Date;
      customerName: string;
      customerEmail: string;
      brandRevenue: number; // cents — only this brand's items
      items: typeof orderItemsRaw;
    }
  >();

  for (const item of orderItemsRaw) {
    const oid = item.order.id;
    if (!orderMap.has(oid)) {
      orderMap.set(oid, {
        id: oid,
        status: item.order.status,
        createdAt: item.order.createdAt,
        customerName: item.order.user.name ?? item.order.shippingFullName,
        customerEmail: item.order.user.email,
        brandRevenue: 0,
        items: [],
      });
    }
    const entry = orderMap.get(oid)!;
    entry.brandRevenue += item.unitPrice * item.quantity;
    entry.items.push(item);
  }

  const allOrders = Array.from(orderMap.values());
  const totalOrders = allOrders.length;

  // ── 3. Revenue & order totals ─────────────────────────────────────────────
  const totalRevenueCents = allOrders.reduce((s, o) => s + o.brandRevenue, 0);
  const avgOrderValueCents =
    totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  // ── 4. Status breakdown ───────────────────────────────────────────────────
  const statusCounts = {
    PENDING:    0,
    PROCESSING: 0,
    SHIPPED:    0,
    DELIVERED:  0,
    CANCELLED:  0,
    REFUNDED:   0,
  };
  for (const o of allOrders) {
    const key = o.status as keyof typeof statusCounts;
    if (key in statusCounts) statusCounts[key]++;
  }

  // ── 5. Monthly revenue — last 6 months ───────────────────────────────────
  const now = new Date();
  const months: { month: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();

    let rev = 0;
    let cnt = 0;
    for (const o of allOrders) {
      const od = new Date(o.createdAt);
      if (od.getFullYear() === year && od.getMonth() === month) {
        rev += o.brandRevenue;
        cnt++;
      }
    }
    months.push({ month: label, revenue: rev, orders: cnt });
  }

  // ── 6. Top 5 products by revenue ─────────────────────────────────────────
  const productRevMap = new Map<string, { name: string; revenue: number; image: string }>();
  for (const item of orderItemsRaw) {
    const pid = item.productId;
    if (!productRevMap.has(pid)) {
      const prod = products.find((p) => p.id === pid);
      productRevMap.set(pid, {
        name: item.productName,
        revenue: 0,
        image: prod?.imageSrc ?? "",
      });
    }
    productRevMap.get(pid)!.revenue += item.unitPrice * item.quantity;
  }
  const topProducts = Array.from(productRevMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      // Convert to dollars for display
      revenue: Math.round(p.revenue / 100),
      image: p.image,
    }));

  // ── 7. Category breakdown ─────────────────────────────────────────────────
  const catMap = new Map<string, number>();
  for (const item of orderItemsRaw) {
    const prod = products.find((p) => p.id === item.productId);
    const cat = prod?.category?.name ?? "Other";
    catMap.set(cat, (catMap.get(cat) ?? 0) + item.quantity);
  }
  const categoryBreakdown = Array.from(catMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // ── 8. Low stock alerts ────────────────────────────────────────────────────
  const lowStockAlerts: { productId: string; productName: string; productImage: string; size: string; stock: number }[] = [];
  for (const p of products) {
    for (const v of p.variants as { stock: number; size: string }[]) {
      if (v.stock <= 3) {
        lowStockAlerts.push({
          productId: p.id,
          productName: p.name,
          productImage: p.imageSrc,
          size: v.size,
          stock: v.stock,
        });
      }
    }
  }

  // ── 9. Recent orders (last 8) ─────────────────────────────────────────────
  const recentOrders = allOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      // revenue for this brand in cents → dollars
      amount: Math.round(o.brandRevenue / 100),
      // first item's product name as representative
      productName: o.items[0]?.productName ?? "—",
      itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    }));

  return NextResponse.json({
    // KPIs (dollar values)
    totalRevenue: Math.round(totalRevenueCents / 100),
    totalOrders,
    avgOrderValue: Math.round(avgOrderValueCents / 100),
    totalProducts,
    newProducts,
    saleProducts,
    lowStockItems,
    outOfStockItems,

    // Charts
    statusCounts,
    monthlyRevenue: months,
    topProducts,
    categoryBreakdown,

    // Tables
    lowStockAlerts,
    recentOrders,
  });
}
