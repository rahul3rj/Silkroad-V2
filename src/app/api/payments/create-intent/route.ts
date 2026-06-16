// src/app/api/payments/create-intent/route.ts
// POST /api/payments/create-intent
//
// Called when the customer clicks "Continue to Payment" (after delivery).
// Creates a Stripe PaymentIntent server-side so the amount is always
// authoritative. Returns only the clientSecret to the browser — never the
// PaymentIntent ID or full object.
//
// The clientSecret is used by the Stripe.js CardElement to confirm the payment
// in the browser without sensitive card data ever touching our server.

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

// ── Shipping costs (cents) — must mirror /api/orders ─────────────────────────
const SHIPPING_COSTS: Record<string, number> = {
  STANDARD: 0,
  EXPRESS: 999,
  OVERNIGHT: 2499,
};
const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // $150.00

const Schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().int().positive().max(20),
      })
    )
    .min(1)
    .max(50),
  shippingMethod: z.enum(["STANDARD", "EXPRESS", "OVERNIGHT"]).default("STANDARD"),
});

export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { items: clientItems, shippingMethod } = parsed.data;

  // ── Server-side price computation ─────────────────────────────────────────
  const variantRows = await prisma.variant.findMany({
    where: {
      OR: clientItems.map((i) => ({ productId: i.productId, size: i.size })),
    },
    select: {
      id: true,
      productId: true,
      size: true,
      stock: true,
      priceOverride: true,
      product: {
        select: { price: true, salePrice: true },
      },
    },
  });

  const variantMap = new Map(variantRows.map((v) => [`${v.productId}:${v.size}`, v]));

  let subtotal = 0;
  for (const item of clientItems) {
    const variant = variantMap.get(`${item.productId}:${item.size}`);
    if (!variant) {
      return NextResponse.json(
        { error: `Variant not found: ${item.productId} / ${item.size}` },
        { status: 404 }
      );
    }
    if (variant.stock < item.quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 409 });
    }
    const unitPrice =
      variant.priceOverride ?? variant.product.salePrice ?? variant.product.price;
    subtotal += unitPrice * item.quantity;
  }

  let shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;
  if (shippingMethod === "STANDARD" && subtotal < FREE_SHIPPING_THRESHOLD_CENTS) {
    shippingCost = 999;
  }

  const amount = subtotal + shippingCost; // total in cents

  // ── Create Stripe PaymentIntent ────────────────────────────────────────────
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    // Automatically confirm when the customer provides card details
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: user.id,
      userEmail: user.email ?? "",
      shippingMethod,
    },
    // Receipt email so Stripe sends a payment confirmation email
    receipt_email: user.email ?? undefined,
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
