import { describe, expect, it } from "vitest";
import {
  escapeLike,
  MAX_SEARCH_LENGTH,
  MAX_SEARCH_WORDS,
  normalizeSearchTerm,
  searchHref,
  searchWords,
  wordStartPattern,
} from "./search";

describe("normalizeSearchTerm", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeSearchTerm("  wool \t  coat\n")).toBe("wool coat");
  });

  it("treats empty, blank and non-string values as no search", () => {
    expect(normalizeSearchTerm("")).toBeNull();
    expect(normalizeSearchTerm("   ")).toBeNull();
    expect(normalizeSearchTerm(undefined)).toBeNull();
    expect(normalizeSearchTerm(42)).toBeNull();
    expect(normalizeSearchTerm([])).toBeNull();
  });

  it("takes the first value of a repeated parameter", () => {
    expect(normalizeSearchTerm(["knit", "coat"])).toBe("knit");
  });

  it("caps the length without leaving trailing whitespace", () => {
    const long = `${"a".repeat(MAX_SEARCH_LENGTH - 1)} bcdef`;
    const term = normalizeSearchTerm(long);
    expect(term).toBe("a".repeat(MAX_SEARCH_LENGTH - 1));
    expect(normalizeSearchTerm("x".repeat(500))).toHaveLength(MAX_SEARCH_LENGTH);
  });

  it("is idempotent", () => {
    const once = normalizeSearchTerm("  Cashmere   Scarf ");
    expect(normalizeSearchTerm(once)).toBe(once);
  });
});

describe("searchWords", () => {
  it("splits on spaces and drops case-insensitive duplicates", () => {
    expect(searchWords("Wool coat wool")).toEqual(["Wool", "coat"]);
  });

  it("splits on punctuation, so wildcards and symbols never become words", () => {
    expect(searchWords("crew-neck, t-shirt")).toEqual(["crew", "neck", "t", "shirt"]);
    expect(searchWords("%")).toEqual([]);
    expect(searchWords("_ \\ %")).toEqual([]);
    expect(searchWords("100% café")).toEqual(["100", "café"]);
  });

  it("caps the number of words", () => {
    const words = searchWords("a b c d e f g h i j");
    expect(words).toHaveLength(MAX_SEARCH_WORDS);
    expect(words[0]).toBe("a");
  });
});

describe("escapeLike", () => {
  it("escapes LIKE wildcards and backslashes", () => {
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("back\\slash")).toBe("back\\\\slash");
    expect(escapeLike("%_\\")).toBe("\\%\\_\\\\");
  });

  it("leaves ordinary text alone", () => {
    expect(escapeLike("merino crew-neck")).toBe("merino crew-neck");
  });
});

describe("wordStartPattern", () => {
  it("matches the word at the start of any word of the space-prefixed text", () => {
    expect(wordStartPattern("wool")).toBe("% wool%");
  });

  it("escapes wildcards", () => {
    expect(wordStartPattern("a_b%")).toBe("% a\\_b\\%%");
  });
});

describe("searchHref", () => {
  it("encodes the term", () => {
    expect(searchHref("wool & silk")).toBe("/search?q=wool+%26+silk");
  });
});
