// Safety net for missed webhooks: finds pending orders whose stock hold ran out more than 10 minutes ago and
// brings each in line with its Stripe session (paid → paid, expired → cancelled with stock returned).
// Safe to re-run, and a good candidate for a scheduled job later.
//
//   npm run orders:expire-stale
//
// Runs with the `react-server` condition so the app's `server-only` modules can be imported. Product pages pick up
// returned stock when their cache next revalidates (within the hour).

import { config } from "dotenv";

// Same precedence as Next.js: .env.local wins over .env. Loaded before the app modules, which read env at import.
config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const { and, eq, lt, sql } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");
  const { orders } = await import("../src/lib/db/schema");
  const { endCheckout, reconcileCheckoutSession } = await import("../src/lib/checkout-reconcile");

  const stale = await db
    .select({ orderNumber: orders.orderNumber, sessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.status, "pending"), lt(orders.reservedUntil, sql`now() - interval '10 minutes'`)));

  for (const order of stale) {
    // No session recorded means creation failed and nothing can be paid; otherwise ask Stripe.
    const result = order.sessionId
      ? await reconcileCheckoutSession(order.sessionId)
      : await endCheckout(order, "abandoned");
    // A session that is somehow still open past its expiry is ended so the stock comes back.
    const final = result.outcome === "unchanged" && order.sessionId ? await endCheckout(order, "abandoned") : result;
    console.log(`${order.orderNumber}: ${final.outcome}`);
  }
  console.log(`Checked ${stale.length} stale checkout${stale.length === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
