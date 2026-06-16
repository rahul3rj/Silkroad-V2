"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brandName: string;
  size: string;
  quantity: number;
  unitPrice: number; // cents
}

interface Order {
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
  items: OrderItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const TIMELINE_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

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

const SHIPPING_LABEL: Record<string, string> = {
  STANDARD:  "Standard (5–7 business days)",
  EXPRESS:   "Express (2–3 business days)",
  OVERNIGHT: "Overnight (next business day)",
};

// ── Page ──────────────────────────────────────────────────────────────────────
type Props = { params: Promise<{ orderId: string }> };

export default function OrderDetailPage({ params }: Props) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Keep these at the top — never after a conditional return
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then(async (r) => {
        if (r.status === 404 || r.status === 403) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (data?.order) setOrder(data.order);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <AccountShell active="/orders" breadcrumb="Order" title="My Account">
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin text-black/20" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </AccountShell>
    );
  }

  if (notFound || !order) {
    return (
      <AccountShell active="/orders" breadcrumb="Order Not Found" title="My Account">
        <div className="text-center py-20">
          <div className="w-12 h-12 border border-black/10 flex items-center justify-center mx-auto mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/30">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
            Order not found
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mb-8">
            We couldn&apos;t find this order.
          </p>
          <Link
            href="/orders"
            className="inline-block px-10 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 transition-all duration-300"
          >
            Back to Orders
          </Link>
        </div>
      </AccountShell>
    );
  }

  const stepIndex = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const canCancel = order.status === "PENDING" || order.status === "PROCESSING";

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${order!.id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
        setShowCancelModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setCancelError(data?.error ?? "Failed to cancel order.");
      }
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AccountShell
      active="/orders"
      breadcrumb={`Order ${order.id.slice(0, 14)}…`}
      title="My Account"
    >
      {/* Section header */}
      <div className="border-b border-black/8 pb-5 mb-8 flex items-center justify-between">
        <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
          Order Details
        </h2>
        <Link
          href="/orders"
          className="flex items-center gap-2 font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All Orders
        </Link>
      </div>

      <div className="space-y-6">

