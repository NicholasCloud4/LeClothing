"use client";

import { useActionState, useId } from "react";
import { FormField } from "@/components/form-field";
import { updateStock, type StockFormState } from "@/lib/actions/admin";
import { deltaFieldName } from "@/lib/product-form";

const initialState: StockFormState = {};

export type AdminStockRow = { size: string; available: number; held: number };

/** Relative stock changes per size, plus an optional new size. */
export function AdminStockForm({ productId, rows }: { productId: number; rows: AdminStockRow[] }) {
  const [state, formAction, pending] = useActionState(updateStock, initialState);
  const errors = state.fieldErrors ?? {};
  const baseId = useId();

  return (
    <form action={formAction} noValidate className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="id" value={productId} />
      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="text-success">
          Stock updated.
        </p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-muted-foreground">
              <tr className="border-b">
                <th scope="col" className="py-3 pr-4 font-normal">
                  Size
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">
                  Available
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">
                  Held in checkout
                </th>
                <th scope="col" className="py-3 font-normal">
                  Add or remove
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const error = errors.deltas?.[row.size];
                const errorId = `${baseId}-${index}-error`;
                return (
                  <tr key={row.size} className="border-b align-top">
                    <th scope="row" className="py-3 pr-4 font-normal">
                      {row.size}
                    </th>
                    <td className={`py-3 pr-4 tabular-nums ${row.available === 0 ? "text-muted-foreground" : ""}`}>
                      {row.available === 0 ? "0 (sold out)" : row.available}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">{row.held}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        step={1}
                        name={deltaFieldName(row.size)}
                        placeholder="0"
                        defaultValue={state.values?.deltas[row.size]}
                        aria-label={`Add or remove units of size ${row.size}`}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        className="input w-32"
                      />
                      {error && (
                        <p id={errorId} className="mt-1 text-xs text-danger">
                          {error}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Available is what shoppers can still buy: units held by checkouts in progress are already taken out, and come
        back if the checkout is abandoned. Enter a positive number to add units and a negative one to remove them, so
        sales made while you edit are kept. To retire a size, bring it to 0.
      </p>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-sm">Add a size (optional)</legend>
        <FormField
          label="Size"
          name="newSize"
          maxLength={20}
          defaultValue={state.values?.newSize}
          error={errors.newSize}
        />
        <FormField
          label="Starting units"
          name="newQuantity"
          type="number"
          min={0}
          step={1}
          placeholder="0"
          defaultValue={state.values?.newQuantity}
          error={errors.newQuantity}
        />
      </fieldset>

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Updating…" : "Update stock"}
        </button>
      </div>
    </form>
  );
}
