"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { isOutOfStockError } from "@/lib/db/errors";
import { adjustStock, updateProduct } from "@/lib/db/mutations/catalog";
import { CATALOG_TAG } from "@/lib/db/queries/catalog";
import { categories, products, productStock } from "@/lib/db/schema";
import {
  productErrors,
  productSchema,
  readProductValues,
  readStockChanges,
  type ProductErrors,
  type ProductValues,
  type StockErrors,
  type StockValues,
} from "@/lib/product-form";

// Every export here is a public endpoint, so each one starts with `requireAdmin()` before reading the form.
// After a write, `updateTag(CATALOG_TAG)` expires every cached storefront read (product pages, collections, rails),
// and `refresh()` re-renders the admin page, whose reads aren't cached.

const productIdSchema = z.coerce.number().int().positive();

const MISSING = "That product no longer exists.";

async function productExists(id: number) {
  const [row] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  return Boolean(row);
}

export type ProductFormState = {
  error?: string;
  fieldErrors?: ProductErrors;
  values?: ProductValues;
  saved?: boolean;
};

export async function saveProduct(_previous: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin("/admin/products");

  const values = readProductValues(formData);
  const id = productIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: MISSING, values };

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: productErrors(parsed.error), values };

  const [exists, [category]] = await Promise.all([
    productExists(id.data),
    db.select({ id: categories.id }).from(categories).where(eq(categories.id, parsed.data.categoryId)),
  ]);
  if (!exists) return { error: MISSING, values };
  if (!category) return { fieldErrors: { categoryId: "Choose a category." }, values };

  await updateProduct(id.data, parsed.data);

  updateTag(CATALOG_TAG);
  refresh();
  return { saved: true };
}

export type StockFormState = {
  error?: string;
  fieldErrors?: StockErrors;
  values?: StockValues;
  saved?: boolean;
};

export async function updateStock(_previous: StockFormState, formData: FormData): Promise<StockFormState> {
  await requireAdmin("/admin/products");

  const id = productIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: MISSING };

  const [exists, sizes] = await Promise.all([
    productExists(id.data),
    db.select({ size: productStock.size }).from(productStock).where(eq(productStock.productId, id.data)),
  ]);
  if (!exists) return { error: MISSING };

  const result = readStockChanges(
    formData,
    sizes.map((row) => row.size),
  );
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors, values: result.values };

  try {
    await adjustStock(id.data, result.changes, result.newSize);
  } catch (error) {
    if (isOutOfStockError(error)) {
      // Show the current counts: a checkout may have taken units since the page loaded.
      refresh();
      return {
        error: "That would take a size below zero, so nothing was changed. Check the current counts and try again.",
        values: result.values,
      };
    }
    throw error;
  }

  updateTag(CATALOG_TAG);
  refresh();
  return { saved: true };
}
