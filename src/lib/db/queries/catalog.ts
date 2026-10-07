import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, productImages, products, productStock } from "@/lib/db/schema";
import type { Product } from "@/lib/catalog";

// Catalog reads for the storefront. Each is cached so pages prerender into the static shell.
// After changing products or stock, call `revalidateTag(CATALOG_TAG)` (or the per-product tag).

export const CATALOG_TAG = "products";

export function productTag(slug: string) {
  return `product:${slug}`;
}

export const withRelations = {
  category: { columns: { slug: true, name: true } },
  images: {
    columns: { url: true, alt: true },
    orderBy: asc(productImages.position),
  },
  stock: {
    columns: { size: true, quantity: true },
    orderBy: asc(productStock.position),
  },
} as const;

export type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof findProduct>>>;

function findProduct(slug: string) {
  return db.query.products.findFirst({ where: (product, { eq }) => eq(product.slug, slug), with: withRelations });
}

export function toProduct(row: ProductWithRelations): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    priceCents: row.priceCents,
    color: row.color,
    colors: row.colorCount,
    description: row.description,
    details: row.details,
    sizes: row.stock.map((stock) => ({ label: stock.size, stock: stock.quantity })),
    images: row.images.map((image) => ({ src: image.url, alt: image.alt })),
    isNew: row.isNew,
  };
}

export async function getProductSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const rows = await db.select({ slug: products.slug }).from(products).orderBy(desc(products.createdAt));
  return rows.map((row) => row.slug);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG, productTag(slug));

  const row = await findProduct(slug);
  return row && toProduct(row);
}

/** Newest products first. */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const rows = await db.query.products.findMany({
    with: withRelations,
    orderBy: (product, { desc }) => [desc(product.createdAt)],
    limit,
  });
  return rows.map(toProduct);
}

/** Same-category styles first, then the rest of the catalog, newest first within each. */
export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const rows = await db.query.products.findMany({
    where: (candidate, { ne }) => ne(candidate.slug, product.slug),
    with: withRelations,
    orderBy: (candidate, { desc }) => [
      // Unqualified columns on purpose: the query builder rewrites table-qualified ones to the
      // `products` alias, which would break the subquery.
      desc(sql`${candidate.categoryId} = (select id from ${categories} where slug = ${product.category.slug})`),
      desc(candidate.createdAt),
    ],
    limit,
  });
  return rows.map(toProduct);
}
