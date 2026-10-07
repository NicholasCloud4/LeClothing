import { describe, expect, it } from "vitest";
import { addressErrors, addressSchema, readAddressValues } from "./address";

const valid = {
  fullName: "Ada Lovelace",
  line1: "12 Analytical Way",
  line2: "",
  city: "London",
  region: "",
  postalCode: "N1 9GU",
  country: "GB",
  phone: "",
};

describe("addressSchema", () => {
  it("accepts a complete address and turns blank optionals into null", () => {
    const parsed = addressSchema.parse(valid);
    expect(parsed.line2).toBeNull();
    expect(parsed.region).toBeNull();
    expect(parsed.phone).toBeNull();
    expect(parsed.country).toBe("GB");
  });

  it("trims whitespace", () => {
    expect(addressSchema.parse({ ...valid, city: "  London  " }).city).toBe("London");
  });

  it("rejects unsupported countries", () => {
    expect(addressSchema.safeParse({ ...valid, country: "ZZ" }).success).toBe(false);
  });

  it("reports one message per missing field", () => {
    const result = addressSchema.safeParse({ ...valid, fullName: " ", line1: "", postalCode: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(addressErrors(result.error)).sort()).toEqual(["fullName", "line1", "postalCode"]);
    }
  });
});

describe("readAddressValues", () => {
  it("reads strings and defaults missing fields to empty", () => {
    const form = new FormData();
    form.set("fullName", "Ada");
    form.set("line1", "12 Way");
    const values = readAddressValues(form);
    expect(values.fullName).toBe("Ada");
    expect(values.city).toBe("");
  });
});
