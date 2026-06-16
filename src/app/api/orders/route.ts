// src/app/api/orders/route.ts
// POST /api/orders — create a new order (server-side pricing, NEVER trust client prices)
// GET  /api/orders — list the authenticated user's orders

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

// ── Shipping costs (cents) ────────────────────────────────────────────────────
const SHIPPING_COSTS: Record<string, number> = {
  STANDARD: 0,    // free, calculated below with threshold
  EXPRESS: 999,   // $9.99
  OVERNIGHT: 2499, // $24.99
};
const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // $150.00

// ── Validation — NO prices from client ───────────────────────────────────────
const CreateOrderSchema = z.object({
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
  shippingAddress: z.object({
    fullName: z.string().min(1).max(200),
    line1: z.string().min(1).max(300),
    line2: z.string().max(300).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postcode: z.string().min(1).max(20),
    country: z.string().min(2).max(10),
    phone: z.string().max(30).optional(),
  }),
  customerNote: z.string().max(500).optional(),
  /// Stripe PaymentIntent ID — must be provided and already succeeded.
  /// We verify payment status server-side; never trust the client claim.
  stripePaymentIntentId: z.string().min(1),
});

// ── POST — Create order ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  // Parse & validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const { items: clientItems, shippingMethod, shippingAddress, customerNote, stripePaymentIntentId } = parsed.data;

  // ── Verify payment with Stripe before touching the DB ─────────────────────
  // This is the critical guard: a client cannot fake a successful payment.
  let stripeIntent;
  try {
    stripeIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
  } catch {
    return NextResponse.json({ error: "Could not verify payment. Please try again." }, { status: 402 });
  }

  if (stripeIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: `Payment not completed (status: ${stripeIntent.status}). Please try again.` },
      { status: 402 }
    );
  }

  // Prevent replay attacks — one PaymentIntent can only fund one order
  const existing = await prisma.order.findUnique({
    where: { stripePaymentIntentId },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This payment has already been used for an order.", orderId: existing.id },
      { status: 409 }
    );
  }

  // ── Server-side price calculation ─────────────────────────────────────────
  // Fetch ALL variants + products in a single query
  const variantRows = await prisma.variant.findMany({
    where: {
      OR: clientItems.map((i) => ({
        productId: i.productId,
        size: i.size,
      })),
    },
    select: {
      id: true,
      productId: true,
      size: true,
      stock: true,
      priceOverride: true,
      product: {
        select: {
          id: true,
          name: true,
          imageSrc: true,
          price: true,
          salePrice: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  // Map for quick lookup
  const variantMap = new Map(variantRows.map((v) => [`${v.productId}:${v.size}`, v]));

  // Validate all items exist and have stock, then build resolved items
  const resolvedItems: Array<{
    productId: string;
    variantId: string;
    productName: string;
    productImage: string;
    brandName: string;
    size: string;
    quantity: number;
    unitPrice: number; // cents
  }> = [];

  for (const item of clientItems) {
    const variant = variantMap.get(`${item.productId}:${item.size}`);
    if (!variant) {
      return NextResponse.json(
        { error: `Product variant not found: ${item.productId} / ${item.size}` },
        { status: 404 }
      );
    }
    if (variant.stock < item.quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock for ${variant.product.name} (${item.size})`,
          available: variant.stock,
          requested: item.quantity,
        },
        { status: 409 }
      );
    }

    // Server-side unit price: variant override → sale price → regular price (all in cents)
    const unitPrice =
      variant.priceOverride ??
      variant.product.salePrice ??
      variant.product.price;

    resolvedItems.push({
      productId: item.productId,
      variantId: variant.id,
      productName: variant.product.name,
      productImage: variant.product.imageSrc,
      brandName: variant.product.brand.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice,
    });
  }

  // Calculate totals (all cents)
  const subtotal = resolvedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  let shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;
  // Standard shipping is free when subtotal >= threshold
  if (shippingMethod === "STANDARD" && subtotal < FREE_SHIPPING_THRESHOLD_CENTS) {
    shippingCost = 999; // $9.99
  }

  const total = subtotal + shippingCost;

  // ── Create order + items in a transaction (atomic stock decrement) ─────────
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock atomically — fail if any variant has insufficient stock
    for (const item of resolvedItems) {
      const updated = await tx.variant.updateMany({
        where: {
          id: item.variantId,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`Out of stock: ${item.productName} (${item.size})`);
      }
    }

    // Create the order
    // Capture the latest charge ID from the already-succeeded PaymentIntent
    const chargeId =
      typeof stripeIntent.latest_charge === "string"
        ? stripeIntent.latest_charge
        : (stripeIntent.latest_charge as { id?: string } | null)?.id ?? null;

    const newOrder = await tx.order.create({
      data: {
        userId: user.id,
        status: "PROCESSING",
        subtotal,
        shippingCost,
        discount: 0,
        total,
        shippingMethod,
        shippingFullName: shippingAddress.fullName,
        shippingLine1: shippingAddress.line1,
        shippingLine2: shippingAddress.line2 ?? null,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostcode: shippingAddress.postcode,
        shippingCountry: shippingAddress.country,
        shippingPhone: shippingAddress.phone ?? null,
        customerNote: customerNote ?? null,
        stripePaymentIntentId,
        stripeChargeId: chargeId,
        items: {
          create: resolvedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            productImage: i.productImage,
            brandName: i.brandName,
            size: i.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Clear the user's server-side cart
    await tx.cartItem.deleteMany({ where: { userId: user.id } });

    return newOrder;
  });

  return NextResponse.json({ order }, { status: 201 });
}

// ── GET — list user's orders ──────────────────────────────────────────────────
export async function GET() {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          productImage: true,
          brandName: true,
          size: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