        {/* ── Order meta row ── */}
        <div className="border border-black/8 px-6 py-5 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-5">
            <div>
              <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-1">Order</p>
              <p className="font-[metropolisSemiBold] text-[11px] tracking-wide text-black font-mono">{order.id}</p>
            </div>
            <div className="w-[1px] h-8 bg-black/8 self-center" />
            <div>
              <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-1">Placed</p>
              <p className="font-[metropolis] text-[12px] tracking-wide text-black">{fmtDate(order.createdAt)}</p>
            </div>
            <div className="w-[1px] h-8 bg-black/8 self-center" />
            <div>
              <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-1">Shipping</p>
              <p className="font-[metropolis] text-[12px] tracking-wide text-black">
                {SHIPPING_LABEL[order.shippingMethod] ?? order.shippingMethod}
              </p>
            </div>
          </div>
          <span className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 ${STATUS_STYLES[order.status] ?? "text-black bg-black/5"}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* ── Order timeline ── */}
        {!isCancelled && (
          <div className="border border-black/8 px-6 py-6">
            <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-6">
              Order Progress
            </p>
            <div className="flex items-start">
              {TIMELINE_STEPS.map((step, i) => {
                const done = stepIndex >= 0 && i <= stepIndex;
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center">
                    <div className="flex items-center w-full">
                      <div className={`flex-1 h-[1px] ${i === 0 ? "invisible" : done ? "bg-black" : "bg-black/10"}`} />
                      <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 shrink-0 ${done ? "bg-black border-black" : "bg-white border-black/20"}`} />
                      <div className={`flex-1 h-[1px] ${isLast ? "invisible" : i < stepIndex ? "bg-black" : "bg-black/10"}`} />
                    </div>
                    <p className={`mt-3 font-[metropolis] text-[9px] tracking-[0.12em] uppercase text-center ${done ? "text-black" : "text-black/25"}`}>
                      {STATUS_LABEL[step]}
                    </p>
                  </div>
                );
              })}
            </div>

            {order.trackingNumber && (
              <div className="mt-6 pt-5 border-t border-black/8 flex flex-wrap items-center gap-4 justify-between">
                <div>
                  <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-1">Tracking</p>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">
                    {order.trackingCarrier && `${order.trackingCarrier} · `}{order.trackingNumber}
                  </p>
                </div>
                <button className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black border border-black/15 px-5 py-2.5 hover:border-black hover:bg-black hover:text-white transition-all duration-300">
                  Track Shipment
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Items ── */}
        <div className="border border-black/8">
          <div className="px-6 py-4 border-b border-black/8">
            <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa]">
              Items ({itemCount})
            </p>
          </div>

          <div className="divide-y divide-black/5">
            {order.items.map((item) => (
              <div key={item.id} className="px-6 py-5 flex gap-5 items-start">
                <div className="w-16 h-20 shrink-0 bg-[#f9f9f9] overflow-hidden">
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[metropolisSemiBold] text-[9px] tracking-[0.15em] uppercase text-[#787878] mb-0.5">{item.brandName}</p>
                  <p className="font-[metropolis] text-[13px] text-black tracking-wide mb-1">{item.productName}</p>
                  <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider">
                    Size: {item.size}{item.quantity > 1 && ` · Qty: ${item.quantity}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[metropolis] text-[13px] text-black tracking-wider">{usd(item.unitPrice * item.quantity)}</p>
                  {item.quantity > 1 && (
                    <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider mt-0.5">{usd(item.unitPrice)} each</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-5 border-t border-black/8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa]">Subtotal</span>
              <span className="font-[metropolis] text-[12px] text-black tracking-wider">{usd(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa]">Shipping</span>
              <span className="font-[metropolis] text-[12px] text-black tracking-wider">
                {order.shippingCost === 0 ? "Free" : usd(order.shippingCost)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa]">Discount</span>
                <span className="font-[metropolis] text-[12px] text-black tracking-wider">−{usd(order.discount)}</span>
              </div>
            )}
            <div className="border-t border-black/8 pt-3 flex justify-between items-center">
              <span className="font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black">Total</span>
              <span className="font-[metropolisSemiBold] text-[14px] text-black tracking-wider">{usd(order.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Shipping address ── */}
        <div className="border border-black/8 px-6 py-5">
          <p className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#aaa] mb-4">
            {order.status === "DELIVERED" ? "Delivered To" : "Shipping To"}
          </p>
          <div className="font-[metropolis] text-[12px] text-black tracking-wide leading-relaxed">
            <p className="font-[metropolisSemiBold]">{order.shippingFullName}</p>
            <p>{order.shippingLine1}</p>
            {order.shippingLine2 && <p>{order.shippingLine2}</p>}
            <p>{order.shippingCity}, {order.shippingState} {order.shippingPostcode}</p>
            <p>{order.shippingCountry}</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 pt-2">
          {cancelError && (
            <p className="font-[metropolis] text-[10px] text-red-600 tracking-wider">
              {cancelError}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-7 py-3.5 border border-black/15 text-black font-[metropolis] text-[10px] tracking-[0.12em] uppercase hover:border-red-400 hover:text-red-600 transition-colors duration-200"
              >
                Cancel Order
              </button>
            )}
            <button className="px-7 py-3.5 border border-black/15 text-black font-[metropolis] text-[10px] tracking-[0.12em] uppercase hover:border-black transition-colors duration-200">
              Need Help?
            </button>
          </div>
        </div>

      </div>

      {/* ── Cancel Order Modal ── */}
      {showCancelModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all duration-300"
            onClick={!cancelling ? () => setShowCancelModal(false) : undefined}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white w-full max-w-md border border-black/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-black/8">
                <h3 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
                  Cancel Order
                </h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors duration-200 disabled:opacity-40"
                  aria-label="Close"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-7">
                <p className="font-[metropolis] text-[15px] text-black tracking-[-0.01em] mb-3">
                  Are you sure you want to cancel this order?
                </p>
                <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed">
                  Once cancelled, this action{" "}
                  <span className="text-black font-[metropolisSemiBold]">cannot be undone</span>.
                  Your payment will be refunded according to our returns policy.
                </p>
                {cancelError && (
                  <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider mt-4">
                    {cancelError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-8 pb-8 flex items-center justify-between gap-4">
                <button
                  onClick={() => { setShowCancelModal(false); setCancelError(null); }}
                  disabled={cancelling}
                  className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200 disabled:opacity-40"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-8 py-3.5 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase hover:bg-black/80 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Cancelling…
                    </>
                  ) : (
                    "Yes, Cancel Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AccountShell>
  );
}
