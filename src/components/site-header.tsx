import Link from "next/link";
import { Suspense } from "react";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { MenuDrawer } from "@/components/menu-drawer";
import { getCartCount } from "@/lib/db/queries/cart";

const iconButton = "btn btn-ghost btn-icon btn-sm";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="shell header-bar">
        <div className="-ml-3 flex items-center gap-1">
          <MenuDrawer />
          <Link href="/search" className="btn btn-ghost btn-sm w-10 px-0 md:w-auto md:px-3">
            <SearchIcon />
            <span className="sr-only md:not-sr-only">Search</span>
          </Link>
        </div>

        {/* Negative right margin cancels the trailing letter-spacing so the wordmark centers optically. */}
        <Link
          href="/"
          className="-mr-[0.3em] font-display text-base tracking-[0.3em] whitespace-nowrap uppercase lg:text-xl"
        >
          LE Clothing
        </Link>

        <nav aria-label="Account" className="-mr-3 flex items-center gap-1">
          <Link href="/contact" className="link-reveal mr-3 hidden lg:inline">
            Contact us
          </Link>
          <Link href="/wishlist" className={`${iconButton} hidden sm:inline-flex`}>
            <HeartIcon />
            <span className="sr-only">Wishlist</span>
          </Link>
          <Link href="/account" className={iconButton}>
            <UserIcon />
            <span className="sr-only">Account</span>
          </Link>
          <Link href="/cart" className={`${iconButton} relative`}>
            <BagIcon />
            <span className="sr-only">Shopping bag</span>
            {/* Reads the cart cookie, so it streams in on its own and the rest of the header stays static. */}
            <Suspense fallback={null}>
              <CartBadge />
            </Suspense>
          </Link>
        </nav>
      </div>
    </header>
  );
}

async function CartBadge() {
  const count = await getCartCount();
  if (count === 0) return null;

  return (
    <>
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs text-primary-foreground"
      >
        {count}
      </span>
    </>
  );
}
