import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { parseSort, SORT_OPTIONS, type CollectionSort } from "@/lib/collections";
import { getCollection, getCollectionSlugs } from "@/lib/db/queries/collections";

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const collection = await getCollection((await params).slug);
  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.description ?? `Shop ${collection.title} at LE Clothing.`,
  };
}

// `params` and `searchParams` are read inside Suspense so the shell prerenders; the product query is cached
// per slug, sort and filter.
export default function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CollectionContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function collectionHref(slug: string, sort: CollectionSort | undefined, inStockOnly: boolean) {
  const query = new URLSearchParams();
  if (sort) query.set("sort", sort);
  if (inStockOnly) query.set("inStock", "1");
  const search = query.toString();
  return `/collections/${slug}${search ? `?${search}` : ""}`;
}

async function CollectionContent({
  params,
  searchParams,
}: Pick<PageProps<"/collections/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const query = await searchParams;
  const sort = parseSort(query.sort);
  const inStockOnly = query.inStock === "1";

  const collection = await getCollection(slug, { sort, inStockOnly });
  if (!collection) notFound();

  const activeSort = sort ?? collection.defaultSort;
  // Featured order only exists for curated collections.
  const sortOptions = SORT_OPTIONS.filter((option) => option.value !== "featured" || collection.kind === "curated");
  const filtered = sort !== undefined || inStockOnly;

  return (
    <>
      <nav aria-label="Breadcrumb" className="shell pt-4 lg:pt-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="link-muted">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {collection.title}
          </li>
        </ol>
      </nav>

      <div className="shell pt-8 pb-section">
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <h1 className="heading-1">{collection.title}</h1>
          {collection.description && <p className="max-w-xl text-muted-foreground">{collection.description}</p>}
        </header>

        <div className="mb-8 flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="text-muted-foreground">
            {collection.products.length} {collection.products.length === 1 ? "style" : "styles"}
          </p>
          <nav aria-label="Sort and filter" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <li className="text-muted-foreground">Sort:</li>
              {sortOptions.map((option) => {
                const active = option.value === activeSort;
                return (
                  <li key={option.value}>
                    <Link
                      href={collectionHref(slug, option.value === collection.defaultSort ? undefined : option.value, inStockOnly)}
                      aria-current={active ? "true" : undefined}
                      className={active ? "link" : "link-muted"}
                    >
                      {option.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={collectionHref(slug, sort, !inStockOnly)}
              aria-pressed={inStockOnly}
              className={inStockOnly ? "link" : "link-muted"}
            >
              {inStockOnly ? "Showing in stock only" : "In stock only"}
            </Link>
          </nav>
        </div>

        {collection.products.length > 0 ? (
          <ul className="product-grid">
            {collection.products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 py-section text-center">
            <p className="heading-3">{filtered ? "Nothing matches those filters" : "New pieces are on their way"}</p>
            <p className="max-w-sm text-muted-foreground">
              {filtered
                ? "Try a different sort or show everything in this collection."
                : "We have nothing in this collection yet. Have a look at what's just arrived."}
            </p>
            <Link
              href={filtered ? `/collections/${slug}` : "/collections/new-arrivals"}
              className="btn btn-secondary"
            >
              {filtered ? "Clear filters" : "Shop new arrivals"}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function CollectionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading collection" className="animate-pulse">
      <div className="shell pt-4 lg:pt-6">
        <div className="h-4 w-40 bg-muted" />
      </div>
      <div className="shell pt-8 pb-section">
        <div className="mx-auto mb-8 h-10 w-64 bg-muted" />
        <div className="mb-8 h-12 border-y" />
        <ul className="product-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <div className="media-frame" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
