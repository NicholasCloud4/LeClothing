import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { cancelOrder, markOrderPaid, markOrderProcessing } from "@/lib/db/mutations/orders";
import { orders } from "@/lib/db/schema";
import { isOrderNumber } from "@/lib/orders";
import { orderTransition, STORE_CURRENCY } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

// Brings an order in line with its Stripe Checkout Session. The webhook, the success page and the clean-up script
// all call this, and it always re-reads the session from Stripe, so the browser's word is never taken for anything.
// No `next/*` imports: callers decide how to expire cached catalog pages (`updateTag` vs `revalidateTag`).

export type ReconcileResult = {
  outcome: "paid" | "processing" | "cancelled" | "unchanged" | "ignored";
  /** Units went back to stock, so cached product pages should be expired. */
  stockChanged: boolean;
};

const IGNORED: ReconcileResult = { outcome: "ignored", stockChanged: false };
const UNCHANGED: ReconcileResult = { outcome: "unchanged", stockChanged: false };

export async function reconcileCheckoutSession(sessionId: string): Promise<ReconcileResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });

  // Only sessions we created carry one of our order numbers; anything else (e.g. `stripe trigger`) is not ours.
  const orderNumber = session.client_reference_id;
  if (!isOrderNumber(orderNumber)) return IGNORED;
  const [order] = await db
    .select({ status: orders.status, totalCents: orders.totalCents, sessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber));
  // The session id is recorded right after creation; null only if that write failed.
  if (!order || (order.sessionId !== null && order.sessionId !== session.id)) return IGNORED;

  const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
  const transition = orderTransition({
    status: session.status,
    paymentStatus: session.payment_status,
    paymentIntentStatus: paymentIntent?.status ?? null,
  });

  switch (transition) {
    case "paid": {
      if (session.amount_total !== order.totalCents || session.currency !== STORE_CURRENCY) {
        console.error(
          `Stripe session ${session.id} for order ${orderNumber} was paid ${session.amount_total} ${session.currency}, ` +
            `expected ${order.totalCents} ${STORE_CURRENCY}. Order left unchanged; review and refund.`,
        );
        return UNCHANGED;
      }
      if (order.status === "cancelled") {
        console.error(`Order ${orderNumber} was cancelled but session ${session.id} is paid. Review and refund.`);
        return UNCHANGED;
      }
      const changed = await markOrderPaid(orderNumber, {
        sessionId: session.id,
        paymentIntentId: paymentIntent?.id ?? null,
        amountTotal: session.amount_total,
      });
      return { outcome: changed ? "paid" : "unchanged", stockChanged: false };
    }
    case "processing":
      await markOrderProcessing(orderNumber, session.id);
      return { outcome: "processing", stockChanged: false };
    case "cancel": {
      const changed = await cancelOrder(orderNumber, session.status === "expired" ? "expired" : "payment_failed");
      return { outcome: changed ? "cancelled" : "unchanged", stockChanged: changed };
    }
    case "none":
      return UNCHANGED;
  }
}

/**
 * Ends a pending order's checkout and returns its stock: expires the Stripe session first, so it can no longer be
 * paid. If Stripe refuses because the shopper has already completed it, the order follows the session instead.
 */
export async function endCheckout(
  order: { orderNumber: string; sessionId: string | null },
  reason: "superseded" | "abandoned",
): Promise<ReconcileResult> {
  if (!order.sessionId) {
    // The session was never recorded (creation failed), so nothing at Stripe can be paid for this order.
    const changed = await cancelOrder(order.orderNumber, "session_error");
    return { outcome: changed ? "cancelled" : "unchanged", stockChanged: changed };
  }

  try {
    await stripe.checkout.sessions.expire(order.sessionId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Already complete or expired: sync with whatever it is.
      return reconcileCheckoutSession(order.sessionId);
    }
    throw error;
  }
  const changed = await cancelOrder(order.orderNumber, reason);
  return { outcome: changed ? "cancelled" : "unchanged", stockChanged: changed };
}

/** Before a new checkout from a bag, end any checkout still open for it, so one bag never holds stock twice. */
export async function endOpenCheckoutsForCart(cartId: string) {
  const open = await db
    .select({ orderNumber: orders.orderNumber, sessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.cartId, cartId), eq(orders.status, "pending"), isNotNull(orders.reservedUntil)));

  let stockChanged = false;
  for (const order of open) {
    const result = await endCheckout(order, "superseded");
    stockChanged ||= result.stockChanged;
  }
  return stockChanged;
}
