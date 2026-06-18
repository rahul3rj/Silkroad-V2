"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/admin/KpiCard";
import RevenueChart, { MonthlyRevenue } from "@/components/admin/RevenueChart";
import OrdersDonut from "@/components/admin/OrdersDonut";
import TopProductsChart from "@/components/admin/TopProductsChart";
import RecentOrdersTable, { RecentOrder } from "@/components/admin/RecentOrdersTable";

// ── Types matching /api/admin/stats response ──────────────────────────────────
interface LowStockAlert {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  stock: number;
}

interface StatusCounts {
  PENDING: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
  REFUNDED: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  newProducts: number;
  saleProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  statusCounts: StatusCounts;
  monthlyRevenue: MonthlyRevenue[];
  topProducts: { name: string; revenue: number }[];
  categoryBreakdown: { name: string; value: number }[];
  lowStockAlerts: LowStockAlert[];
  recentOrders: RecentOrder[];
}

// ── Skeleton placeholder ──────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-black/[0.04] animate-pulse rounded-sm ${className ?? ""}`} />
  );
}

function KpiSkeleton() {
  return (
    <div className="border border-black/8 p-6 space-y-4">
      <Skeleton className="w-9 h-9" />
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then((data: DashboardStats) => setStats(data))
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="min-h-screen bg-white pt-6.5 pb-24">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">
          Admin
        </span>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          Dashboard
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">

        {/* ── Page title ── */}
        <div className="mb-10">
          <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">
            Dashboard
          </h1>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
            {loading ? "Loading…" : error ? error : "Real-time overview of your brand"}
          </p>
        </div>

        {error && (
          <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider mb-8">{error}</p>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : stats ? (
            <>
              <KpiCard
                label="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                subValue="All time"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                delay={0}
              />
              <KpiCard
                label="Total Orders"
                value={String(stats.totalOrders)}
                subValue={`${stats.statusCounts.DELIVERED} delivered`}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                delay={80}
              />
              <KpiCard
                label="Avg Order Value"
                value={`$${stats.avgOrderValue.toLocaleString()}`}
                subValue="Per transaction"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="16,7 22,7 22,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                delay={160}
              />
              <KpiCard
                label="Active Listings"
                value={String(stats.totalProducts)}
                subValue={`${stats.newProducts} new · ${stats.saleProducts} on sale`}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                }
                delay={240}
              />
            </>
          ) : null}
        </div>

        {/* ── Charts row ── */}
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            <div className="xl:col-span-2 border border-black/8 p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-36 mb-6" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="border border-black/8 p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-28 mb-6" />
              <Skeleton className="h-40 w-full rounded-full mx-auto max-w-40" />
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            <div className="xl:col-span-2">
              <RevenueChart data={stats.monthlyRevenue} />
            </div>
            <div>
              <OrdersDonut data={stats.statusCounts} />
            </div>
          </div>
        ) : null}

        {/* ── Top products + Category split ── */}
        {stats && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-10">
            <div className="xl:col-span-2">
              <TopProductsChart data={stats.topProducts} />
            </div>

            <div className="space-y-4">
              {/* Category breakdown */}
              <div className="border border-black/8 p-6">
                <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] mb-1">
                  Category Split
                </p>
                <p className="font-[metropolisSemiBold] text-[20px] tracking-[-0.01em] text-black mb-5">
                  By Orders
                </p>
                <div className="space-y-3">
                  {stats.categoryBreakdown.length === 0 ? (
                    <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider uppercase">No order data</p>
                  ) : (
                    stats.categoryBreakdown.map((cat) => {
                      const total = stats.categoryBreakdown.reduce((s, c) => s + c.value, 0);
                      const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-[metropolis] text-[10px] tracking-[0.1em] uppercase text-[#787878]">
                              {cat.name}
                            </span>
                            <span className="font-[metropolis] text-[10px] text-black">{pct}%</span>
                          </div>
                          <div className="h-px bg-black/10 relative">
                            <div
                              className="absolute left-0 top-0 h-full bg-black transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* New / Sale tiles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-black/8 p-5">
                  <p className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] mb-2">New In</p>
                  <p className="font-[metropolisSemiBold] text-[28px] text-black leading-none">{stats.newProducts}</p>
                </div>
                <div className="border border-black/8 p-5">
                  <p className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] mb-2">On Sale</p>
                  <p className="font-[metropolisSemiBold] text-[28px] text-black leading-none">{stats.saleProducts}</p>
                </div>
              </div>

              {/* Inventory health */}
              <div className="border border-black/8 p-5">
                <p className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] mb-3">Inventory Health</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider">Low stock (≤3)</span>
                    <span className={`font-[metropolisSemiBold] text-[13px] ${stats.lowStockItems > 0 ? "text-black" : "text-[#bbb]"}`}>
                      {stats.lowStockItems}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider">Out of stock</span>
                    <span className={`font-[metropolisSemiBold] text-[13px] ${stats.outOfStockItems > 0 ? "text-black" : "text-[#bbb]"}`}>
                      {stats.outOfStockItems}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Low Stock Alerts ── */}
        {stats && stats.lowStockAlerts.length > 0 && (
          <div className="border border-black/8 mb-10">
            <div className="px-7 py-5 border-b border-black/8 flex items-center gap-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h2 className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black">
                Inventory Alerts
              </h2>
              <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider ml-auto">
                {stats.lowStockAlerts.length} item{stats.lowStockAlerts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/5">
              {stats.lowStockAlerts.slice(0, 6).map((alert) => (
                <div
                  key={`${alert.productId}-${alert.size}`}
                  className="flex items-center gap-4 px-7 py-4"
                >
                  <div className="w-9 h-9 shrink-0 bg-[#f9f9f9] border border-black/8 overflow-hidden">
                    <img src={alert.productImage} alt={alert.productName} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[metropolis] text-[11px] text-black truncate">{alert.productName}</p>
                    <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                      Size {alert.size}
                    </p>
                  </div>
                  <span className={`shrink-0 font-[metropolisSemiBold] text-[9px] tracking-[0.18em] uppercase border px-2.5 py-1 ${
                    alert.stock === 0
                      ? "text-black border-black"
                      : "text-[#787878] border-black/20"
                  }`}>
                    {alert.stock === 0 ? "Out of Stock" : `${alert.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Orders ── */}
        {loading ? (
          <div className="border border-black/8 p-6 space-y-3">
            <Skeleton className="h-4 w-32 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : stats ? (
          <RecentOrdersTable orders={stats.recentOrders} />
        ) : null}

      </div>
    </section>
  );
}
