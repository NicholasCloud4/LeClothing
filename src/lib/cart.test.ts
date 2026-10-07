import { describe, expect, it } from "vitest";
import {
  cartItemCount,
  cartSubtotalCents,
  hasPurchasableLines,
  lineIssue,
  lineTotalCents,
  MAX_LINE_QUANTITY,
  purchasableQuantity,
  shippingCents,
  type CartLine,
} from "./cart";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    productId: 1,
    slug: "belted-wool-coat",
    name: "Belted Wool Coat",
    color: "Camel",
    size: "M",
    quantity: 1,
    available: 5,
    unitPriceCents: 145000,
    image: null,
    ...overrides,
  };
}

describe("purchasableQuantity", () => {
  it("is the saved quantity when stock allows", () => {
    expect(purchasableQuantity(line({ quantity: 2, available: 5 }))).toBe(2);
  });

  it("is capped by stock", () => {
    expect(purchasableQuantity(line({ quantity: 4, available: 2 }))).toBe(2);
  });

  it("is zero when sold out", () => {
    expect(purchasableQuantity(line({ quantity: 3, available: 0 }))).toBe(0);
  });

  it("is capped by the per-line maximum", () => {
    expect(purchasableQuantity(line({ quantity: 50, available: 100 }))).toBe(MAX_LINE_QUANTITY);
  });
});

describe("lineIssue", () => {
  it("flags sold-out sizes", () => {
    expect(lineIssue(line({ available: 0 }))).toBe("unavailable");
  });

  it("flags quantities above stock as reduced", () => {
    expect(lineIssue(line({ quantity: 3, available: 2 }))).toBe("reduced");
  });

  it("has no issue when stock covers the quantity", () => {
    expect(lineIssue(line({ quantity: 2, available: 2 }))).toBeNull();
  });
});

describe("cart totals", () => {
  const cart = {
    lines: [
      line({ quantity: 2, unitPriceCents: 12000 }),
      line({ productId: 2, size: "S", quantity: 3, available: 1, unitPriceCents: 52000 }),
      line({ productId: 3, quantity: 1, available: 0, unitPriceCents: 99900 }),
    ],
  };

  it("prices each line at the purchasable quantity", () => {
    expect(lineTotalCents(cart.lines[0])).toBe(24000);
    expect(lineTotalCents(cart.lines[1])).toBe(52000);
    expect(lineTotalCents(cart.lines[2])).toBe(0);
  });

  it("sums only what can actually be bought", () => {
    expect(cartSubtotalCents(cart)).toBe(76000);
    expect(cartItemCount(cart)).toBe(3);
  });

  it("reports whether anything can be bought", () => {
    expect(hasPurchasableLines(cart)).toBe(true);
    expect(hasPurchasableLines({ lines: [line({ available: 0 })] })).toBe(false);
    expect(hasPurchasableLines({ lines: [] })).toBe(false);
  });
});

describe("shippingCents", () => {
  it("is free for standard and a flat fee for express", () => {
    expect(shippingCents("standard")).toBe(0);
    expect(shippingCents("express")).toBe(2500);
  });
});
