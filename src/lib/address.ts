// Shipping address shape and validation, shared by checkout and the account address book.
// Safe to import from client components.

import { z } from "zod";

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
] as const;

const COUNTRY_CODES = COUNTRIES.map((country) => country.code) as [string, ...string[]];

export function countryName(code: string) {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}

const required = (message: string, max = 120) => z.string().trim().min(1, message).max(max, "That's too long.");
const optional = (max = 120) =>
  z
    .string()
    .trim()
    .max(max, "That's too long.")
    .transform((value) => value || null);

export const addressSchema = z.object({
  fullName: required("Enter the recipient's name."),
  line1: required("Enter a street address."),
  line2: optional(),
  city: required("Enter a city."),
  region: optional(),
  postalCode: required("Enter a postal code.", 20),
  country: z.enum(COUNTRY_CODES, "Choose a country."),
  phone: optional(30),
});

export type AddressInput = z.output<typeof addressSchema>;
export type AddressField = keyof AddressInput;
export type AddressErrors = Partial<Record<AddressField, string>>;

/** Raw strings for echoing a submitted address back into the form. */
export type AddressValues = Partial<Record<AddressField, string>>;

export const ADDRESS_FIELDS = Object.keys(addressSchema.shape) as AddressField[];

/** Pulls the address fields out of a submitted form as plain strings. */
export function readAddressValues(formData: FormData): AddressValues {
  const values: AddressValues = {};
  for (const field of ADDRESS_FIELDS) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

export function addressErrors(error: z.ZodError): AddressErrors {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const errors: AddressErrors = {};
  for (const field of ADDRESS_FIELDS) {
    const message = flat[field]?.[0];
    if (message) errors[field] = message;
  }
  return errors;
}
