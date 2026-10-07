// Order types and pure helpers. Safe to import from client components.

import type { ShippingMethod } from "@/lib/cart";

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  fulfilled: "Shipped",
  cancelled: "Cancelled",
};

export type OrderItem = {
  slug: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  imageUrl: string | null;
};

export type Order = {
  orderNumber: string;
  email: string;
  status: OrderStatus;
  shippingMethod: ShippingMethod | string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: Date;
  shipTo: {
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  items: OrderItem[];
};

// Crockford base32 without I, L, O, U: no look-alike characters when someone reads a number out loud.
const ORDER_NUMBER_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ORDER_NUMBER_LENGTH = 10;

/** "LE-" plus 10 random characters (50 bits), so a number can't be guessed from another one. */
export function generateOrderNumber() {
  const bytes = crypto.getRandomValues(new Uint8Array(ORDER_NUMBER_LENGTH));
  // 256 is a multiple of 32, so the modulo adds no bias.
  const suffix = Array.from(bytes, (byte) => ORDER_NUMBER_ALPHABET[byte % ORDER_NUMBER_ALPHABET.length]).join("");
  return `LE-${suffix}`;
}

const ORDER_NUMBER_PATTERN = /^LE-[0-9A-HJKMNP-TV-Z]{10}$/;

export function isOrderNumber(value: unknown): value is string {
  return typeof value === "string" && ORDER_NUMBER_PATTERN.test(value);
}
