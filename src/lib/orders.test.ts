import { describe, expect, it } from "vitest";
import { generateOrderNumber, isOrderNumber } from "./orders";

describe("generateOrderNumber", () => {
  it("produces LE- plus ten unambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOrderNumber()).toMatch(/^LE-[0-9A-HJKMNP-TV-Z]{10}$/);
    }
  });

  it("does not repeat", () => {
    const numbers = new Set(Array.from({ length: 1000 }, generateOrderNumber));
    expect(numbers.size).toBe(1000);
  });

  it("round-trips through isOrderNumber", () => {
    expect(isOrderNumber(generateOrderNumber())).toBe(true);
  });
});

describe("isOrderNumber", () => {
  it.each([
    ["too short", "LE-ABC"],
    ["lowercase", "le-7k3f9q2mxa"],
    ["look-alike letters", "LE-ILOU000000"],
    ["wrong prefix", "XX-7K3F9Q2MXA"],
    ["injection attempt", "LE-7K3F9Q2MXA' OR 1=1"],
    ["not a string", 12345],
  ])("rejects %s", (_name, value) => {
    expect(isOrderNumber(value)).toBe(false);
  });
});
