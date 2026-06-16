// src/app/api/payments/webhook/route.ts
// POST /api/payments/webhook
//
// Stripe sends signed events here. We handle:
//   • payment_intent.succeeded   — back-fill stripeChargeId if the order was
//                                   already created (or create it if missed)
//   • payment_intent.payment_failed — log the failure for visibility
//
// IMPORTANT: This route must NOT use the default Next.js body parser so we
// can verify Stripe's raw-body signature. We read the body as a Buffer.

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";

export const runtime = "nodejs"; // required for raw body access

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe webhook signature verification failed: ${msg}`);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const chargeId =
        typeof intent.latest_charge === "string"
          ? intent.latest_charge
          : (intent.latest_charge as Stripe.Charge | null)?.id ?? null;

      // Update the linked order with the charge ID (if it exists)
      if (chargeId) {
        await prisma.order
          .updateMany({
            where: {
              stripePaymentIntentId: intent.id,
              stripeChargeId: null, // only fill in if missing
            },
            data: { stripeChargeId: chargeId },
          })
          .catch((err) =>
            console.error("Failed to back-fill stripeChargeId:", err)
          );
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn(
        `Payment failed for intent ${intent.id}: ` +
          (intent.last_payment_error?.message ?? "unknown reason")
      );
      // Optionally mark a PENDING order as CANCELLED here if you pre-create orders
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const intentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : (charge.payment_intent as Stripe.PaymentIntent | null)?.id;

      if (intentId) {
        await prisma.order
          .updateMany({
            where: { stripePaymentIntentId: intentId },
            data: { status: "REFUNDED" },
          })
          .catch((err) => console.error("Failed to mark order as REFUNDED:", err));
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
