"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type TabLink = { label: string; href: string };

/**
 * Section tabs (account, admin). The first link is the section's index page and is only active on an exact match.
 * Uses `usePathname()`, so render it inside `<Suspense>`.
 */
export function TabNav({ label, links }: { label: string; links: TabLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="border-b">
      <ul className="-mb-px flex gap-6">
        {links.map((link, index) => {
          const active = index === 0 ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block border-b py-3 transition-colors ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
