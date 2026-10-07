import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { categories, orderItems, orders, productImages, productStock } from "@/lib/db/schema";

// Admin catalog reads. Uncached on purpose: the editor must show live stock, not the storefront's cached copy.
// Each checks the role itself, because the proxy and the admin layout don't.

/** Every product with its category, primary image and stock, alphabetical. */
export async function getAdminProducts() {
  await requireAdmin();
  return db.query.products.findMany({
    columns: { id: true, slug: true, name: true, priceCents: true },
    with: {
      category: { columns: { name: true } },
      images: { columns: { url: true, alt: true }, orderBy: asc(productImages.position), limit: 1 },
      stock: { columns: { size: true, quantity: true }, orderBy: asc(productStock.position) },
    },
    orderBy: (product, { asc }) => [asc(product.name)],
  });
}

export type AdminProductSummary = Awaited<ReturnType<typeof getAdminProducts>>[number];

/** One product for the editor, the category choices, and units per size held by checkouts still pending. */
export async function getProductEditor(id: number) {
  await requireAdmin();
  const [product, categoryOptions, held] = await Promise.all([
    db.query.products.findFirst({
      where: (product, { eq }) => eq(product.id, id),
      with: {
        images: { columns: { url: true, alt: true }, orderBy: asc(productImages.position) },
        stock: { columns: { size: true, quantity: true }, orderBy: asc(productStock.position) },
      },
    }),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select({ size: orderItems.size, units: sql<number>`sum(${orderItems.quantity})::int` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orderItems.productId, id), eq(orders.status, "pending")))
      .groupBy(orderItems.size),
  ]);
  if (!product) return undefined;

  const heldBySize = new Map(held.map((row) => [row.size, row.units]));
  return {
    product,
    categories: categoryOptions,
    stock: product.stock.map((row) => ({
      size: row.size,
      available: row.quantity,
      held: heldBySize.get(row.size) ?? 0,
    })),
  };
}
