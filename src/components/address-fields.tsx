"use client";

import { useId } from "react";
import { FormField } from "@/components/form-field";
import { COUNTRIES, type AddressErrors, type AddressValues } from "@/lib/address";

type AddressFieldsProps = {
  values?: AddressValues;
  errors?: AddressErrors;
};

/**
 * The shipping address inputs, uncontrolled. Render with a `key` to swap in a different address.
 * Shared by checkout and the account address book.
 */
export function AddressFields({ values = {}, errors = {} }: AddressFieldsProps) {
  const countryId = useId();

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField
        label="Full name"
        name="fullName"
        autoComplete="shipping name"
        required
        defaultValue={values.fullName}
        error={errors.fullName}
        className="sm:col-span-2"
      />
      <FormField
        label="Address"
        name="line1"
        autoComplete="shipping address-line1"
        required
        defaultValue={values.line1}
        error={errors.line1}
        className="sm:col-span-2"
      />
      <FormField
        label="Apartment, suite, etc. (optional)"
        name="line2"
        autoComplete="shipping address-line2"
        defaultValue={values.line2}
        error={errors.line2}
        className="sm:col-span-2"
      />
      <FormField
        label="City"
        name="city"
        autoComplete="shipping address-level2"
        required
        defaultValue={values.city}
        error={errors.city}
      />
      <FormField
        label="State / region (optional)"
        name="region"
        autoComplete="shipping address-level1"
        defaultValue={values.region}
        error={errors.region}
      />
      <FormField
        label="Postal code"
        name="postalCode"
        autoComplete="shipping postal-code"
        required
        defaultValue={values.postalCode}
        error={errors.postalCode}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor={countryId} className="text-sm">
          Country
        </label>
        <select
          id={countryId}
          name="country"
          autoComplete="shipping country"
          required
          defaultValue={values.country || "US"}
          className="input"
          aria-invalid={errors.country ? true : undefined}
          aria-describedby={errors.country ? `${countryId}-error` : undefined}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country && (
          <p id={`${countryId}-error`} className="text-xs text-danger">
            {errors.country}
          </p>
        )}
      </div>
      <FormField
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="shipping tel"
        defaultValue={values.phone}
        error={errors.phone}
        hint="Only used for delivery updates."
        className="sm:col-span-2"
      />
    </div>
  );
}
