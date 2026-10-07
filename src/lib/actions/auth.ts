"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { safeNextPath } from "@/lib/auth-session";
import { mergeGuestCart } from "@/lib/db/mutations/cart";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  /** Echoed back so a failed submit doesn't clear the form. Never includes the password. */
  values?: { name?: string; email?: string };
};

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));
const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(128, "Use at most 128 characters.");

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: emailSchema,
  password: passwordSchema,
});

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fieldErrors(error: z.ZodError): AuthFormState["fieldErrors"] {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return {
    name: flat.name?.[0],
    email: flat.email?.[0],
    password: flat.password?.[0],
  };
}

/** A failed merge must not fail the sign-in: the guest cart just stays where it is. */
async function adoptGuestCart(userId: string) {
  try {
    await mergeGuestCart(userId);
  } catch (error) {
    console.error("Could not merge the guest cart", error);
  }
}

export async function signInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: field(formData, "email") };
  const parsed = signInSchema.safeParse({ email: values.email, password: field(formData, "password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  let userId: string;
  try {
    const result = await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
    userId = result.user.id;
  } catch (error) {
    if (error instanceof APIError) {
      // One message for unknown email and wrong password, so the form doesn't reveal which accounts exist.
      return { error: "Incorrect email or password.", values };
    }
    throw error;
  }

  await adoptGuestCart(userId);
  redirect(safeNextPath(formData.get("next")));
}

export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { name: field(formData, "name"), email: field(formData, "email") };
  const parsed = signUpSchema.safeParse({ ...values, password: field(formData, "password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  let userId: string;
  try {
    const result = await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
    userId = result.user.id;
  } catch (error) {
    if (error instanceof APIError) {
      return { error: "We couldn't create that account. If you already have one, try signing in.", values };
    }
    throw error;
  }

  await adoptGuestCart(userId);
  redirect(safeNextPath(formData.get("next")));
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
