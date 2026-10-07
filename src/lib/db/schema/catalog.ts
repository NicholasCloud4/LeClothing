import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    /** Ordered "Details & Care" bullets. */
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    priceCents: integer("price_cents").notNull(),
    /** Name of the color shown in the photography. */
    color: text("color").notNull(),
    /** Number of colorways the style comes in. Display only, not variants. */
    colorCount: integer("color_count").notNull().default(1),
    isNew: boolean("is_new").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_created_at_idx").on(table.createdAt),
    check("products_price_cents_non_negative", sql`${table.priceCents} >= 0`),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    /** 0 is the primary shot used on product cards. */
    position: integer("position").notNull(),
  },
  (table) => [unique("product_images_product_id_position_unique").on(table.productId, table.position)],
);

/** Units on hand per size. Not a variant table: no SKU, price or color of its own. */
export const productStock = pgTable(
  "product_stock",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    /** Display order within the size run. */
    position: integer("position").notNull(),
    quantity: integer("quantity").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.size] }),
    check("product_stock_quantity_non_negative", sql`${table.quantity} >= 0`),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  stock: many(productStock),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, { fields: [productStock.productId], references: [products.id] }),
}));

export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type ProductImageRow = typeof productImages.$inferSelect;
export type ProductStockRow = typeof productStock.$inferSelect;
