// Collection page options. Client-safe: the sort control and the page both import these.

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type CollectionSort = (typeof SORT_OPTIONS)[number]["value"];

/** Slug of the virtual collection of the newest products. */
export const NEW_ARRIVALS_SLUG = "new-arrivals";

export function parseSort(value: unknown): CollectionSort | undefined {
  return SORT_OPTIONS.find((option) => option.value === value)?.value;
}
