import { describe, expect, it } from "vitest";
import { SHIPPING_METHODS } from "./cart";
import {
  checkoutLineItems,
  isCheckoutSessionId,
  orderTransition,
  shippingOption,
  STORE_CURRENCY,
  type SessionState,
} from "./payments";

const item = {
  name: "Belted Wool Coat",
  color: "Camel",
  size: "M",
  imageUrl: "https://images.unsplash.com/photo-1",
  unitPriceCents: 42_000,
  quantity: 2,
};

describe("checkoutLineItems", () => {
  it("sends our unit price in cents and the quantity from the order", () => {
    const [line] = checkoutLineItems([item]);
    expect(line.quantity).toBe(2);
    expect(line.price_data).toMatchObject({
      currency: STORE_CURRENCY,
      unit_amount: 42_000,
      product_data: { name: "Belted Wool Coat", description: "Camel, size M", images: [item.imageUrl] },
    });
  });

  it("leaves out images Stripe can't fetch", () => {
    for (const line of checkoutLineItems([
      { ...item, imageUrl: null },
      { ...item, imageUrl: "/local.jpg" },
    ])) {
      expect(line.price_data?.product_data).not.toHaveProperty("images");
    }
  });

  it("never names a Stripe price or payment method types", () => {
    for (const line of checkoutLineItems([item])) {
      expect(line).not.toHaveProperty("price");
      expect(JSON.stringify(line)).not.toContain("payment_method_types");
    }
  });
});

describe("shippingOption", () => {
  it.each(Object.keys(SHIPPING_METHODS) as (keyof typeof SHIPPING_METHODS)[])("prices %s from our table", (id) => {
    expect(shippingOption(id).shipping_rate_data).toEqual({
      type: "fixed_amount",
      display_name: SHIPPING_METHODS[id].label,
      fixed_amount: { amount: SHIPPING_METHODS[id].priceCents, currency: STORE_CURRENCY },
    });
  });
});

describe("orderTransition", () => {
  const state = (overrides: Partial<SessionState>): SessionState => ({
    status: "open",
    paymentStatus: "unpaid",
    paymentIntentStatus: null,
    ...overrides,
  });

  it("is paid only when Stripe says the payment is paid", () => {
    expect(
      orderTransition(state({ status: "complete", paymentStatus: "paid", paymentIntentStatus: "succeeded" })),
    ).toBe("paid");
  });

  it("does nothing while the session is still open", () => {
    expect(orderTransition(state({}))).toBe("none");
    expect(orderTransition(state({ paymentIntentStatus: "requires_payment_method" }))).toBe("none");
  });

  it("cancels an expired session", () => {
    expect(orderTransition(state({ status: "expired" }))).toBe("cancel");
  });

  it("waits on a completed delayed payment, and cancels when it fails", () => {
    expect(orderTransition(state({ status: "complete", paymentIntentStatus: "processing" }))).toBe("processing");
    expect(orderTransition(state({ status: "complete", paymentIntentStatus: "requires_payment_method" }))).toBe(
      "cancel",
    );
    expect(orderTransition(state({ status: "complete", paymentIntentStatus: "canceled" }))).toBe("cancel");
  });
});

describe("isCheckoutSessionId", () => {
  it("accepts Stripe session ids only", () => {
    expect(isCheckoutSessionId("cs_test_a1B2c3")).toBe(true);
    expect(isCheckoutSessionId("cs_live_a1B2c3")).toBe(true);
    expect(isCheckoutSessionId("pi_test_a1B2c3")).toBe(false);
    expect(isCheckoutSessionId("cs_test_../../x")).toBe(false);
    expect(isCheckoutSessionId(["cs_test_a1"])).toBe(false);
  });
});
