"use client";

// /admin/orders — Brand-scoped order management.
// Lists all orders for the admin's brand, newest first.
// Sort: new→old, old→new, by status.
// Status transitions: PROCESSING → SHIPPED → DELIVERED.

import { useEffect, useState, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  brandName: string;
  size: string;
  quantity: number;
  unitPrice: number; // cents
}

interface OrderUser {
  id: string;
  name: string | null;
  email: string;
}

interface AdminOrder {
  id: string;
  createdAt: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingMethod: string;
  shippingFullName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostcode: string;
  shippingCountry: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  adminNote: string | null;
  user: OrderUser;
  items: OrderItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "text-[#787878] bg-black/[0.03] border border-black/10",
  PROCESSING: "text-amber-700 bg-amber-50 border border-amber-200",
  SHIPPED:    "text-blue-700 bg-blue-50 border border-blue-200",
  DELIVERED:  "text-green-700 bg-green-50 border border-green-200",
  CANCELLED:  "text-red-600 bg-red-50 border border-red-200",
  REFUNDED:   "text-[#787878] bg-black/[0.03] border border-black/10",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

// Which transitions each status allows
const NEXT_STATUSES: Record<string, string[]> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
  REFUNDED:   [],
};

type SortOption = "newest" | "oldest" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// ── Status dropdown ───────────────────────────────────────────────────────────
function StatusDropdown({
  orderId,
  current,
  onUpdate,
}: {
  orderId: string;
  current: string;
  onUpdate: (orderId: string, newStatus: string) => void;
}) {
  const next = NEXT_STATUSES[current] ?? [];
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (next.length === 0) {
    return (
      <span
        className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 ${
          STATUS_STYLES[current] ?? "text-black bg-black/5"
        }`}
      >
        {STATUS_LABEL[current] ?? current}
      </span>
    );
  }

  const handleSelect = async (newStatus: string) => {
    setOpen(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onUpdate(orderId, newStatus);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        className={`flex items-center gap-1.5 font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 transition-opacity ${
          STATUS_STYLES[current] ?? "text-black bg-black/5"
        } ${saving ? "opacity-50" : ""}`}
      >
        {saving ? "Saving…" : STATUS_LABEL[current] ?? current}
        {!saving && (
          <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
            <path d="M1 1l2.5 3L6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-black/12 shadow-lg min-w-[130px]">
            {next.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black hover:bg-black/[0.03] transition-colors duration-150"
              >
                → {STATUS_LABEL[s] ?? s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Expanded order detail row ─────────────────────────────────────────────────
function OrderDetail({ order }: { order: AdminOrder }) {
  return (
    <div className="bg-[#fafafa] border-t border-black/5 px-7 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Items */}
      <div>
        <p className="font-[metropolis] text-[9px] tracking-[0.2em] uppercase text-[#787878] mb-3">
          Items
        </p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-12 bg-[#f0f0f0] overflow-hidden shrink-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[metropolisSemiBold] text-[9px] tracking-[0.12em] uppercase text-[#787878]">
                  {item.brandName}
                </p>
                <p className="font-[metropolis] text-[11px] text-black tracking-wide truncate">
                  {item.productName}
                </p>
                <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider">
                  Size: {item.size} · Qty: {item.quantity}
                </p>
              </div>
              <p className="font-[metropolis] text-[11px] text-black tracking-wider shrink-0">
                {usd(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping + Totals */}
      <div className="space-y-4">
        <div>
          <p className="font-[metropolis] text-[9px] tracking-[0.2em] uppercase text-[#787878] mb-2">
            Ship To
          </p>
          <p className="font-[metropolis] text-[11px] text-black tracking-wide leading-relaxed">
            {order.shippingFullName}<br />
            {order.shippingLine1}
            {order.shippingLine2 && `, ${order.shippingLine2}`}<br />
            {order.shippingCity}, {order.shippingState} {order.shippingPostcode}<br />
            {order.shippingCountry}
          </p>
        </div>

        {order.trackingNumber && (
          <div>
            <p className="font-[metropolis] text-[9px] tracking-[0.2em] uppercase text-[#787878] mb-1">
              Tracking
            </p>
            <p className="font-[metropolis] text-[11px] text-black tracking-wider">
              {order.trackingCarrier && `${order.trackingCarrier} · `}{order.trackingNumber}
            </p>
          </div>
        )}

        <div className="border-t border-black/8 pt-3 space-y-2">
          <div className="flex justify-between text-[10px] font-[metropolis] text-[#787878]">
            <span>Subtotal</span><span>{usd(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-[metropolis] text-[#787878]">
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? "Free" : usd(order.shippingCost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[10px] font-[metropolis] text-[#787878]">
              <span>Discount</span><span>−{usd(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-[metropolisSemiBold] text-[11px] text-black pt-1 border-t border-black/8">
            <span>Total</span><span>{usd(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load orders");
        return r.json();
      })
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filtered = useMemo(() => {
    let list = [...orders];

    // Search by order ID or customer email/name
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.user.email.toLowerCase().includes(q) ||
          (o.user.name ?? "").toLowerCase().includes(q) ||
          o.shippingFullName.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Filter by status then sort newest first within that status
      list = list.filter((o) => o.status === sort);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [orders, sort, search]);

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <section className="min-h-screen bg-white pt-12 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">
          Orders
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">
              Orders
            </h1>
            <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
              {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>

        {error && (
          <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider mb-5">{error}</p>
        )}

        {/* Filters row */}
        <div className="border-b border-black/8 pb-5 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by order ID, customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-black/15 pl-9 pr-4 py-2.5 font-[metropolis] text-[11px] tracking-wider text-black placeholder:text-[#bbb] outline-none focus:border-black/50 transition-colors duration-200 bg-white"
            />
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#aaa] shrink-0">
              <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-3.5 py-2 border transition-all duration-200 ${
                  sort === opt.value
                    ? "bg-black text-white border-black"
                    : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-black/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                {["Order", "Customer", "Date", "Items", "Total", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
                    Loading orders…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
                    {orders.length === 0 ? "No orders yet" : "No orders match your filter"}
                  </td>
                </tr>
              )}
              {filtered.map((order) => {
                const isExpanded = expandedId === order.id;
                const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

                return (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-black/[0.015] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4">
                        <p className="font-[metropolisSemiBold] text-[11px] tracking-wide text-black">
                          {order.id.slice(0, 12)}…
                        </p>
                        <p className="font-[metropolis] text-[9px] text-[#bbb] tracking-wider mt-0.5 capitalize">
                          {order.shippingMethod.toLowerCase()}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <p className="font-[metropolis] text-[11px] text-black tracking-wide">
                          {order.user.name ?? order.shippingFullName}
                        </p>
                        <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-0.5">
                          {order.user.email}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 font-[metropolis] text-[11px] text-[#787878] whitespace-nowrap">
                        {fmtDate(order.createdAt)}
                      </td>

                      {/* Items count */}
                      <td className="px-6 py-4 font-[metropolis] text-[11px] text-[#787878]">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <span className="font-[metropolisSemiBold] text-[12px] text-black">
                          {usd(order.total)}
                        </span>
                      </td>

                      {/* Status — click on the dropdown should not toggle row expand */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <StatusDropdown
                          orderId={order.id}
                          current={order.status}
                          onUpdate={handleStatusUpdate}
                        />
                      </td>

                      {/* Expand toggle */}
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-[metropolis] text-[#787878] text-sm transition-transform inline-block duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          ▾
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="p-0">
                          <OrderDetail order={order} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Status legend */}
        <div className="mt-5 flex flex-wrap gap-4">
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <span key={key} className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 ${STATUS_STYLES[key]}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
