import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, ilike, inArray, or, sql, type AnyColumn } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { CATALOG_TAG, toProduct, withRelations } from "@/lib/db/queries/catalog";
import type { Product } from "@/lib/catalog";
import { normalizeSearchTerm, SEARCH_LIMIT, searchWords, wordStartPattern } from "@/lib/search";

/** The column as " word word …": a leading space and punctuation runs turned into spaces, for `wordStartPattern`. */
function words(column: AnyColumn) {
  return sql`' ' || regexp_replace(${column}, '[^[:alnum:]]+', ' ', 'g')`;
}

/**
 * Products where every word of `term` starts a word (case-insensitively) in the name, description, color or
 * category name. Products whose name matches every word come first, then newest first.
 * LIKE wildcards in the term are escaped, so `%` or `_` never match everything.
 */
export async function searchProducts(term: string): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const normalized = normalizeSearchTerm(term);
  const patterns = normalized ? searchWords(normalized).map(wordStartPattern) : [];
  if (patterns.length === 0) return [];

  const wordMatches = patterns.map((pattern) =>
    or(
      ilike(words(products.name), pattern),
      ilike(words(products.description), pattern),
      ilike(words(products.color), pattern),
      ilike(words(categories.name), pattern),
    )!,
  );
  const nameMatch = and(...patterns.map((pattern) => ilike(words(products.name), pattern)))!;

  // A plain join query picks and orders the ids; the relational query below then loads them with images and
  // stock. That keeps the category join out of `db.query`, which rewrites qualified columns.
  const matches = await db
    .select({ id: products.id })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(...wordMatches))
    .orderBy(sql`case when ${nameMatch} then 0 else 1 end`, desc(products.createdAt), desc(products.id))
    .limit(SEARCH_LIMIT);
  if (matches.length === 0) return [];

  const rows = await db.query.products.findMany({
    where: (product) =>
      inArray(
        product.id,
        matches.map((match) => match.id),
      ),
    with: withRelations,
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return matches.flatMap((match) => {
    const row = byId.get(match.id);
    return row ? [toProduct(row)] : [];
  });
}
