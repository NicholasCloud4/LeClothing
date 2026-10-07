// Cart and checkout types and pure helpers. Safe to import from client components.
// The cart stores no prices; every amount here is derived from the current product price.

import type { CatalogImage } from "@/lib/catalog";

/** Most units of one product in one size that can sit in a bag. */
export const MAX_LINE_QUANTITY = 10;

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  color: string;
  size: string;
  /** Quantity as saved in the bag. May exceed `available` if stock dropped since it was added. */
  quantity: number;
  /** Units currently on hand in this size. */
  available: number;
  unitPriceCents: number;
  image: CatalogImage | null;
};

export type Cart = {
  lines: CartLine[];
};

/** What can actually be bought: the saved quantity capped by stock and the per-line maximum. */
export function purchasableQuantity(line: CartLine) {
  return Math.max(0, Math.min(line.quantity, line.available, MAX_LINE_QUANTITY));
}

export function lineTotalCents(line: CartLine) {
  return purchasableQuantity(line) * line.unitPriceCents;
}

export function cartSubtotalCents(cart: Cart) {
  return cart.lines.reduce((total, line) => total + lineTotalCents(line), 0);
}

export function cartItemCount(cart: Cart) {
  return cart.lines.reduce((total, line) => total + purchasableQuantity(line), 0);
}

export function hasPurchasableLines(cart: Cart) {
  return cart.lines.some((line) => purchasableQuantity(line) > 0);
}

export type LineIssue = "unavailable" | "reduced";

/** `unavailable`: sold out in this size. `reduced`: fewer units left than the bag holds. */
export function lineIssue(line: CartLine): LineIssue | null {
  if (line.available === 0) return "unavailable";
  if (line.quantity > line.available) return "reduced";
  return null;
}

// ---------------------------------------------------------------------------
// Shipping. Fixed in code until there is a reason to manage it in the database.

export const SHIPPING_METHODS = {
  standard: { label: "Standard delivery", detail: "2–4 business days", priceCents: 0 },
  express: { label: "Express delivery", detail: "Next business day", priceCents: 2500 },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export const SHIPPING_METHOD_IDS = Object.keys(SHIPPING_METHODS) as [ShippingMethod, ...ShippingMethod[]];

export function shippingCents(method: ShippingMethod) {
  return SHIPPING_METHODS[method].priceCents;
}
