import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartLineItem } from "@/components/cart-line-item";
import { cartItemCount, cartSubtotalCents, hasPurchasableLines, lineIssue } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { getCart } from "@/lib/db/queries/cart";

export const metadata: Metadata = { title: "Shopping bag" };

export default function CartPage() {
  return (
    <div className="shell section">
      <h1 className="heading-1 mb-8 text-center">Shopping bag</h1>
      <Suspense fallback={<CartSkeleton />}>
        <CartContents />
      </Suspense>
    </div>
  );
}

async function CartContents() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-section text-center">
        <p className="heading-3">Your bag is empty</p>
        <p className="max-w-sm text-muted-foreground">When you add something, it will wait for you here.</p>
        <Link href="/collections/new-arrivals" className="btn btn-primary mt-2">
          Shop new arrivals
        </Link>
      </div>
    );
  }

  const count = cartItemCount(cart);
  const hasSoldOut = cart.lines.some((line) => lineIssue(line) === "unavailable");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16 xl:gap-24">
      <ul aria-label="Items in your bag" className="divide-y border-y">
        {cart.lines.map((line) => (
          <CartLineItem key={`${line.productId}:${line.size}`} line={line} />
        ))}
      </ul>

      <aside
        aria-labelledby="summary-title"
        className="h-fit bg-muted p-6 lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
      >
        <h2 id="summary-title" className="heading-3 mb-5">
          Order summary
        </h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt>
              Subtotal ({count} {count === 1 ? "item" : "items"})
            </dt>
            <dd className="price">{formatPrice(cartSubtotalCents(cart))}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Shipping</dt>
            <dd>Chosen at checkout</dd>
          </div>
        </dl>
        <p className="mt-5 text-muted-foreground">Complimentary standard delivery and free returns within 30 days.</p>

        {hasSoldOut && (
          <p role="status" className="mt-5 text-danger">
            Sold-out items won&apos;t be included in your order. Remove them to tidy your bag.
          </p>
        )}

        {hasPurchasableLines(cart) ? (
          <Link href="/checkout" className="btn btn-primary btn-lg btn-block mt-6">
            Checkout
          </Link>
        ) : (
          <button type="button" disabled className="btn btn-primary btn-lg btn-block mt-6">
            Checkout
          </button>
        )}
        <Link href="/collections/new-arrivals" className="link mt-5 block text-center">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your bag"
      className="grid animate-pulse gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16"
    >
      <div className="space-y-6">
        <div className="h-32 bg-muted" />
        <div className="h-32 bg-muted" />
      </div>
      <div className="h-64 bg-muted" />
    </div>
  );
}
