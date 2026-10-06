"use client";

import Link from "next/link";
import { useRef } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";

const primaryLinks = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Shoes", href: "/collections/shoes" },
  { label: "The Knitwear Edit", href: "/collections/knitwear" },
];

const secondaryLinks = [
  { label: "Find a boutique", href: "/stores" },
  { label: "Client services", href: "/contact" },
  { label: "My account", href: "/account" },
];

export function MenuDrawer() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm w-10 px-0 md:w-auto md:px-3"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <MenuIcon />
        <span className="sr-only md:not-sr-only">Menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Main menu"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-full max-w-md bg-background text-foreground transition-all transition-discrete duration-500 ease-luxe -translate-x-full open:translate-x-0 starting:open:-translate-x-full backdrop:bg-overlay"
        // A click whose target is the dialog itself landed on the backdrop.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-header items-center px-gutter">
            <button type="button" className="btn btn-ghost btn-sm -ml-3 px-3" onClick={close}>
              <CloseIcon />
              Close
            </button>
          </div>

          <nav aria-label="Main" className="flex-1 overflow-y-auto px-gutter py-8">
            <ul className="space-y-5">
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-reveal heading-2" onClick={close}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="space-y-3 border-t px-gutter py-8">
            {secondaryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-muted" onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
