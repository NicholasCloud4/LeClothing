// Search term handling for `/search`. Pure and client-safe; the query itself is in `@/lib/db/queries/search`.

/** Longer input is cut, not rejected: a pasted paragraph still searches its start. */
export const MAX_SEARCH_LENGTH = 80;

/** Words beyond this are ignored so a long query can't build an unbounded WHERE clause. */
export const MAX_SEARCH_WORDS = 6;

/** Results shown per search. The catalog is small, so there is no pagination. */
export const SEARCH_LIMIT = 48;

/**
 * Trims, collapses whitespace and caps the length. Accepts a raw `searchParams` value (a repeated `?q=` takes the
 * first). Returns `null` when there is nothing to search for.
 */
export function normalizeSearchTerm(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const term = raw.replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_LENGTH).trim();
  return term || null;
}

/**
 * Distinct words (runs of letters and digits) of a term, case-insensitively, capped at `MAX_SEARCH_WORDS`.
 * Punctuation separates words, as it does on the searched side, so "crew-neck" finds "Crew neck".
 */
export function searchWords(term: string): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const word of term.split(/[^\p{L}\p{N}]+/u)) {
    const key = word.toLowerCase();
    if (!word || seen.has(key)) continue;
    seen.add(key);
    words.push(word);
    if (words.length === MAX_SEARCH_WORDS) break;
  }
  return words;
}

/** Escapes LIKE wildcards (`%`, `_`) and the escape character itself (`\`, Postgres' default). */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * `ILIKE` pattern for text that contains a word starting with `word`, matched against the text with a leading
 * space and punctuation turned into spaces (see the query). So "men" finds "Men" and "menswear" but not
 * "Women" or "garment". Wildcards in `word` are taken literally.
 */
export function wordStartPattern(word: string): string {
  return `% ${escapeLike(word)}%`;
}

export function searchHref(term: string) {
  return `/search?${new URLSearchParams({ q: term })}`;
}
