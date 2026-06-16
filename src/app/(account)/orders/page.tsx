"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";

interface OrderItem {
  id: string;
  productName: string;
  brandName: string;
  size: string;
  quantity: number;
  unitPrice: number; // cents
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number; // cents
  shippingCost: number;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  DELIVERED:  "text-black bg-black/5",
  SHIPPED:    "text-black bg-black/5",
  PROCESSING: "text-[#787878] bg-black/[0.03]",
  PENDING:    "text-[#787878] bg-black/[0.03]",
  CANCELLED:  "text-red-600 bg-red-50",
  REFUNDED:   "text-[#787878] bg-black/[0.03]",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Skeleton card for one order row ──────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="border border-black/8 animate-pulse">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <div>
            <div className="h-2 bg-black/5 rounded w-10 mb-1.5" />
            <div className="h-3 bg-black/8 rounded w-36" />
          </div>
          <div className="w-[1px] h-8 bg-black/8" />
          <div>
            <div className="h-2 bg-black/5 rounded w-10 mb-1.5" />
            <div className="h-3 bg-black/8 rounded w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 bg-black/5 rounded w-16" />
          <div className="h-3 bg-black/5 rounded w-16" />
        </div>
      </div>
      {/* Items */}
      <div className="px-6 py-4 divide-y divide-black/5">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex-1">
              <div className="h-2 bg-black/5 rounded w-16 mb-1.5" />
              <div className="h-3 bg-black/8 rounded w-48 mb-1.5" />
              <div className="h-2 bg-black/5 rounded w-24" />
            </div>
            <div className="h-3 bg-black/8 rounded w-14 ml-4" />
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-black/8 flex items-center justify-end gap-3">
        <div className="h-2 bg-black/5 rounded w-8" />
        <div className="h-4 bg-black/8 rounded w-16" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setError("Could not load your orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountShell active="/orders" breadcrumb="My Orders" title="My Account">
      {/* Section header */}
      <div className="border-b border-black/8 pb-5 mb-8">
        <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
          My Orders
        </h2>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <OrderSkeleton key={n} />)}
        </div>
      )}

      {error && !loading && (
        <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider py-8">{error}</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border border-black/10 flex items-center justify-center mx-auto mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/30">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
            No orders yet
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mb-8 max-w-xs mx-auto">
            Your order history will appear here once you&apos;ve made a purchase.
          </p>
          <Link
            href="/"
            className="inline-block px-10 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 transition-all duration-300"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-black/8 group hover:border-black/20 transition-colors duration-200">
              {/* Order header */}
              <div className="px-6 py-4 border-b border-black/8 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-0.5">
                      Order
                    </p>
                    <p className="font-[metropolisSemiBold] text-[12px] tracking-wide text-black font-mono">
                      {order.id.slice(0, 18)}…
                    </p>
                  </div>
                  <div className="w-[1px] h-8 bg-black/8" />
                  <div>
                    <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-0.5">
                      Placed
                    </p>
                    <p className="font-[metropolis] text-[12px] tracking-wide text-black">
                      {fmtDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-3 py-1 ${STATUS_STYLES[order.status] ?? "text-black bg-black/5"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878] hover:text-black underline underline-offset-2 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Order items */}
              <div className="px-6 py-4 divide-y divide-black/5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-[metropolisSemiBold] text-[9px] tracking-[0.15em] uppercase text-[#787878]">
                        {item.brandName}
                      </p>
                      <p className="font-[metropolis] text-[12px] text-black tracking-wide mt-0.5">
                        {item.productName}
                      </p>
                      <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider mt-0.5">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-[metropolis] text-[12px] text-black tracking-wider pl-4 shrink-0">
                      {usd(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order footer */}
              <div className="px-6 py-4 border-t border-black/8 flex items-center justify-between">
                <div className="flex gap-3">
                  {order.status === "SHIPPED" && (
                    <button className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black border border-black/15 px-4 py-2 hover:border-black transition-colors duration-200">
                      Track Order
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa]">
                    Total
                  </span>
                  <span className="font-[metropolisSemiBold] text-[13px] tracking-wider text-black">
                    {usd(order.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
