import { describe, expect, it } from "vitest";
import { formatPrice, getStockState, LOW_STOCK_THRESHOLD } from "./catalog";

describe("formatPrice", () => {
  it("drops cents on whole-dollar amounts", () => {
    expect(formatPrice(145000)).toBe("$1,450");
    expect(formatPrice(0)).toBe("$0");
  });

  it("keeps cents when there are any, so totals are never rounded", () => {
    expect(formatPrice(145050)).toBe("$1,450.50");
    expect(formatPrice(1999)).toBe("$19.99");
  });
});

describe("getStockState", () => {
  it("classifies units on hand", () => {
    expect(getStockState(0)).toBe("out_of_stock");
    expect(getStockState(-1)).toBe("out_of_stock");
    expect(getStockState(1)).toBe("low_stock");
    expect(getStockState(LOW_STOCK_THRESHOLD)).toBe("low_stock");
    expect(getStockState(LOW_STOCK_THRESHOLD + 1)).toBe("in_stock");
  });
});
