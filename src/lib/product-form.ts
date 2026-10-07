// Admin product editing: form shapes and validation. Pure, so it is unit-tested and safe to import from client
// components. The writes are in `@/lib/db/mutations/catalog`, called from `@/lib/actions/admin`.

import { z } from "zod";

/** Image hosts the storefront can render. Keep in sync with `images.remotePatterns` in `next.config.ts`. */
export const IMAGE_HOSTS = ["images.unsplash.com"];

export const MAX_IMAGES = 10;
export const MAX_DETAILS = 12;
/** Largest single stock change or starting quantity accepted from the form. */
export const MAX_STOCK_CHANGE = 10_000;

// ---------------------------------------------------------------------------
// Prices

/** "125", "125.5", "$1,250.00" → cents. Null for anything else, including negatives and more than 2 decimals. */
export function parseDollars(value: string): number | null {
  const match = /^(\d{1,6})(?:\.(\d{1,2}))?$/.exec(value.trim().replace(/^\$/, "").replaceAll(",", ""));
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

/** Cents → the plain string the price field shows: "125" or "125.50". */
export function formatDollars(cents: number) {
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? String(dollars) : `${dollars}.${String(rest).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Images: one per line, "URL | alt text"

export type ProductImageInput = { url: string; alt: string };

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function formatImageLines(images: ProductImageInput[]) {
  return images.map((image) => `${image.url} | ${image.alt}`).join("\n");
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const imagesField = z.string().transform((value, ctx) => {
  const rows = lines(value);
  if (rows.length === 0) {
    ctx.addIssue({ code: "custom", message: "Add at least one image." });
    return z.NEVER;
  }
  if (rows.length > MAX_IMAGES) {
    ctx.addIssue({ code: "custom", message: `Use at most ${MAX_IMAGES} images.` });
    return z.NEVER;
  }

  const images: ProductImageInput[] = [];
  for (const [index, row] of rows.entries()) {
    const bar = row.indexOf("|");
    const url = (bar === -1 ? row : row.slice(0, bar)).trim();
    const alt = bar === -1 ? "" : row.slice(bar + 1).trim();
    if (!isAllowedImageUrl(url)) {
      ctx.addIssue({ code: "custom", message: `Line ${index + 1}: use an https://${IMAGE_HOSTS[0]} image URL.` });
      return z.NEVER;
    }
    if (!alt || alt.length > 200) {
      ctx.addIssue({ code: "custom", message: `Line ${index + 1}: add alt text after a "|" (up to 200 characters).` });
      return z.NEVER;
    }
    images.push({ url, alt });
  }
  return images;
});

// ---------------------------------------------------------------------------
// Product details

const required = (message: string, max: number) => z.string().trim().min(1, message).max(max, "That's too long.");

const productFields = z.object({
  name: required("Enter a name.", 120),
  categoryId: z.coerce.number("Choose a category.").int("Choose a category.").positive("Choose a category."),
  price: z.string().transform((value, ctx) => {
    const cents = parseDollars(value);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Enter a price like 125 or 125.50." });
      return z.NEVER;
    }
    return cents;
  }),
  color: required("Enter the color in the photos.", 60),
  colorCount: z.coerce
    .number("Enter a whole number.")
    .int("Enter a whole number.")
    .min(1, "Enter at least 1.")
    .max(50, "Enter at most 50."),
  description: required("Enter a description.", 2000),
  details: z
    .string()
    .transform(lines)
    .pipe(
      z
        .array(z.string().max(200, "Keep each line under 200 characters."))
        .max(MAX_DETAILS, `Use at most ${MAX_DETAILS} lines.`),
    ),
  images: imagesField,
  isNew: z.string().transform((value) => value === "on"),
});

export const productSchema = productFields.transform(({ price, ...rest }) => ({ ...rest, priceCents: price }));

export type ProductInput = z.output<typeof productSchema>;
export type ProductField = keyof typeof productFields.shape;
export type ProductErrors = Partial<Record<ProductField, string>>;
/** Raw strings for echoing a submitted form back. */
export type ProductValues = Partial<Record<ProductField, string>>;

export const PRODUCT_FIELDS = Object.keys(productFields.shape) as ProductField[];

export function readProductValues(formData: FormData): ProductValues {
  const values: ProductValues = {};
  for (const field of PRODUCT_FIELDS) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

export function productErrors(error: z.ZodError): ProductErrors {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const errors: ProductErrors = {};
  for (const field of PRODUCT_FIELDS) {
    const message = flat[field]?.[0];
    if (message) errors[field] = message;
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Stock: relative changes per size, so checkouts and restocks that land meanwhile are kept

export const deltaFieldName = (size: string) => `delta:${size}`;

export type StockChange = { size: string; delta: number };
export type NewSize = { size: string; quantity: number };
export type StockValues = { deltas: Record<string, string>; newSize: string; newQuantity: string };
export type StockErrors = { deltas?: Record<string, string>; newSize?: string; newQuantity?: string };

export type StockChangeResult =
  | { ok: true; changes: StockChange[]; newSize: NewSize | null; values: StockValues }
  | { ok: false; error?: string; fieldErrors?: StockErrors; values: StockValues };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Reads the stock form. Only sizes in `existingSizes` (read from the database) are considered, so a forged field
 * can't touch another product. A blank change counts as 0.
 */
export function readStockChanges(formData: FormData, existingSizes: string[]): StockChangeResult {
  const values: StockValues = {
    deltas: {},
    newSize: text(formData, "newSize"),
    newQuantity: text(formData, "newQuantity"),
  };
  const deltaErrors: Record<string, string> = {};
  const changes: StockChange[] = [];

  for (const size of existingSizes) {
    const raw = text(formData, deltaFieldName(size));
    values.deltas[size] = raw;
    if (raw === "") continue;
    if (!/^[+-]?\d+$/.test(raw) || Math.abs(Number(raw)) > MAX_STOCK_CHANGE) {
      deltaErrors[size] = `Enter a whole number between -${MAX_STOCK_CHANGE} and ${MAX_STOCK_CHANGE}.`;
      continue;
    }
    const delta = Number(raw);
    if (delta !== 0) changes.push({ size, delta });
  }

  const fieldErrors: StockErrors = {};
  if (Object.keys(deltaErrors).length > 0) fieldErrors.deltas = deltaErrors;

  let newSize: NewSize | null = null;
  if (values.newSize) {
    const taken = existingSizes.some((size) => size.toLowerCase() === values.newSize.toLowerCase());
    if (values.newSize.length > 20) fieldErrors.newSize = "Use at most 20 characters.";
    else if (taken) fieldErrors.newSize = "That size already exists. Adjust it above instead.";

    const quantity = values.newQuantity === "" ? 0 : Number(values.newQuantity);
    if (!/^\d*$/.test(values.newQuantity) || quantity > MAX_STOCK_CHANGE) {
      fieldErrors.newQuantity = `Enter a whole number from 0 to ${MAX_STOCK_CHANGE}.`;
    } else if (!fieldErrors.newSize) {
      newSize = { size: values.newSize, quantity };
    }
  } else if (values.newQuantity !== "" && values.newQuantity !== "0") {
    fieldErrors.newSize = "Name the new size.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors, values };
  if (changes.length === 0 && !newSize) return { ok: false, error: "Enter a change for at least one size.", values };
  return { ok: true, changes, newSize, values };
}
