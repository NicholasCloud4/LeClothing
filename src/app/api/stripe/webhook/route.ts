import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { reconcileCheckoutSession } from "@/lib/checkout-reconcile";
import { db } from "@/lib/db";
import { CATALOG_TAG } from "@/lib/db/queries/catalog";
import { stripeEvents } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/** The only events this endpoint acts on; subscribe the endpoint to exactly these. */
const CHECKOUT_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

/**
 * Stripe webhook. The signature proves the request came from Stripe; the event only says *which* session to look
 * at, and `reconcileCheckoutSession` re-reads that session from Stripe before changing anything.
 *
 * Duplicates: `stripe_events` records each event id, and one already processed is acknowledged without work.
 * Behind that, every order change is guarded by the order's current status, so a replay can't apply twice.
 * Any failure returns 500 and Stripe retries for up to three days.
 */
export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting webhook.");
    return new Response("Webhook not configured", { status: 500 });
  }

  // The signature is computed over the exact bytes Stripe sent, so read the raw body before any parsing.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (!CHECKOUT_EVENTS.has(event.type)) return Response.json({ received: true, ignored: true });

  await db.insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
  const [seen] = await db
    .select({ processedAt: stripeEvents.processedAt })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id));
  if (seen?.processedAt) return Response.json({ received: true, duplicate: true });

  try {
    const session = event.data.object as { id: string };
    const result = await reconcileCheckoutSession(session.id);
    if (result.stockChanged) revalidateTag(CATALOG_TAG, "max");
    await db.update(stripeEvents).set({ processedAt: new Date() }).where(eq(stripeEvents.id, event.id));
    return Response.json({ received: true, outcome: result.outcome });
  } catch (error) {
    console.error(`Stripe event ${event.id} (${event.type}) failed; Stripe will retry.`, error);
    return new Response("Processing failed", { status: 500 });
  }
}
