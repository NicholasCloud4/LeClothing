import "server-only";

// Cart writes. This is deliberately not a "use server" module: everything exported from one of those is a
// public endpoint, and `mergeGuestCart` takes a user id. The Server Actions in `@/lib/actions/cart` and
// `@/lib/actions/auth` call into here.

import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth-session";
import { MAX_LINE_QUANTITY } from "@/lib/cart";
import { db } from "@/lib/db";
import { CART_COOKIE, findCartId, isCartId } from "@/lib/db/queries/cart";
import { cartItems, carts, products, productStock } from "@/lib/db/schema";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function getOrCreateCartId() {
  const existing = await findCartId();
  if (existing) return existing;

  const session = await getSession();
  const [created] = await db
    .insert(carts)
    .values({ userId: session?.user.id ?? null })
    .onConflictDoNothing({ target: carts.userId })
    .returning({ id: carts.id });

  if (!session) {
    (await cookies()).set(CART_COOKIE, created.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
    return created.id;
  }

  // Two tabs creating the user's first cart at once: the loser re-reads the winner's row.
  if (created) return created.id;
  const [row] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, session.user.id));
  return row.id;
}

async function getStock(productId: number, size: string) {
  const [row] = await db
    .select({ available: productStock.quantity })
    .from(productStock)
    .where(and(eq(productStock.productId, productId), eq(productStock.size, size)));
  return row?.available;
}

export type AddItemResult = { ok: true } | { ok: false; error: string };

/** Adds one unit, capped by stock and the per-line maximum. Prices are never stored. */
export async function addItem(productSlug: string, size: string): Promise<AddItemResult> {
  const [stock] = await db
    .select({ productId: products.id, available: productStock.quantity })
    .from(products)
    .innerJoin(productStock, eq(productStock.productId, products.id))
    .where(and(eq(products.slug, productSlug), eq(productStock.size, size)));

  if (!stock) return { ok: false, error: "That size isn't available." };
  if (stock.available <= 0) return { ok: false, error: "Sorry, that size has just sold out." };

  const cartId = await getOrCreateCartId();
  const limit = Math.min(stock.available, MAX_LINE_QUANTITY);

  await db.batch([
    db
      .insert(cartItems)
      .values({ cartId, productId: stock.productId, size, quantity: 1 })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.productId, cartItems.size],
        set: { quantity: sql`least(${cartItems.quantity} + 1, ${limit})` },
      }),
    db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId)),
  ]);

  return { ok: true };
}

/** Sets a line to an exact quantity (0 removes it), capped by stock. A sold-out line can only be removed. */
export async function setLineQuantity(productId: number, size: string, quantity: number) {
  const cartId = await findCartId();
  if (!cartId) return;

  const line = and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId), eq(cartItems.size, size));

  if (quantity <= 0) {
    await db.delete(cartItems).where(line);
  } else {
    const available = (await getStock(productId, size)) ?? 0;
    const next = Math.min(quantity, available, MAX_LINE_QUANTITY);
    if (next <= 0) return;
    await db.update(cartItems).set({ quantity: next }).where(line);
  }
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/**
 * Folds the guest cart (named by the cookie) into the user's cart at sign-in or sign-up, then drops the cookie.
 * A user with no cart simply adopts the guest cart.
 */
export async function mergeGuestCart(userId: string) {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(CART_COOKIE)?.value;
  if (!isCartId(guestId)) return;
  cookieStore.delete(CART_COOKIE);

  const [guest] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.id, guestId), sql`${carts.userId} is null`));
  if (!guest) return;

  const [userCart] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId));
  if (!userCart) {
    await db.update(carts).set({ userId }).where(eq(carts.id, guest.id));
    return;
  }

  // One statement, so the merge and the guest cart's removal succeed or fail together. The data-modifying CTE runs
  // even though nothing selects from it; deleting the cart cascades to its items after the copy has read them.
  await db.execute(sql`
    with moved as (
      insert into cart_items (cart_id, product_id, size, quantity, created_at)
      select ${userCart.id}::uuid, product_id, size, quantity, created_at
      from cart_items
      where cart_id = ${guest.id}::uuid
      on conflict (cart_id, product_id, size)
      do update set quantity = least(cart_items.quantity + excluded.quantity, ${MAX_LINE_QUANTITY})
      returning 1
    )
    delete from carts where id = ${guest.id}::uuid
  `);
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, userCart.id));
}
