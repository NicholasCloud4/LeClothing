"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AddressFields } from "@/components/address-fields";
import type { AddressValues } from "@/lib/address";
import { saveAddress, type AddressFormState } from "@/lib/actions/account";

const initialState: AddressFormState = {};

type AddressFormProps = {
  /** Present when editing; the form then updates that address instead of adding one. */
  id?: number;
  initialValues?: AddressValues;
  isDefault?: boolean;
};

export function AddressForm({ id, initialValues, isDefault = false }: AddressFormProps) {
  const [state, formAction, pending] = useActionState(saveAddress, initialState);
  const editing = id !== undefined;

  return (
    <form action={formAction} noValidate className="flex max-w-xl flex-col gap-6">
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <AddressFields values={state.values ?? initialValues} errors={state.fieldErrors} />
      {!isDefault && (
        <label className="flex items-center gap-3">
          <input type="checkbox" name="isDefault" className="size-4 accent-primary" />
          Make this my default address
        </label>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save address" : "Add address"}
        </button>
        {editing && (
          <Link href="/account/addresses" className="link-muted">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
