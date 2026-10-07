import { describe, expect, it } from "vitest";
import { isOutOfStockError } from "./errors";

describe("isOutOfStockError", () => {
  it("recognises the stock check constraint on the error itself", () => {
    expect(isOutOfStockError({ constraint: "product_stock_quantity_non_negative" })).toBe(true);
  });

  it("looks through Drizzle's wrapper to the driver error", () => {
    const driverError = Object.assign(new Error("new row violates check constraint"), {
      code: "23514",
      constraint: "product_stock_quantity_non_negative",
    });
    const wrapped = Object.assign(new Error("Failed query: update product_stock ..."), { cause: driverError });
    expect(isOutOfStockError(wrapped)).toBe(true);
  });

  it("matches on the message when the driver omits the constraint field", () => {
    expect(isOutOfStockError(new Error('violates check constraint "product_stock_quantity_non_negative"'))).toBe(true);
  });

  it("ignores other failures, including other check constraints", () => {
    expect(isOutOfStockError(new Error("boom"))).toBe(false);
    expect(
      isOutOfStockError({ code: "23514", message: 'violates check constraint "orders_amounts_non_negative"' }),
    ).toBe(false);
    expect(isOutOfStockError(undefined)).toBe(false);
  });

  it("does not loop forever on a cyclic cause chain", () => {
    const error: { cause?: unknown } = {};
    error.cause = error;
    expect(isOutOfStockError(error)).toBe(false);
  });
});
