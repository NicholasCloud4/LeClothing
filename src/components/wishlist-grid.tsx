"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";
import { useHydrated, useWishlist } from "@/lib/wishlist";

const GRID_SIZES = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";

/**
 * Shows the saved products, most recently saved first. `products` is the whole catalog; saved slugs that no
 * longer match a product are skipped. Unsaving from a card removes it here immediately.
 */
export function WishlistGrid({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const slugs = useWishlist();

  // The server and the hydration pass can't see localStorage: show a placeholder, not a false "empty".
  if (!hydrated) return <WishlistSkeleton />;

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const saved = slugs.flatMap((slug) => bySlug.get(slug) ?? []);

  return (
    <>
      <p role="status" className="mb-8 border-y py-4 text-muted-foreground">
        {saved.length} saved {saved.length === 1 ? "piece" : "pieces"}
      </p>
      {saved.length > 0 ? (
        <ul className="product-grid">
          {saved.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} sizes={GRID_SIZES} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 py-section text-center">
          <p className="heading-3">Your wishlist is empty</p>
          <p className="max-w-sm text-muted-foreground">Tap the heart on any piece to save it here for later.</p>
          <Link href="/collections/new-arrivals" className="btn btn-secondary">
            Shop new arrivals
          </Link>
        </div>
      )}
    </>
  );
}

function WishlistSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading wishlist" className="animate-pulse">
      <div className="mb-8 h-14 border-y" />
      <ul className="product-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <div className="media-frame" />
          </li>
        ))}
      </ul>
    </div>
  );
}
