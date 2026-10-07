"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { MAX_LINE_QUANTITY } from "@/lib/cart";
import { addItem, setLineQuantity, type AddItemResult } from "@/lib/db/mutations/cart";

const addSchema = z.object({
  productSlug: z.string().min(1).max(200),
  size: z.string().min(1).max(50),
});

export async function addToCart(productSlug: string, size: string): Promise<AddItemResult> {
  const parsed = addSchema.safeParse({ productSlug, size });
  if (!parsed.success) return { ok: false, error: "That size isn't available." };

  const result = await addItem(parsed.data.productSlug, parsed.data.size);
  // Updates the header's bag count on the page the shopper is looking at.
  refresh();
  return result;
}

const lineSchema = z.object({
  productId: z.coerce.number().int().positive(),
  size: z.string().min(1).max(50),
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
});

/** Form action for the quantity stepper: `quantity` is the new total for the line, 0 removes it. */
export async function updateCartLine(formData: FormData) {
  const parsed = lineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await setLineQuantity(parsed.data.productId, parsed.data.size, parsed.data.quantity);
  refresh();
}
