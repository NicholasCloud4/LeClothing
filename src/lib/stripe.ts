import "server-only";

import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set. Add a restricted key (rk_…) from your Stripe sandbox to .env.");
}

// Pinned so a Dashboard upgrade can't change object shapes under us. Matches the installed SDK.
export const stripe = new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" });
