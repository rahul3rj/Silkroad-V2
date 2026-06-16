"use client";

import Link from "next/link";

export interface RecentOrder {
  id: string;
  status: string;
  createdAt: string | Date;
  customerName: string;
  customerEmail: string;
  amount: number;       // dollars
  productName: string;  // representative first product
  itemCount: number;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Pending",    className: "text-[#787878] border-black/20" },
  PROCESSING: { label: "Processing", className: "text-black border-black/30" },
  SHIPPED:    { label: "Shipped",    className: "text-black border-black/30" },
  DELIVERED:  { label: "Delivered",  className: "text-black border-black" },
  CANCELLED:  { label: "Cancelled",  className: "text-[#bbb] border-black/10" },
  REFUNDED:   { label: "Refunded",   className: "text-[#bbb] border-black/10" },
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="border border-black/8">
      {/* Header */}
      <div className="px-7 py-5 border-b border-black/8 flex items-baseline justify-between">
        <h2 className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black">
          Recent Orders
        </h2>
        <Link
          href="/admin/orders"
          className="font-[metropolis] text-[10px] text-[#787878] tracking-wider hover:text-black transition-colors duration-200 uppercase tracking-[0.12em]"
        >
          View All →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5">
              {["Order", "Product", "Customer", "Amount", "Status", "Date"].map((h) => (
                <th
                  key={h}
                  className="px-7 py-3 text-left font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] whitespace-nowrap font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-7 py-12 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
                  No orders yet
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const badge = STATUS_BADGE[order.status] ?? { label: order.status, className: "text-[#787878] border-black/20" };
              return (
                <tr
                  key={order.id}
                  className="hover:bg-black/[0.015] transition-colors duration-150"
                >
                  <td className="px-7 py-4">
                    <Link
                      href={`/admin/orders`}
                      className="font-[metropolis] text-[10px] tracking-wider text-[#787878] hover:text-black transition-colors whitespace-nowrap"
                    >
                      {order.id.slice(0, 10)}…
                    </Link>
                  </td>
                  <td className="px-7 py-4">
                    <p className="font-[metropolis] text-[12px] text-black truncate max-w-36">
                      {order.productName}
                    </p>
                    <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </td>
                  <td className="px-7 py-4">
                    <p className="font-[metropolis] text-[12px] text-black whitespace-nowrap">
                      {order.customerName}
                    </p>
                    <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider">
                      {order.customerEmail}
                    </p>
                  </td>
                  <td className="px-7 py-4 font-[metropolisSemiBold] text-[12px] text-black whitespace-nowrap">
                    ${order.amount.toLocaleString()}
                  </td>
                  <td className="px-7 py-4 whitespace-nowrap">
                    <span className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase border px-2.5 py-1 ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-7 py-4 font-[metropolis] text-[11px] text-[#787878] whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
