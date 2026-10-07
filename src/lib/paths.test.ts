import { describe, expect, it } from "vitest";
import { safeNextPath } from "./paths";

describe("safeNextPath", () => {
  it("allows same-site paths, including a query string", () => {
    expect(safeNextPath("/cart")).toBe("/cart");
    expect(safeNextPath("/account/orders?page=2")).toBe("/account/orders?page=2");
  });

  it.each(["//evil.example", "/\\evil.example", "https://evil.example", "javascript:alert(1)", "cart", ""])(
    "falls back for %j",
    (value) => {
      expect(safeNextPath(value)).toBe("/account");
    },
  );

  it("falls back for non-strings and honours a custom fallback", () => {
    expect(safeNextPath(undefined)).toBe("/account");
    expect(safeNextPath(["/cart"], "/")).toBe("/");
  });
});
