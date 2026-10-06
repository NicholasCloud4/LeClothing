import Link from "next/link";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { MenuDrawer } from "@/components/menu-drawer";

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
          <Link href="/cart" className={iconButton}>
            <BagIcon />
            <span className="sr-only">Shopping bag</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
