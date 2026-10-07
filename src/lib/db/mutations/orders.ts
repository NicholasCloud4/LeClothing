import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { CancelReason } from "@/lib/payments";

// Order state changes after checkout. Each is a single statement guarded by `status = 'pending'`, so it is atomic
// without a transaction and safe to repeat: a duplicate webhook, a retry, or the success page racing the webhook
// all find the order already moved and change nothing.

/**
 * pending → paid, only if Stripe's amount matches the order total and the session is the order's own. Removes the
 * bought lines from the bag the order came from (anything added since stays). True when this call made the change.
 */
export async function markOrderPaid(
  orderNumber: string,
  {
    sessionId,
    paymentIntentId,
    amountTotal,
  }: { sessionId: string; paymentIntentId: string | null; amountTotal: number },
) {
  const result = await db.execute<{ id: number }>(sql`
    with paid as (
      update orders
      set status = 'paid', paid_at = now(), reserved_until = null, updated_at = now(),
          stripe_checkout_session_id = ${sessionId}, stripe_payment_intent_id = ${paymentIntentId}
      where order_number = ${orderNumber}
        and status = 'pending'
        and total_cents = ${amountTotal}
        and (stripe_checkout_session_id is null or stripe_checkout_session_id = ${sessionId})
      returning id, cart_id
    ),
    cleared as (
      delete from cart_items ci
      using paid, order_items oi
      where ci.cart_id = paid.cart_id and oi.order_id = paid.id
        and ci.product_id = oi.product_id and ci.size = oi.size
      returning 1
    )
    select id from paid
  `);
  return result.rows.length > 0;
}

/**
 * pending → cancelled, returning the order's units to stock. A paid order is never touched, and because the
 * status guard and the restock are one statement, stock comes back at most once. True when this call cancelled it.
 */
export async function cancelOrder(orderNumber: string, reason: CancelReason) {
  const result = await db.execute<{ id: number }>(sql`
    with cancelled as (
      update orders
      set status = 'cancelled', cancelled_at = now(), cancel_reason = ${reason}, reserved_until = null,
          updated_at = now()
      where order_number = ${orderNumber} and status = 'pending'
      returning id
    ),
    restocked as (
      update product_stock ps
      set quantity = ps.quantity + oi.quantity
      from order_items oi
      join cancelled on oi.order_id = cancelled.id
      where ps.product_id = oi.product_id and ps.size = oi.size
      returning 1
    )
    select id from cancelled
  `);
  return result.rows.length > 0;
}

/**
 * The session completed but a delayed payment method hasn't settled. The stock stays held with no deadline:
 * Stripe will send `async_payment_succeeded` or `async_payment_failed`.
 */
export async function markOrderProcessing(orderNumber: string, sessionId: string) {
  await db.execute(sql`
    update orders set reserved_until = null, stripe_checkout_session_id = ${sessionId}, updated_at = now()
    where order_number = ${orderNumber} and status = 'pending'
      and (stripe_checkout_session_id is null or stripe_checkout_session_id = ${sessionId})
  `);
}
