import "server-only";

import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSession } from "@/lib/auth-session";
import type { Cart } from "@/lib/cart";
import { db } from "@/lib/db";
import { cartItems, carts, productImages, products, productStock } from "@/lib/db/schema";

// Cart reads depend on the request (cookie and session), so they are never cached across requests.
// Call them from inside a `<Suspense>` boundary.

export const CART_COOKIE = "cart";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCartId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** The signed-in user's cart, else the guest cart named by the cookie. Null when there is none yet. */
export const findCartId = cache(async (): Promise<string | null> => {
  const session = await getSession();
  if (session) {
    const [row] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, session.user.id));
    return row?.id ?? null;
  }

  const cookieValue = (await cookies()).get(CART_COOKIE)?.value;
  if (!isCartId(cookieValue)) return null;
  // A cart that belongs to a user is never served to a signed-out visitor.
  const [row] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.id, cookieValue), isNull(carts.userId)));
  return row?.id ?? null;
});

export const getCart = cache(async (): Promise<Cart> => {
  const cartId = await findCartId();
  if (!cartId) return { lines: [] };

  const rows = await db
    .select({
      productId: cartItems.productId,
      slug: products.slug,
      name: products.name,
      color: products.color,
      size: cartItems.size,
      quantity: cartItems.quantity,
      available: productStock.quantity,
      unitPriceCents: products.priceCents,
      imageUrl: productImages.url,
      imageAlt: productImages.alt,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .innerJoin(
      productStock,
      and(eq(productStock.productId, cartItems.productId), eq(productStock.size, cartItems.size)),
    )
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.position, 0)))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt), asc(cartItems.productId), asc(cartItems.size));

  return {
    lines: rows.map(({ imageUrl, imageAlt, ...row }) => ({
      ...row,
      image: imageUrl ? { src: imageUrl, alt: imageAlt ?? row.name } : null,
    })),
  };
});

/** Units in the bag, for the header badge. */
export async function getCartCount() {
  const cartId = await findCartId();
  if (!cartId) return 0;

  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  return row.count;
}
