import "server-only";

import { and, desc, eq, type SQL } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { isOrderNumber, type Order, type OrderStatus } from "@/lib/orders";

// Orders are private. Every read here is scoped to a user, or to the browser that just placed the order.

export const LAST_ORDER_COOKIE = "last_order";

type OrderRow = NonNullable<Awaited<ReturnType<typeof findOrder>>>;

function findOrder(where: SQL | undefined) {
  return db.query.orders.findFirst({
    where,
    with: { items: { orderBy: (item, { asc }) => [asc(item.id)] } },
  });
}

function toOrder(row: OrderRow): Order {
  return {
    orderNumber: row.orderNumber,
    email: row.email,
    status: row.status as OrderStatus,
    shippingMethod: row.shippingMethod,
    subtotalCents: row.subtotalCents,
    shippingCents: row.shippingCents,
    totalCents: row.totalCents,
    createdAt: row.createdAt,
    shipTo: {
      name: row.shipName,
      line1: row.shipLine1,
      line2: row.shipLine2,
      city: row.shipCity,
      region: row.shipRegion,
      postalCode: row.shipPostalCode,
      country: row.shipCountry,
      phone: row.shipPhone,
    },
    items: row.items.map((item) => ({
      slug: item.slug,
      name: item.name,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      imageUrl: item.imageUrl,
    })),
  };
}

/** An order the signed-in user owns, or undefined. */
export async function getOrderForUser(userId: string, orderNumber: string) {
  if (!isOrderNumber(orderNumber)) return undefined;
  const row = await findOrder(and(eq(orders.userId, userId), eq(orders.orderNumber, orderNumber)));
  return row && toOrder(row);
}

export async function getOrdersForUser(userId: string, limit = 50) {
  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: { orderBy: (item, { asc }) => [asc(item.id)] } },
    orderBy: [desc(orders.createdAt)],
    limit,
  });
  return rows.map(toOrder);
}

/**
 * Who may view an order's confirmation: its owner, or the browser that placed it (a guest has no account,
 * so the `last_order` cookie set at checkout is their proof).
 */
export async function getOrderForViewer(orderNumber: string) {
  if (!isOrderNumber(orderNumber)) return undefined;

  const session = await getSession();
  if (session) {
    const owned = await getOrderForUser(session.user.id, orderNumber);
    if (owned) return owned;
  }

  const placedHere = (await cookies()).get(LAST_ORDER_COOKIE)?.value === orderNumber;
  if (!placedHere) return undefined;
  const row = await findOrder(eq(orders.orderNumber, orderNumber));
  return row && toOrder(row);
}
