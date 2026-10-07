import type { Metadata } from "next";
import { WishlistGrid } from "@/components/wishlist-grid";
import { getAllProducts } from "@/lib/db/queries/catalog";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Pieces you've saved for later.",
  robots: { index: false, follow: true },
};

// The wishlist lives in this browser's localStorage, so the page prerenders with the (cached) catalog and the
// client picks out the saved pieces.
export default async function WishlistPage() {
  const products = await getAllProducts();

  return (
    <div className="shell pt-8 pb-section lg:pt-12">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <h1 className="heading-1">Wishlist</h1>
        <p className="max-w-xl text-muted-foreground">Pieces you&apos;ve saved in this browser.</p>
      </header>
      <WishlistGrid products={products} />
    </div>
  );
}
