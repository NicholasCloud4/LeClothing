// Stripe Checkout params and payment-state rules. Pure: no Stripe client, no database, so it can be unit-tested.
// Every amount here comes from our own order rows; nothing the browser sent reaches Stripe.

import type Stripe from "stripe";
import { SHIPPING_METHODS, type ShippingMethod } from "@/lib/cart";

export const STORE_CURRENCY = "usd";

/** How long a checkout holds stock. Stripe's minimum session lifetime is 30 minutes; the extra minute absorbs latency. */
export const CHECKOUT_HOLD_MS = 31 * 60 * 1000;

/** Tags our sessions in the Stripe Dashboard so this flow can be told apart from others. */
export const INTEGRATION_IDENTIFIER = "leclothing_hosted_checkout_qhvtmzrk";

export type CancelReason = "expired" | "payment_failed" | "superseded" | "abandoned" | "session_error";

/** The parts of an order line that are sent to Stripe: the snapshot written to `order_items`. */
export type CheckoutItem = {
  name: string;
  color: string;
  size: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
};

export function checkoutLineItems(items: CheckoutItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: STORE_CURRENCY,
      unit_amount: item.unitPriceCents,
      product_data: {
        name: item.name,
        description: `${item.color}, size ${item.size}`,
        ...(item.imageUrl?.startsWith("https://") ? { images: [item.imageUrl] } : {}),
      },
    },
  }));
}

export function shippingOption(method: ShippingMethod): Stripe.Checkout.SessionCreateParams.ShippingOption {
  const option = SHIPPING_METHODS[method];
  return {
    shipping_rate_data: {
      type: "fixed_amount",
      display_name: option.label,
      fixed_amount: { amount: option.priceCents, currency: STORE_CURRENCY },
    },
  };
}

export type OrderTransition = "paid" | "processing" | "cancel" | "none";

export type SessionState = {
  status: Stripe.Checkout.Session.Status | null;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
  /** Status of the session's PaymentIntent, when it has one. */
  paymentIntentStatus: Stripe.PaymentIntent.Status | null;
};

/**
 * What a Checkout Session's current state means for its order. Decided from a session fetched from Stripe, never
 * from the event payload alone, so events arriving late or out of order lead to the same answer.
 */
export function orderTransition({ status, paymentStatus, paymentIntentStatus }: SessionState): OrderTransition {
  if (paymentStatus === "paid") return "paid";
  if (status === "expired") return "cancel";
  if (status === "complete") {
    // A delayed payment method (bank debit) completes the session first and succeeds or fails later.
    // A failed one leaves the PaymentIntent waiting for a new payment method, or cancelled.
    if (paymentIntentStatus === "requires_payment_method" || paymentIntentStatus === "canceled") return "cancel";
    return "processing";
  }
  return "none";
}

const CHECKOUT_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && value.length <= 255 && CHECKOUT_SESSION_ID.test(value);
}
