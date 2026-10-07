import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { endCheckout } from "@/lib/checkout-reconcile";
import { db } from "@/lib/db";
import { CATALOG_TAG } from "@/lib/db/queries/catalog";
import { findCartId } from "@/lib/db/queries/cart";
import { LAST_ORDER_COOKIE } from "@/lib/db/queries/orders";
import { orders } from "@/lib/db/schema";
import { isOrderNumber } from "@/lib/orders";

/**
 * Stripe's `cancel_url`: the shopper left the payment page with "back". Ends that checkout now (rather than when
 * the session expires) so the held stock goes back and the bag shows real availability again. Only the browser
 * the checkout started from may do this: the order must belong to its bag or be its `last_order`.
 */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order");
  const back = new URL("/checkout?payment=cancelled", request.url);
  if (!isOrderNumber(orderNumber)) return NextResponse.redirect(back);

  const [order] = await db
    .select({ cartId: orders.cartId, sessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.status, "pending")));
  if (!order) return NextResponse.redirect(back);

  const cartId = await findCartId();
  const placedHere = (await cookies()).get(LAST_ORDER_COOKIE)?.value === orderNumber;
  if (placedHere || (cartId !== null && order.cartId === cartId)) {
    const result = await endCheckout({ orderNumber, sessionId: order.sessionId }, "abandoned");
    if (result.stockChanged) revalidateTag(CATALOG_TAG, "max");
  }
  return NextResponse.redirect(back);
}
