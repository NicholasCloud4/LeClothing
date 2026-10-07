"use server";

import { APIError } from "better-auth/api";
import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addressErrors, addressSchema, readAddressValues, type AddressErrors, type AddressValues } from "@/lib/address";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

// Every action here starts with `requireUser()` and scopes its queries to that user's id. Nothing trusts a user
// id (or an address id without an owner check) from the form.

// ---------------------------------------------------------------------------
// Profile

export type ProfileState = {
  error?: string;
  fieldErrors?: { name?: string; currentPassword?: string; newPassword?: string };
  saved?: boolean;
};

const nameSchema = z.object({ name: z.string().trim().min(1, "Enter your name.").max(100, "That's too long.") });

export async function updateProfile(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  await requireUser("/account");

  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: { name: z.flattenError(parsed.error).fieldErrors.name?.[0] } };

  try {
    await auth.api.updateUser({ body: { name: parsed.data.name }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) return { error: "We couldn't update your name. Please try again." };
    throw error;
  }

  refresh();
  return { saved: true };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "Use at least 8 characters.").max(128, "Use at most 128 characters."),
});

export async function changePassword(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  await requireUser("/account");

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return { fieldErrors: { currentPassword: flat.currentPassword?.[0], newPassword: flat.newPassword?.[0] } };
  }

  try {
    // Signs out the user's other devices, which is what you want after a password change.
    await auth.api.changePassword({
      body: { ...parsed.data, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) return { fieldErrors: { currentPassword: "That isn't your current password." } };
    throw error;
  }

  // The session cookie was rotated, which re-renders the page and would drop this form's local state,
  // so the confirmation travels in the URL instead.
  redirect("/account?updated=password");
}

// ---------------------------------------------------------------------------
// Address book

export type AddressFormState = {
  error?: string;
  fieldErrors?: AddressErrors;
  values?: AddressValues;
};

const addressIdSchema = z.coerce.number().int().positive();

/** Creates an address, or updates one when the form carries an `id`. The first address becomes the default. */
export async function saveAddress(_previous: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const user = await requireUser("/account/addresses");

  const values = readAddressValues(formData);
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: addressErrors(parsed.error), values };

  const wantsDefault = formData.get("isDefault") === "on";
  const rawId = formData.get("id");

  if (rawId) {
    const id = addressIdSchema.safeParse(rawId);
    if (!id.success) return { error: "That address no longer exists.", values };

    const [updated] = await db
      .update(addresses)
      .set(parsed.data)
      .where(and(eq(addresses.id, id.data), eq(addresses.userId, user.id)))
      .returning({ id: addresses.id });
    if (!updated) return { error: "That address no longer exists.", values };

    if (wantsDefault) await makeDefault(user.id, updated.id);
  } else {
    // `is_default` is decided in SQL so two quick submits can't both claim "first address".
    const [created] = await db
      .insert(addresses)
      .values({
        userId: user.id,
        ...parsed.data,
        isDefault: sql`not exists (select 1 from ${addresses} where user_id = ${user.id})`,
      })
      .returning({ id: addresses.id });
    if (wantsDefault) await makeDefault(user.id, created.id);
  }

  redirect("/account/addresses");
}

/** Clears the user's current default and sets this one, in a single transaction. */
async function makeDefault(userId: string, id: number) {
  await db.batch([
    db
      .update(addresses)
      .set({ isDefault: false })
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true))),
    db
      .update(addresses)
      .set({ isDefault: true })
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId))),
  ]);
}

export async function setDefaultAddress(formData: FormData) {
  const user = await requireUser("/account/addresses");
  const id = addressIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;

  const [owned] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.id, id.data), eq(addresses.userId, user.id)));
  if (!owned) return;

  await makeDefault(user.id, owned.id);
  refresh();
}

export async function deleteAddress(formData: FormData) {
  const user = await requireUser("/account/addresses");
  const id = addressIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;

  await db.batch([
    db.delete(addresses).where(and(eq(addresses.id, id.data), eq(addresses.userId, user.id))),
    // If the default was deleted, promote the oldest remaining address.
    db
      .update(addresses)
      .set({ isDefault: true })
      .where(
        and(
          sql`${addresses.id} = (select id from addresses where user_id = ${user.id} order by created_at, id limit 1)`,
          sql`not exists (select 1 from addresses where user_id = ${user.id} and is_default)`,
        ),
      ),
  ]);
  refresh();
}
