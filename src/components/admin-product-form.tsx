"use client";

import { useActionState, useId } from "react";
import { FormField, TextAreaField } from "@/components/form-field";
import { saveProduct, type ProductFormState } from "@/lib/actions/admin";
import { IMAGE_HOSTS, MAX_IMAGES, type ProductValues } from "@/lib/product-form";

const initialState: ProductFormState = {};

type AdminProductFormProps = {
  id: number;
  initialValues: ProductValues;
  categories: { id: number; name: string }[];
};

/** Name, price, copy and images of one product. Uncontrolled: after a save the fields reset to the saved values. */
export function AdminProductForm({ id, initialValues, categories }: AdminProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProduct, initialState);
  const values = state.values ?? initialValues;
  const errors = state.fieldErrors ?? {};
  const categoryId = useId();

  return (
    <form action={formAction} noValidate className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="id" value={id} />
      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="text-success">
          Product saved. The storefront shows the change on the next page load.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Name"
          name="name"
          required
          defaultValue={values.name}
          error={errors.name}
          className="sm:col-span-2"
        />
        <div className="flex flex-col gap-2">
          <label htmlFor={categoryId} className="text-sm">
            Category
          </label>
          <select
            id={categoryId}
            name="categoryId"
            required
            defaultValue={values.categoryId}
            className="input"
            aria-invalid={errors.categoryId ? true : undefined}
            aria-describedby={errors.categoryId ? `${categoryId}-error` : undefined}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p id={`${categoryId}-error`} className="text-xs text-danger">
              {errors.categoryId}
            </p>
          )}
        </div>
        <FormField
          label="Price (USD)"
          name="price"
          inputMode="decimal"
          required
          defaultValue={values.price}
          error={errors.price}
          hint="For example 125 or 125.50."
        />
        <FormField label="Color in the photos" name="color" required defaultValue={values.color} error={errors.color} />
        <FormField
          label="Number of colorways"
          name="colorCount"
          type="number"
          min={1}
          max={50}
          step={1}
          required
          defaultValue={values.colorCount}
          error={errors.colorCount}
        />
        <TextAreaField
          label="Description"
          name="description"
          required
          rows={4}
          defaultValue={values.description}
          error={errors.description}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Details & care"
          name="details"
          rows={5}
          defaultValue={values.details}
          error={errors.details}
          hint="One bullet per line."
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Images"
          name="images"
          required
          rows={5}
          spellCheck={false}
          defaultValue={values.images}
          error={errors.images}
          hint={`One per line as "URL | alt text", up to ${MAX_IMAGES}. The first is the product card image. Only https://${IMAGE_HOSTS.join(", ")} URLs.`}
          className="sm:col-span-2"
        />
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="isNew" defaultChecked={values.isNew === "on"} className="size-4 accent-primary" />
        Show the &ldquo;New&rdquo; badge
      </label>

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save product"}
        </button>
      </div>
    </form>
  );
}
