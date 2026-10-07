import { describe, expect, it } from "vitest";
import { MAX_WISHLIST_ITEMS, parseWishlist, serializeWishlist, toggleWishlistSlug } from "./wishlist";

describe("parseWishlist", () => {
  it("reads a stored list", () => {
    expect(parseWishlist('["wool-coat","silk-scarf"]')).toEqual(["wool-coat", "silk-scarf"]);
  });

  it("treats missing or malformed values as empty", () => {
    expect(parseWishlist(null)).toEqual([]);
    expect(parseWishlist(undefined)).toEqual([]);
    expect(parseWishlist("")).toEqual([]);
    expect(parseWishlist("not json")).toEqual([]);
    expect(parseWishlist('{"wool-coat":true}')).toEqual([]);
    expect(parseWishlist('"wool-coat"')).toEqual([]);
  });

  it("drops non-string, empty, oversized and duplicate entries", () => {
    const raw = JSON.stringify(["a", 1, null, "", "a", "x".repeat(201), { slug: "b" }, "b"]);
    expect(parseWishlist(raw)).toEqual(["a", "b"]);
  });

  it("caps the number of entries", () => {
    const raw = JSON.stringify(Array.from({ length: MAX_WISHLIST_ITEMS + 20 }, (_, index) => `p-${index}`));
    const slugs = parseWishlist(raw);
    expect(slugs).toHaveLength(MAX_WISHLIST_ITEMS);
    expect(slugs[0]).toBe("p-0");
  });

  it("round-trips with serializeWishlist", () => {
    const slugs = ["wool-coat", "silk-scarf"];
    expect(parseWishlist(serializeWishlist(slugs))).toEqual(slugs);
  });
});

describe("toggleWishlistSlug", () => {
  it("saves a new slug first", () => {
    expect(toggleWishlistSlug(["a"], "b")).toEqual(["b", "a"]);
  });

  it("removes a saved slug", () => {
    expect(toggleWishlistSlug(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("does not mutate its input", () => {
    const slugs = ["a"];
    toggleWishlistSlug(slugs, "b");
    toggleWishlistSlug(slugs, "a");
    expect(slugs).toEqual(["a"]);
  });

  it("drops the oldest save when full", () => {
    const full = Array.from({ length: MAX_WISHLIST_ITEMS }, (_, index) => `p-${index}`);
    const next = toggleWishlistSlug(full, "new");
    expect(next).toHaveLength(MAX_WISHLIST_ITEMS);
    expect(next[0]).toBe("new");
    expect(next).not.toContain(`p-${MAX_WISHLIST_ITEMS - 1}`);
  });
});
