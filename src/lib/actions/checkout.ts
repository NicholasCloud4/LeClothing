"use server";

import { and, eq, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { refresh, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addressErrors, addressSchema, readAddressValues, type AddressErrors, type AddressValues } from "@/lib/address";
import { getSession } from "@/lib/auth-session";
import { cartSubtotalCents, purchasableQuantity, SHIPPING_METHOD_IDS, shippingCents } from "@/lib/cart";
import { db } from "@/lib/db";
import { isOutOfStockError } from "@/lib/db/errors";
import { CATALOG_TAG } from "@/lib/db/queries/catalog";
import { findCartId, getCart } from "@/lib/db/queries/cart";
import { getAddressesForUser } from "@/lib/db/queries/addresses";
import { LAST_ORDER_COOKIE } from "@/lib/db/queries/orders";
import { addresses, cartItems, orderItems, orders, productStock } from "@/lib/db/schema";
import { generateOrderNumber } from "@/lib/orders";

export type CheckoutState = {
  error?: string;
  /** The bag changed under the shopper (stock or prices), so they should go back and review it. */
  bagChanged?: boolean;
  fieldErrors?: AddressErrors & { email?: string; shippingMethod?: string };
  /** Echoed back so a failed submit doesn't clear the form. */
  values?: AddressValues & { email?: string; shippingMethod?: string };
};

const checkoutSchema = addressSchema.extend({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  shippingMethod: z.enum(SHIPPING_METHOD_IDS, "Choose a delivery method."),
  /** The total the shopper saw. If it no longer matches, prices or stock moved and we ask them to review. */
  expectedTotalCents: z.coerce.number().int().min(0),
});

const BAG_CHANGED = "Something in your bag changed while you were checking out. Please review it and try again.";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Places the order. Everything that matters is decided here from the database, not from the form: prices come
 * from `products`, quantities from the bag, and the stock decrement runs in the same transaction as the insert.
 * `product_stock` has `CHECK (quantity >= 0)`, so if any line is oversold the whole batch rolls back.
 * No payment is taken yet: the order is created as `pending`.
 */
export async function placeOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = {
    ...readAddressValues(formData),
    email: text(formData, "email"),
    shippingMethod: text(formData, "shippingMethod"),
  };

  const parsed = checkoutSchema.safeParse({ ...values, expectedTotalCents: text(formData, "expectedTotalCents") });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>;
    return {
      fieldErrors: {
        ...addressErrors(parsed.error),
        email: flat.email?.[0],
        shippingMethod: flat.shippingMethod?.[0],
      },
      values,
    };
  }
  const { email, shippingMethod, expectedTotalCents, ...address } = parsed.data;

  const session = await getSession();
  const cart = await getCart();
  const cartId = await findCartId();
  const lines = cart.lines.filter((line) => purchasableQuantity(line) > 0);
  if (!cartId || lines.length === 0) {
    return { error: "Your bag is empty, or everything in it has sold out.", bagChanged: true, values };
  }

  const subtotal = cartSubtotalCents(cart);
  const shipping = shippingCents(shippingMethod);
  const total = subtotal + shipping;
  if (total !== expectedTotalCents) return { error: BAG_CHANGED, bagChanged: true, values };

  const userId = session?.user.id ?? null;
  const orderNumber = generateOrderNumber();
  const orderId = sql<number>`(select id from ${orders} where order_number = ${orderNumber})`;

  const queries: [BatchItem<"pg">, ...BatchItem<"pg">[]] = [
    db.insert(orders).values({
      orderNumber,
      userId,
      email,
      shippingMethod,
      subtotalCents: subtotal,
      shippingCents: shipping,
      totalCents: total,
      shipName: address.fullName,
      shipLine1: address.line1,
      shipLine2: address.line2,
      shipCity: address.city,
      shipRegion: address.region,
      shipPostalCode: address.postalCode,
      shipCountry: address.country,
      shipPhone: address.phone,
    }),
    db.insert(orderItems).values(
      lines.map((line) => ({
        orderId,
        productId: line.productId,
        slug: line.slug,
        name: line.name,
        color: line.color,
        size: line.size,
        imageUrl: line.image?.src ?? null,
        unitPriceCents: line.unitPriceCents,
        quantity: purchasableQuantity(line),
      })),
    ),
    ...lines.map((line) =>
      db
        .update(productStock)
        .set({ quantity: sql`${productStock.quantity} - ${purchasableQuantity(line)}` })
        .where(and(eq(productStock.productId, line.productId), eq(productStock.size, line.size))),
    ),
    db.delete(cartItems).where(eq(cartItems.cartId, cartId)),
  ];

  if (userId && formData.get("saveAddress") === "on") {
    const saved = await getAddressesForUser(userId);
    const alreadySaved = saved.some(
      (existing) =>
        existing.line1.toLowerCase() === address.line1.toLowerCase() &&
        existing.postalCode.toLowerCase() === address.postalCode.toLowerCase(),
    );
    if (!alreadySaved) {
      queries.push(
        db.insert(addresses).values({
          userId,
          ...address,
          // The first address a user saves becomes their default.
          isDefault: sql`not exists (select 1 from ${addresses} where user_id = ${userId})`,
        }),
      );
    }
  }

  try {
    await db.batch(queries);
  } catch (error) {
    if (isOutOfStockError(error)) {
      refresh();
      return { error: "Sorry, an item in your bag has just sold out. Nothing was ordered.", bagChanged: true, values };
    }
    throw error;
  }

  // Product pages and collections cache stock for an hour; expire it now so sold-out sizes show immediately.
  updateTag(CATALOG_TAG);

  (await cookies()).set(LAST_ORDER_COOKIE, orderNumber, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  redirect(`/checkout/confirmation/${orderNumber}`);
}
