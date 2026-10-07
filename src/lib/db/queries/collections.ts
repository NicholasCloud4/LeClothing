import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, eq, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, collectionProducts, collections } from "@/lib/db/schema";
import { CATALOG_TAG, toProduct, withRelations } from "@/lib/db/queries/catalog";
import { getTotalStock, type Product } from "@/lib/catalog";
import { NEW_ARRIVALS_SLUG, type CollectionSort } from "@/lib/collections";

export type CollectionKind = "new-arrivals" | "category" | "curated";

export type CollectionView = {
  slug: string;
  title: string;
  description: string | null;
  kind: CollectionKind;
  /** Sort that applies when none is chosen: curated collections keep their editorial order. */
  defaultSort: CollectionSort;
  products: Product[];
};

export type CollectionOptions = {
  sort?: CollectionSort;
  inStockOnly?: boolean;
};

/** Every slug `/collections/[slug]` can serve: new arrivals, each category and each curated collection. */
export async function getCollectionSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const [categoryRows, collectionRows] = await Promise.all([
    db.select({ slug: categories.slug }).from(categories),
    db.select({ slug: collections.slug }).from(collections),
  ]);
  return [NEW_ARRIVALS_SLUG, ...categoryRows.map((row) => row.slug), ...collectionRows.map((row) => row.slug)];
}

/** What the nav and the homepage tiles link to. Empty categories are kept so the pages stay reachable. */
export async function getCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  return db.select({ slug: categories.slug, name: categories.name }).from(categories).orderBy(categories.sortOrder);
}

/**
 * Resolves a slug as the virtual new-arrivals collection, then a category, then a curated collection.
 * Sorting runs in SQL; the in-stock filter runs on the loaded rows, which is fine at this catalog size.
 * `featured` only means something for curated collections; elsewhere it falls back to newest.
 */
export async function getCollection(
  slug: string,
  { sort, inStockOnly = false }: CollectionOptions = {},
): Promise<CollectionView | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG, `collection:${slug}`);

  const view = await resolve(slug, sort);
  if (!view) return undefined;

  return {
    ...view,
    products: inStockOnly ? view.products.filter((product) => getTotalStock(product) > 0) : view.products,
  };
}

function productOrder(
  sort: CollectionSort | undefined,
  product: { priceCents: AnyColumn; createdAt: AnyColumn },
): SQL[] {
  if (sort === "price-asc") return [asc(product.priceCents), desc(product.createdAt)];
  if (sort === "price-desc") return [desc(product.priceCents), desc(product.createdAt)];
  return [desc(product.createdAt)];
}

async function resolve(slug: string, sort: CollectionSort | undefined): Promise<CollectionView | undefined> {
  if (slug === NEW_ARRIVALS_SLUG) {
    const rows = await db.query.products.findMany({
      with: withRelations,
      orderBy: (product) => productOrder(sort, product),
    });
    return {
      slug,
      title: "New Arrivals",
      description: "The latest pieces to join the collection.",
      kind: "new-arrivals",
      defaultSort: "newest",
      products: rows.map(toProduct),
    };
  }

  const category = await db.query.categories.findFirst({ where: (row, { eq }) => eq(row.slug, slug) });
  if (category) {
    const rows = await db.query.products.findMany({
      where: (product, { eq }) => eq(product.categoryId, category.id),
      with: withRelations,
      orderBy: (product) => productOrder(sort, product),
    });
    return {
      slug,
      title: category.name,
      description: null,
      kind: "category",
      defaultSort: "newest",
      products: rows.map(toProduct),
    };
  }

  const collection = await db.query.collections.findFirst({ where: (row, { eq }) => eq(row.slug, slug) });
  if (collection) {
    const members = await db
      .select({ productId: collectionProducts.productId, position: collectionProducts.position })
      .from(collectionProducts)
      .where(eq(collectionProducts.collectionId, collection.id))
      .orderBy(collectionProducts.position);
    const rows = members.length
      ? await db.query.products.findMany({
          where: (product, { inArray }) =>
            inArray(
              product.id,
              members.map((member) => member.productId),
            ),
          with: withRelations,
          orderBy: (product) => productOrder(sort, product),
        })
      : [];
    const byId = new Map(rows.map((row) => [row.id, toProduct(row)]));
    // Editorial order unless the shopper picked a sort.
    const editorial = !sort || sort === "featured";
    return {
      slug,
      title: collection.title,
      description: collection.description,
      kind: "curated",
      defaultSort: "featured",
      products: editorial
        ? members.flatMap((member) => byId.get(member.productId) ?? [])
        : rows.map((row) => byId.get(row.id)!),
    };
  }

  return undefined;
}
