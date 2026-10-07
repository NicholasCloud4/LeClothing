import "server-only";

// Admin catalog writes. Not a "use server" module: these take a trusted product id, and the actions in
// `@/lib/actions/admin` check the role before calling them. Each is one `db.batch`, so it applies entirely or not at
// all (neon-http has no interactive transactions).

import { and, eq, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { db } from "@/lib/db";
import { productImages, products, productStock } from "@/lib/db/schema";
import type { NewSize, ProductInput, StockChange } from "@/lib/product-form";

/** Updates the product's fields and replaces its images. The slug never changes: order history links to it. */
export async function updateProduct(id: number, { images, ...fields }: ProductInput) {
  await db.batch([
    db.update(products).set(fields).where(eq(products.id, id)),
    db.delete(productImages).where(eq(productImages.productId, id)),
    db
      .insert(productImages)
      .values(images.map((image, position) => ({ productId: id, url: image.url, alt: image.alt, position }))),
  ]);
}

/**
 * Applies relative stock changes and optionally adds a size at the end of the run. Relative, so units a checkout
 * took or a cancellation returned in the meantime are kept. A change that would go below zero hits the
 * `quantity >= 0` check and aborts the whole batch (`isOutOfStockError`).
 */
export async function adjustStock(productId: number, changes: StockChange[], newSize: NewSize | null) {
  const queries: BatchItem<"pg">[] = changes.map(({ size, delta }) =>
    db
      .update(productStock)
      .set({ quantity: sql`${productStock.quantity} + ${delta}` })
      .where(and(eq(productStock.productId, productId), eq(productStock.size, size))),
  );

  if (newSize) {
    queries.push(
      db
        .insert(productStock)
        .values({
          productId,
          size: newSize.size,
          quantity: newSize.quantity,
          position: sql`(select coalesce(max(position) + 1, 0) from ${productStock} where product_id = ${productId})`,
        })
        .onConflictDoNothing(),
    );
  }

  const [first, ...rest] = queries;
  if (first) await db.batch([first, ...rest]);
}
