import { describe, expect, it } from "vitest";
import {
  deltaFieldName,
  formatDollars,
  formatImageLines,
  isAllowedImageUrl,
  parseDollars,
  productErrors,
  productSchema,
  readProductValues,
  readStockChanges,
} from "./product-form";

const IMAGE = "https://images.unsplash.com/photo-123?w=800";

const valid = {
  name: "Wool Overcoat",
  categoryId: "2",
  price: "1,250.50",
  color: "Camel",
  colorCount: "3",
  description: "Double-faced wool.",
  details: "100% wool\n\n  Dry clean only  \n",
  images: `${IMAGE} | Front view\n${IMAGE}&crop=1 | Detail`,
  isNew: "on",
};

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("parseDollars / formatDollars", () => {
  it("parses whole and decimal amounts into cents", () => {
    expect(parseDollars("125")).toBe(12500);
    expect(parseDollars("125.5")).toBe(12550);
    expect(parseDollars(" $1,250.05 ")).toBe(125005);
    expect(parseDollars("0")).toBe(0);
  });

  it("rejects negatives, extra decimals and junk", () => {
    for (const value of ["-5", "1.234", "abc", "", "1e3", "1234567"]) expect(parseDollars(value)).toBeNull();
  });

  it("formats cents for the price field and round-trips", () => {
    expect(formatDollars(12500)).toBe("125");
    expect(formatDollars(12505)).toBe("125.05");
    expect(parseDollars(formatDollars(98765))).toBe(98765);
  });
});

describe("productSchema", () => {
  it("accepts a complete product", () => {
    const parsed = productSchema.parse(valid);
    expect(parsed.priceCents).toBe(125050);
    expect(parsed.categoryId).toBe(2);
    expect(parsed.colorCount).toBe(3);
    expect(parsed.details).toEqual(["100% wool", "Dry clean only"]);
    expect(parsed.images).toEqual([
      { url: IMAGE, alt: "Front view" },
      { url: `${IMAGE}&crop=1`, alt: "Detail" },
    ]);
    expect(parsed.isNew).toBe(true);
    expect("price" in parsed).toBe(false);
  });

  it("treats an unchecked box as not new", () => {
    expect(productSchema.parse({ ...valid, isNew: "" }).isNew).toBe(false);
  });

  it("requires at least one image with alt text on an allowed host", () => {
    const errors = (images: string) => productErrors(productSchema.safeParse({ ...valid, images }).error!).images;
    expect(errors("")).toMatch(/at least one/);
    expect(errors(IMAGE)).toMatch(/Line 1: add alt text/);
    expect(errors(`${IMAGE} | ok\nhttps://example.com/a.jpg | Bad host`)).toMatch(/Line 2: use an https/);
    expect(errors("http://images.unsplash.com/a | Not https")).toMatch(/Line 1/);
  });

  it("reports per-field errors", () => {
    const result = productSchema.safeParse({ ...valid, name: " ", price: "12.345", categoryId: "", colorCount: "0" });
    expect(productErrors(result.error!)).toEqual({
      name: "Enter a name.",
      price: "Enter a price like 125 or 125.50.",
      categoryId: "Choose a category.",
      colorCount: "Enter at least 1.",
    });
  });

  it("reads every field as a string, missing ones blank", () => {
    expect(readProductValues(form({ name: "Coat" }))).toMatchObject({ name: "Coat", isNew: "", images: "" });
  });
});

describe("image helpers", () => {
  it("only allows https on the configured hosts", () => {
    expect(isAllowedImageUrl(IMAGE)).toBe(true);
    expect(isAllowedImageUrl("https://evil.example/images.unsplash.com")).toBe(false);
    expect(isAllowedImageUrl("not a url")).toBe(false);
  });

  it("formats images back into the textarea form", () => {
    const images = productSchema.parse(valid).images;
    expect(productSchema.parse({ ...valid, images: formatImageLines(images) }).images).toEqual(images);
  });
});

describe("readStockChanges", () => {
  const sizes = ["S", "M", "L"];

  it("collects non-zero changes and ignores blanks", () => {
    const result = readStockChanges(
      form({ [deltaFieldName("S")]: "5", [deltaFieldName("M")]: "-2", [deltaFieldName("L")]: "0" }),
      sizes,
    );
    expect(result).toMatchObject({
      ok: true,
      changes: [
        { size: "S", delta: 5 },
        { size: "M", delta: -2 },
      ],
      newSize: null,
    });
  });

  it("ignores fields for sizes the product doesn't have", () => {
    const result = readStockChanges(form({ [deltaFieldName("XXL")]: "9", [deltaFieldName("S")]: "+1" }), sizes);
    expect(result).toMatchObject({ ok: true, changes: [{ size: "S", delta: 1 }] });
  });

  it("asks for a change when nothing was entered", () => {
    expect(readStockChanges(form({}), sizes)).toMatchObject({
      ok: false,
      error: expect.stringMatching(/at least one/),
    });
  });

  it("rejects fractions and out-of-range numbers, echoing the values", () => {
    const result = readStockChanges(
      form({ [deltaFieldName("S")]: "1.5", [deltaFieldName("M")]: "-20000", [deltaFieldName("L")]: "3" }),
      sizes,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors?.deltas ?? {})).toEqual(["S", "M"]);
    expect(result.values.deltas).toEqual({ S: "1.5", M: "-20000", L: "3" });
  });

  it("adds a new size with a starting quantity", () => {
    const result = readStockChanges(form({ newSize: " XL ", newQuantity: "4" }), sizes);
    expect(result).toMatchObject({ ok: true, changes: [], newSize: { size: "XL", quantity: 4 } });
    expect(readStockChanges(form({ newSize: "XS" }), sizes)).toMatchObject({ newSize: { size: "XS", quantity: 0 } });
  });

  it("rejects a duplicate size (any case), a nameless quantity and a negative start", () => {
    expect(readStockChanges(form({ newSize: "m" }), sizes)).toMatchObject({
      ok: false,
      fieldErrors: { newSize: expect.stringMatching(/already exists/) },
    });
    expect(readStockChanges(form({ newQuantity: "3" }), sizes)).toMatchObject({
      ok: false,
      fieldErrors: { newSize: "Name the new size." },
    });
    expect(readStockChanges(form({ newSize: "XL", newQuantity: "-1" }), sizes)).toMatchObject({
      ok: false,
      fieldErrors: { newQuantity: expect.any(String) },
    });
  });
});
