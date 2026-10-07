// Loads the sample catalog into the database. Safe to re-run: categories and products are upserted
// by slug, and each seeded product's images and stock are replaced.
//
//   npm run db:seed

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { inArray, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { categories, products } from "./seed-data";

// Builds its own client instead of importing `@/lib/db`, which needs the env before it loads.
// Same precedence as Next.js: .env.local wins over .env.
config({ path: [".env.local", ".env"], quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to .env.");
}

const db = drizzle({ client: neon(databaseUrl), schema });

const DAY_MS = 24 * 60 * 60 * 1000;

const categoryId = (slug: string) => sql<number>`(select id from ${schema.categories} where slug = ${slug})`;
const productId = (slug: string) => sql<number>`(select id from ${schema.products} where slug = ${slug})`;

async function main() {
  const now = Date.now();
  const productSlugs = products.map((product) => product.slug);
  const seededProductIds = db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(inArray(schema.products.slug, productSlugs));

  const categoryUpsert = db
    .insert(schema.categories)
    .values(categories)
    .onConflictDoUpdate({
      target: schema.categories.slug,
      set: { name: sql`excluded.name`, sortOrder: sql`excluded.sort_order` },
    });

  const productUpsert = db
    .insert(schema.products)
    .values(
      products.map((product, index) => ({
        slug: product.slug,
        name: product.name,
        categoryId: categoryId(product.categorySlug),
        description: product.description,
        details: product.details,
        priceCents: product.priceCents,
        color: product.color,
        colorCount: product.colorCount,
        isNew: product.isNew ?? false,
        // One day apart, in list order, so "newest first" reproduces the list.
        createdAt: new Date(now - index * DAY_MS),
      })),
    )
    .onConflictDoUpdate({
      target: schema.products.slug,
      set: {
        name: sql`excluded.name`,
        categoryId: sql`excluded.category_id`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        priceCents: sql`excluded.price_cents`,
        color: sql`excluded.color`,
        colorCount: sql`excluded.color_count`,
        isNew: sql`excluded.is_new`,
        createdAt: sql`excluded.created_at`,
        updatedAt: sql`now()`,
      },
    });

  const queries: [BatchItem<"pg">, ...BatchItem<"pg">[]] = [
    categoryUpsert,
    productUpsert,
    db.delete(schema.productImages).where(inArray(schema.productImages.productId, seededProductIds)),
    db.delete(schema.productStock).where(inArray(schema.productStock.productId, seededProductIds)),
    db.insert(schema.productImages).values(
      products.flatMap((product) =>
        product.images.map((image, position) => ({
          productId: productId(product.slug),
          url: image.url,
          alt: image.alt,
          position,
        })),
      ),
    ),
    db.insert(schema.productStock).values(
      products.flatMap((product) =>
        product.sizes.map((size, position) => ({
          productId: productId(product.slug),
          size: size.size,
          position,
          quantity: size.quantity,
        })),
      ),
    ),
  ];

  // Runs as a single transaction over Neon's HTTP driver.
  await db.batch(queries);

  const imageCount = products.reduce((total, product) => total + product.images.length, 0);
  const sizeCount = products.reduce((total, product) => total + product.sizes.length, 0);
  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, ${imageCount} images, ${sizeCount} stock rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
