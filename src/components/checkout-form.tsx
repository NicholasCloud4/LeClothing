"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AddressFields } from "@/components/address-fields";
import { FormField } from "@/components/form-field";
import { OrderLines, OrderTotals } from "@/components/order-lines";
import type { AddressValues } from "@/lib/address";
import { startCheckout, type CheckoutState } from "@/lib/actions/checkout";
import {
  cartSubtotalCents,
  purchasableQuantity,
  SHIPPING_METHODS,
  shippingCents,
  type CartLine,
  type ShippingMethod,
} from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import type { OrderItem } from "@/lib/orders";

export type CheckoutAddress = AddressValues & { id: number };

type CheckoutFormProps = {
  lines: CartLine[];
  defaultEmail: string;
  /** Null for guests, who can't save addresses. */
  savedAddresses: CheckoutAddress[] | null;
  /** The shopper came back from Stripe without paying. */
  paymentCancelled?: boolean;
};

const initialState: CheckoutState = {};

export function CheckoutForm({ lines, defaultEmail, savedAddresses, paymentCancelled }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(startCheckout, initialState);
  const [method, setMethod] = useState<ShippingMethod>(
    (state.values?.shippingMethod as ShippingMethod | undefined) ?? "standard",
  );
  const [addressId, setAddressId] = useState<string>(savedAddresses?.[0] ? String(savedAddresses[0].id) : "");
  // Picking a saved address replaces whatever a failed submit echoed back.
  const [pickedAddress, setPickedAddress] = useState(false);

  const items: OrderItem[] = lines.map((line) => ({
    slug: line.slug,
    name: line.name,
    color: line.color,
    size: line.size,
    quantity: purchasableQuantity(line),
    unitPriceCents: line.unitPriceCents,
    imageUrl: line.image?.src ?? null,
  }));
  const subtotal = cartSubtotalCents({ lines });
  const shipping = shippingCents(method);

  const selectedAddress = savedAddresses?.find((address) => String(address.id) === addressId);
  // After a failed submit, show what the shopper typed; otherwise the chosen saved address.
  const showSubmitted = state.values !== undefined && !pickedAddress;
  const addressValues = showSubmitted ? state.values : (selectedAddress ?? {});

  return (
    <form
      action={(formData) => {
        setPickedAddress(false);
        return formAction(formData);
      }}
      noValidate
      className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16"
    >
      <input type="hidden" name="expectedTotalCents" value={subtotal + shipping} />

      <div className="flex flex-col gap-10">
        {paymentCancelled && !state.error && (
          <p role="status" className="border p-4">
            Payment wasn&apos;t completed and nothing was charged. Your bag is just as you left it.
          </p>
        )}
        {state.error && (
          <div role="alert" className="border border-danger p-4 text-danger">
            <p>{state.error}</p>
            {state.bagChanged && (
              <Link href="/cart" className="link mt-2 inline-block text-foreground">
                Review your bag
              </Link>
            )}
          </div>
        )}

        <fieldset className="flex flex-col gap-5">
          <legend className="heading-3 mb-5">Contact</legend>
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email ?? defaultEmail}
            error={state.fieldErrors?.email}
            hint="We'll send your order confirmation here."
          />
          {!savedAddresses && (
            <p className="text-muted-foreground">
              Have an account?{" "}
              <Link href="/account/sign-in?next=%2Fcheckout" className="link">
                Sign in
              </Link>{" "}
              to use your saved addresses.
            </p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="heading-3 mb-5">Shipping address</legend>
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="flex flex-col gap-2">
              <label htmlFor="saved-address" className="text-sm">
                Saved addresses
              </label>
              <select
                id="saved-address"
                value={addressId}
                onChange={(event) => {
                  setAddressId(event.target.value);
                  setPickedAddress(true);
                }}
                className="input"
              >
                {savedAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.fullName}, {address.line1}, {address.city}
                  </option>
                ))}
                <option value="">Use a new address</option>
              </select>
            </div>
          )}
          <AddressFields
            key={showSubmitted ? "submitted" : `address-${addressId}`}
            values={addressValues}
            errors={state.fieldErrors}
          />
          {savedAddresses && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="saveAddress"
                defaultChecked={savedAddresses.length === 0}
                className="size-4 accent-primary"
              />
              Save this address to my account
            </label>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="heading-3 mb-5">Delivery</legend>
          {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((id) => {
            const option = SHIPPING_METHODS[id];
            return (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-4 border border-input p-4 transition-colors has-checked:border-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground"
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={id}
                  checked={method === id}
                  onChange={() => setMethod(id)}
                  className="size-4 accent-primary"
                />
                <span className="flex-1">
                  {option.label}
                  <span className="block text-muted-foreground">{option.detail}</span>
                </span>
                <span className="price">
                  {option.priceCents === 0 ? "Complimentary" : formatPrice(option.priceCents)}
                </span>
              </label>
            );
          })}
          {state.fieldErrors?.shippingMethod && (
            <p className="text-xs text-danger">{state.fieldErrors.shippingMethod}</p>
          )}
        </fieldset>
      </div>

      <aside
        aria-labelledby="checkout-summary-title"
        className="h-fit bg-muted p-6 lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
      >
        <h2 id="checkout-summary-title" className="heading-3 mb-2">
          Order summary
        </h2>
        <OrderLines items={items} label="Items in your order" />
        <div className="mt-4 border-t pt-5">
          <OrderTotals subtotalCents={subtotal} shippingCents={shipping} totalCents={subtotal + shipping} />
        </div>
        <p className="mt-5 text-muted-foreground">
          You&apos;ll pay securely on the next page, powered by Stripe. Your items are held for 30 minutes.
        </p>
        <button type="submit" className="btn btn-primary btn-lg btn-block mt-6" disabled={pending}>
          {pending ? "Preparing payment…" : "Continue to payment"}
        </button>
        <Link href="/cart" className="link mt-5 block text-center">
          Back to bag
        </Link>
      </aside>
    </form>
  );
}
