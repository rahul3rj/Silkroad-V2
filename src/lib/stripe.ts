// src/lib/stripe.ts
// Singleton Stripe server instance — import this everywhere you need server-side Stripe.

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Pin to the API version matching stripe@22 defaults
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});
