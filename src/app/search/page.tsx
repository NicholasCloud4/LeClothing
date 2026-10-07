import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { SearchForm } from "@/components/search-form";
import { getCategories } from "@/lib/db/queries/collections";
import { searchProducts } from "@/lib/db/queries/search";
import { normalizeSearchTerm, searchHref } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the LE Clothing collection.",
  // Result pages are thin, query-driven duplicates of collection pages.
  robots: { index: false, follow: true },
};

const POPULAR_SEARCHES = ["Wool", "Leather", "Jacket", "Cotton", "Silk"];

const FEATURED_COLLECTIONS = [
  { href: "/collections/new-arrivals", label: "New Arrivals" },
  { href: "/collections/essentials", label: "Essentials" },
  { href: "/collections/knitwear", label: "Knitwear" },
];

const GRID_SIZES = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";

// `searchParams` is read inside Suspense so the heading prerenders; results are cached per term.
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="shell pt-8 pb-section lg:pt-12">
      <h1 className="heading-1 mb-6 text-center">Search</h1>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchContent({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const term = normalizeSearchTerm((await searchParams).q);
  const results = term ? await searchProducts(term) : [];

  return (
    <>
      <SearchForm key={term ?? ""} defaultValue={term ?? ""} />

      <div className="mt-10">
        {!term ? (
          <EmptyPrompt title="What are you looking for?" text="Search by name, fabric, color or category." />
        ) : results.length > 0 ? (
          <>
            <p role="status" className="mb-8 border-y py-4 text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} for{" "}
              <span className="text-foreground">&ldquo;{term}&rdquo;</span>
            </p>
            <ul className="product-grid">
              {results.map((product) => (
                <li key={product.slug}>
                  <ProductCard product={product} sizes={GRID_SIZES} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyPrompt
            title={`No results for “${term}”`}
            text="Check the spelling, try a single word, or browse the collection instead."
            status
          />
        )}
      </div>
    </>
  );
}

async function EmptyPrompt({ title, text, status = false }: { title: string; text: string; status?: boolean }) {
  const categories = await getCategories();

  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      <div className="flex flex-col items-center gap-3" role={status ? "status" : undefined}>
        <p className="heading-3">{title}</p>
        <p className="max-w-sm text-muted-foreground">{text}</p>
      </div>

      <nav aria-label="Popular searches" className="flex flex-col items-center gap-3">
        <p className="eyebrow text-muted-foreground">Popular searches</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {POPULAR_SEARCHES.map((search) => (
            <li key={search}>
              <Link href={searchHref(search)} className="btn btn-secondary btn-sm">
                {search}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Shop collections" className="flex flex-col items-center gap-3">
        <p className="eyebrow text-muted-foreground">Or shop</p>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            ...FEATURED_COLLECTIONS,
            ...categories.map((category) => ({ href: `/collections/${category.slug}`, label: category.name })),
          ].map((collection) => (
            <li key={collection.href}>
              <Link href={collection.href} className="link">
                {collection.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading search results">
      <SearchForm />
      <ul className="product-grid mt-10 animate-pulse">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <div className="media-frame" />
          </li>
        ))}
      </ul>
    </div>
  );
}
