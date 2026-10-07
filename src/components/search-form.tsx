import Form from "next/form";
import { SearchIcon } from "@/components/icons";
import { MAX_SEARCH_LENGTH } from "@/lib/search";

/**
 * GET form to `/search?q=`. `next/form` navigates client-side and falls back to a plain form without JS.
 * Give it a `key` of the current term so the field resets to it after a navigation.
 */
export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form action="/search" role="search" className="mx-auto flex w-full max-w-xl gap-2">
      <label htmlFor="search-q" className="sr-only">
        Search products
      </label>
      <input
        id="search-q"
        type="search"
        name="q"
        defaultValue={defaultValue}
        maxLength={MAX_SEARCH_LENGTH}
        placeholder="Search coats, knitwear, leather…"
        autoComplete="off"
        enterKeyHint="search"
        className="input flex-1"
      />
      <button type="submit" className="btn btn-primary">
        <SearchIcon />
        <span className="sr-only sm:not-sr-only">Search</span>
      </button>
    </Form>
  );
}
