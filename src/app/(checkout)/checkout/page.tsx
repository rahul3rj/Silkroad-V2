"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

// Load Stripe outside of a component render to avoid recreating it on each render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ["Delivery", "Payment", "Review"] as const;
type Step = (typeof STEPS)[number];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-black border-black"
                    : active
                    ? "border-black bg-white"
                    : "border-black/20 bg-white"
                }`}
              >
                {done ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    className={`text-[8px] font-[metropolisSemiBold] ${
                      active ? "text-black" : "text-black/25"
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase whitespace-nowrap transition-colors duration-300 ${
                  active
                    ? "text-black"
                    : done
                    ? "text-black/60"
                    : "text-black/25"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 h-[1px] mb-4 mx-2 transition-all duration-500 ${
                  done ? "bg-black" : "bg-black/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shared form field ─────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
        {label}
        {required && " *"}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white";

// ── Delivery step ─────────────────────────────────────────────────────────────
function DeliveryStep({
  data,
  onChange,
  onNext,
}: {
  data: DeliveryData;
  onChange: (k: keyof DeliveryData, v: string) => void;
  onNext: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Contact */}
      <div>
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-4 pb-3 border-b border-black/8">
          Contact
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required>
            <input
              type="text"
              required
              value={data.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Last Name" required>
            <input
              type="text"
              required
              value={data.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Email Address" required>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* Shipping address */}
      <div className="pt-2">
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-4 pb-3 border-b border-black/8">
          Shipping Address
        </p>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Address Line 1" required>
            <input
              type="text"
              required
              placeholder="Street address, apartment, suite…"
              value={data.address1}
              onChange={(e) => onChange("address1", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Address Line 2">
            <input
              type="text"
              placeholder="Apartment, suite, unit (optional)"
              value={data.address2}
              onChange={(e) => onChange("address2", e.target.value)}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" required>
              <input
                type="text"
                required
                value={data.city}
                onChange={(e) => onChange("city", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="State / Province" required>
              <input
                type="text"
                required
                value={data.state}
                onChange={(e) => onChange("state", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Postal Code" required>
              <input
                type="text"
                required
                value={data.zip}
                onChange={(e) => onChange("zip", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Country" required>
            <div className="relative">
              <select
                required
                value={data.country}
                onChange={(e) => onChange("country", e.target.value)}
                className={`${inputCls} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">Select country…</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="IT">Italy</option>
                <option value="JP">Japan</option>
                <option value="SG">Singapore</option>
                <option value="AE">UAE</option>
                <option value="IN">India</option>
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/40"
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
              >
                <path
                  d="M1 1l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Field>
        </div>
      </div>

      {/* Shipping method */}
      <div className="pt-2">
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-4 pb-3 border-b border-black/8">
          Shipping Method
        </p>
        <div className="space-y-2">
          {[
            {
              id: "standard",
              label: "Standard Delivery",
              sub: "5–7 business days",
              price: "Free",
            },
            {
              id: "express",
              label: "Express Delivery",
              sub: "2–3 business days",
              price: "$9.99",
            },
            {
              id: "overnight",
              label: "Overnight Delivery",
              sub: "Next business day",
              price: "$24.99",
            },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center justify-between px-5 py-4 border cursor-pointer transition-all duration-200 group ${
                data.shipping === opt.id
                  ? "border-black bg-black/[0.02]"
                  : "border-black/12 hover:border-black/30"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Radio */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
                    data.shipping === opt.id
                      ? "border-black"
                      : "border-black/25"
                  }`}
                >
                  {data.shipping === opt.id && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
                <input
                  type="radio"
                  name="shipping"
                  value={opt.id}
                  checked={data.shipping === opt.id}
                  onChange={(e) => onChange("shipping", e.target.value)}
                  className="sr-only"
                />
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wide">
                    {opt.label}
                  </p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                    {opt.sub}
                  </p>
                </div>
              </div>
              <span className="font-[metropolisSemiBold] text-[11px] tracking-wider text-black">
                {opt.price}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-12 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}

// ── Payment step ──────────────────────────────────────────────────────────────
// Rendered inside <Elements> so it can access the Stripe hooks
function PaymentStepInner({
  data,
  onChange,
  onNext,
  onBack,
  cardError,
  setCardError,
}: {
  data: PaymentData;
  onChange: (k: keyof PaymentData, v: string) => void;
  onNext: () => void;
  onBack: () => void;
  cardError: string | null;
  setCardError: (e: string | null) => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-4 pb-3 border-b border-black/8">
          Card Details
        </p>

        {/* Accepted card type indicators */}
        <div className="flex items-center gap-2.5 mb-5">
          {["VISA", "MC", "AMEX"].map((card) => (
            <div
              key={card}
              className="px-3 py-1.5 border border-black/10 font-[metropolis] text-[9px] tracking-[0.12em] text-[#787878]"
            >
              {card}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Field label="Cardholder Name" required>
            <input
              type="text"
              required
              placeholder="As it appears on your card"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Stripe CardElement — handles number, expiry, and CVV securely */}
          <Field label="Card Information" required>
            <div className="border border-black/15 px-4 bg-white focus-within:border-black/50 transition-colors duration-200 flex items-center" style={{ height: "50px" }}>
              <CardElement
                options={{
                  style: {
                    base: {
                      // Stripe's iframe can't access local fonts — use a safe stack
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: "13px",
                      fontWeight: "400",
                      color: "#000000",
                      letterSpacing: "0.02em",
                      "::placeholder": { color: "#bbbbbb" },
                      iconColor: "#000000",
                    },
                    invalid: {
                      color: "#dc2626",
                      iconColor: "#dc2626",
                    },
                  },
                  hidePostalCode: true,
                }}
                className="w-full"
                onChange={(e) => {
                  if (e.error) setCardError(e.error.message);
                  else setCardError(null);
                }}
              />
            </div>
            {cardError && (
              <p className="mt-1.5 font-[metropolis] text-[10px] text-red-600 tracking-wider">
                {cardError}
              </p>
            )}
          </Field>
        </div>
      </div>

      {/* Billing address toggle */}
      <div className="pt-2">
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-4 pb-3 border-b border-black/8">
          Billing Address
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={data.sameAsShipping === "yes"}
              onChange={(e) =>
                onChange("sameAsShipping", e.target.checked ? "yes" : "no")
              }
              className="sr-only peer"
            />
            <div className="w-4 h-4 border border-black/25 peer-checked:bg-black peer-checked:border-black transition-all duration-200 flex items-center justify-center">
              {data.sameAsShipping === "yes" && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path
                    d="M1 3l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="font-[metropolis] text-[11px] text-[#555] tracking-wider leading-relaxed">
            Same as shipping address
          </span>
        </label>
      </div>

      {/* Secure notice */}
      <div className="flex items-center gap-2 pt-1">
        <svg
          width="11"
          height="13"
          viewBox="0 0 12 14"
          fill="none"
          className="text-black/30 shrink-0"
        >
          <rect x="0.5" y="5.5" width="11" height="8" rx="1.5" stroke="currentColor" />
          <path d="M3 5.5V4a3 3 0 016 0v1.5" stroke="currentColor" strokeLinecap="round" />
          <circle cx="6" cy="9.5" r="1" fill="currentColor" />
        </svg>
        <span className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider">
          Payments are processed securely by Stripe. We never store your card details.
        </span>
      </div>

      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M5 1L1 5l4 4M1 5h10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <button
          type="submit"
          className="px-12 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300"
        >
          Review Order
        </button>
      </div>
    </form>
  );
}

// Wrapper — the Elements context is provided by the outer CheckoutPage
function PaymentStep({
  data,
  onChange,
  onNext,
  onBack,
  cardError,
  setCardError,
}: {
  data: PaymentData;
  onChange: (k: keyof PaymentData, v: string) => void;
  onNext: () => void;
  onBack: () => void;
  cardError: string | null;
  setCardError: (e: string | null) => void;
}) {
  return (
    <PaymentStepInner
      data={data}
      onChange={onChange}
      onNext={onNext}
      onBack={onBack}
      cardError={cardError}
      setCardError={setCardError}
    />
  );
}

// ── Review step ───────────────────────────────────────────────────────────────
function ReviewStep({
  delivery,
  payment,
  items,
  subtotal,
  shipping,
  total,
  onBack,
  onPlace,
  placing,
  error,
}: {
  delivery: DeliveryData;
  payment: PaymentData;
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  shipping: number;
  total: number;
  onBack: () => void;
  onPlace: () => void;
  placing: boolean;
  error?: string | null;
}) {
  const maskedCard = "•••• •••• •••• ••••"; // actual card handled by Stripe

  return (
    <div className="space-y-6">
      {/* Items */}
      <div>
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-4 pb-3 border-b border-black/8">
          Order Items
        </p>
        <div className="divide-y divide-black/5">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-4">
              <div className="w-16 h-20 bg-black/5 shrink-0 overflow-hidden">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <p className="font-[metropolisSemiBold] text-[9px] tracking-[0.15em] uppercase text-[#787878]">
                    {item.brand}
                  </p>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wide mt-0.5">
                    {item.productName}
                  </p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-1">
                    Size: {item.size} · Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-[metropolis] text-[11px] text-black tracking-wider">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Payment summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Delivery summary */}
        <div className="border border-black/8 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black">
              Delivery
            </p>
            <button
              onClick={onBack}
              className="font-[metropolis] text-[9px] tracking-[0.12em] uppercase text-[#787878] underline underline-offset-2 hover:text-black transition-colors duration-200"
            >
              Edit
            </button>
          </div>
          <p className="font-[metropolis] text-[11px] text-black tracking-wide">
            {delivery.firstName} {delivery.lastName}
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wide mt-1 leading-relaxed">
            {delivery.address1}
            {delivery.address2 && `, ${delivery.address2}`}
            <br />
            {delivery.city}, {delivery.state} {delivery.zip}
            <br />
            {delivery.country}
          </p>
          <p className="font-[metropolis] text-[10px] text-black tracking-wider mt-2 capitalize">
            {delivery.shipping} delivery
          </p>
        </div>

        {/* Payment summary */}
        <div className="border border-black/8 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black">
              Payment
            </p>
            <button
              onClick={onBack}
              className="font-[metropolis] text-[9px] tracking-[0.12em] uppercase text-[#787878] underline underline-offset-2 hover:text-black transition-colors duration-200"
            >
              Edit
            </button>
          </div>
          <p className="font-[metropolis] text-[11px] text-black tracking-wide">
            {payment.name || "—"}
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-widest mt-1">
            Credit / Debit Card
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <svg width="10" height="12" viewBox="0 0 12 14" fill="none" className="text-black/30 shrink-0">
              <rect x="0.5" y="5.5" width="11" height="8" rx="1.5" stroke="currentColor" />
              <path d="M3 5.5V4a3 3 0 016 0v1.5" stroke="currentColor" strokeLinecap="round" />
              <circle cx="6" cy="9.5" r="1" fill="currentColor" />
            </svg>
            <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider">
              Secured by Stripe
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M5 1L1 5l4 4M1 5h10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <div className="flex flex-col items-end gap-2">
          {error && (
            <p className="font-[metropolis] text-[10px] text-red-600 tracking-wider text-right max-w-xs">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={onPlace}
            disabled={placing}
            className="px-12 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {placing && (
              <svg
                className="animate-spin"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.25"
                />
                <path
                  d="M12 2a10 10 0 0110 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {placing ? "Placing Order…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order summary sidebar ─────────────────────────────────────────────────────
function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
}: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="w-full md:w-80 shrink-0">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="md:hidden w-full flex items-center justify-between px-5 py-4 bg-black/[0.02] border border-black/8 mb-4 font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black"
      >
        <span>Order Summary</span>
        <div className="flex items-center gap-3">
          <span className="font-[metropolis]">${total.toFixed(2)}</span>
          <svg
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
          >
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      <div className={`border border-black/8 ${open ? "block" : "hidden md:block"}`}>
        {/* Section header */}
        <div className="hidden md:block px-6 py-5 border-b border-black/8">
          <h2 className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black">
            Order Summary
          </h2>
        </div>

        {/* Items */}
        <div className="px-6 py-5 divide-y divide-black/5 max-h-72 overflow-y-auto">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-3.5 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-18 bg-black/5 overflow-hidden">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover object-top"
                    style={{ height: "72px" }}
                  />
                </div>
                {/* Qty badge */}
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-black text-white text-[8px] font-[metropolisSemiBold] flex items-center justify-center rounded-full min-w-[18px] min-h-[18px]">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  <p className="font-[metropolisSemiBold] text-[8px] tracking-[0.15em] uppercase text-[#787878] truncate">
                    {item.brand}
                  </p>
                  <p className="font-[metropolis] text-[11px] text-black tracking-wide leading-snug mt-0.5 line-clamp-2">
                    {item.productName}
                  </p>
                  <p className="font-[metropolis] text-[9px] text-[#aaa] tracking-wider mt-1">
                    Size: {item.size}
                  </p>
                </div>
                <p className="font-[metropolis] text-[11px] text-black tracking-wider">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div className="px-6 py-4 border-t border-black/8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Promo code"
              className="flex-1 border border-black/15 px-3 py-2.5 font-[metropolis] text-[11px] text-black placeholder:text-black/25 outline-none focus:border-black/40 transition-colors duration-200 bg-white"
            />
            <button
              type="button"
              className="px-4 py-2.5 border border-black/15 font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-5 border-t border-black/8 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878]">
              Subtotal
            </span>
            <span className="font-[metropolis] text-[10px] tracking-wider text-black">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878]">
              Shipping
            </span>
            <span className="font-[metropolis] text-[10px] tracking-wider text-black">
              {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878]">
              Tax
            </span>
            <span className="font-[metropolis] text-[10px] tracking-wider text-black">
              Calculated at review
            </span>
          </div>
          <div className="border-t border-black/8 pt-3 flex justify-between items-center">
            <span className="font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black">
              Total
            </span>
            <span className="font-[metropolisSemiBold] text-[13px] tracking-wider text-black">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Data types ────────────────────────────────────────────────────────────────
interface DeliveryData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  shipping: string;
}

interface PaymentData {
  name: string;
  sameAsShipping: string;
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
// Inner component — has access to Stripe context (must be inside <Elements>)
function CheckoutInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const stripe = useStripe();
  const elements = useElements();

  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [delivery, setDelivery] = useState<DeliveryData>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    shipping: "standard",
  });

  const [payment, setPayment] = useState<PaymentData>({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    sameAsShipping: "yes",
  });

  const shippingMethodMap: Record<string, "STANDARD" | "EXPRESS" | "OVERNIGHT"> = {
    standard: "STANDARD",
    express: "EXPRESS",
    overnight: "OVERNIGHT",
  };

  const shippingMethodEnum = shippingMethodMap[delivery.shipping] ?? "STANDARD";

  // These are displayed only — actual totals are authoritative on the server.
  const shippingCost =
    delivery.shipping === "express"
      ? 9.99
      : delivery.shipping === "overnight"
      ? 24.99
      : subtotal >= 150
      ? 0
      : 9.99;

  const total = subtotal + shippingCost;

  const [orderError, setOrderError] = useState<string | null>(null);

  const handlePlaceOrder = useCallback(async () => {
    if (!stripe || !elements) {
      setOrderError("Payment system not loaded. Please refresh and try again.");
      return;
    }

    setPlacing(true);
    setOrderError(null);

    try {
      // ── Step 1: Create a PaymentIntent on the server ─────────────────────
      const intentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
          shippingMethod: shippingMethodEnum,
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        setOrderError(intentData?.error ?? "Failed to initialise payment. Please try again.");
        setPlacing(false);
        return;
      }

      const { clientSecret } = intentData as { clientSecret: string };

      // ── Step 2: Confirm the payment using the Stripe CardElement ─────────
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setOrderError("Card element not found. Please refresh and try again.");
        setPlacing(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: payment.name || undefined,
              email: delivery.email || undefined,
              phone: delivery.phone || undefined,
              ...(payment.sameAsShipping === "yes"
                ? {
                    address: {
                      line1: delivery.address1,
                      line2: delivery.address2 || undefined,
                      city: delivery.city,
                      state: delivery.state,
                      postal_code: delivery.zip,
                      country: delivery.country,
                    },
                  }
                : {}),
            },
          },
        }
      );

      if (stripeError) {
        setOrderError(stripeError.message ?? "Payment failed. Please try again.");
        setPlacing(false);
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        setOrderError("Payment was not completed. Please try again.");
        setPlacing(false);
        return;
      }

      // ── Step 3: Create the order in our DB, linked to the PaymentIntent ──
      const orderBody = {
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
        shippingMethod: shippingMethodEnum,
        shippingAddress: {
          fullName: `${delivery.firstName} ${delivery.lastName}`.trim(),
          line1: delivery.address1,
          line2: delivery.address2 || undefined,
          city: delivery.city,
          state: delivery.state,
          postcode: delivery.zip,
          country: delivery.country,
          phone: delivery.phone || undefined,
        },
        stripePaymentIntentId: paymentIntent.id,
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        // Payment succeeded but order creation failed — show a clear message
        // so support can match via the PaymentIntent ID
        setOrderError(
          orderData?.error ??
            `Payment was taken but order creation failed. Please contact support with reference: ${paymentIntent.id}`
        );
        setPlacing(false);
        return;
      }

      // ── Step 4: Clear cart and redirect ──────────────────────────────────
      clearCart(isLoggedIn);
      router.push(`/order-confirmation/${orderData.order.id}`);
    } catch {
      setOrderError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }, [stripe, elements, items, delivery, payment, shippingMethodEnum, isLoggedIn, clearCart, router]);

  // Empty cart guard
  if (items.length === 0 && !placing) {
    return (
      <main className="min-h-screen bg-white pt-20 pb-24">
        <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
          <Link
            href="/"
            className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors"
          >
            Silkroad
          </Link>
          <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
          <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
            Checkout
          </span>
        </div>
        <div className="max-w-2xl mx-auto px-6 pt-24 text-center">
          <div className="w-12 h-12 border border-black/10 flex items-center justify-center mx-auto mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/30">
              <path
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
            Your Bag is Empty
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mb-8">
            Add items to your bag before checking out.
          </p>
          <Link
            href="/"
            className="inline-block px-10 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-24">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors"
        >
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <Link
          href="/cart"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors"
        >
          Bag
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          Checkout
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10">
        {/* Page title */}
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-8">
          Checkout
        </h1>

        {/* Step indicator */}
        <div className="mb-10">
          <StepIndicator current={step} />
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col-reverse md:flex-row gap-10 items-start">
          {/* ── Left: Form area ── */}
          <div className="flex-1 min-w-0">
            {step === 0 && (
              <DeliveryStep
                data={delivery}
                onChange={(k, v) => setDelivery((d) => ({ ...d, [k]: v }))}
                onNext={() => setStep(1)}
              />
            )}
            {/* Keep PaymentStep mounted on step 2 (hidden) so CardElement stays
                in the DOM and elements.getElement(CardElement) works at Place Order */}
            <div className={step === 1 || step === 2 ? (step === 1 ? "block" : "hidden") : "hidden"}>
              <PaymentStep
                data={payment}
                onChange={(k, v) => setPayment((p) => ({ ...p, [k]: v }))}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
                cardError={cardError}
                setCardError={setCardError}
              />
            </div>
            {step === 2 && (
              <ReviewStep
                delivery={delivery}
                payment={payment}
                items={items}
                subtotal={subtotal}
                shipping={shippingCost}
                total={total}
                onBack={() => setStep(1)}
                onPlace={handlePlaceOrder}
                placing={placing}
                error={orderError}
              />
            )}
          </div>

          {/* ── Right: Order summary ── */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shippingCost}
            total={total}
          />
        </div>
      </div>
    </main>
  );
}

// Outer component — wraps everything in the Stripe Elements provider
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}
