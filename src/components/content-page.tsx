import Link from "next/link";
import type { ReactNode } from "react";

export type ContentPageLink = { label: string; href: string };

type ContentPageProps = {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  /** Sibling pages in the same section (e.g. all help topics). The link matching `current` is marked as current. */
  nav?: { label: string; links: ContentPageLink[]; current: string };
  /** Long-form copy. Wrap it in `.prose-content`, or pass your own layout. */
  children: ReactNode;
};

/**
 * Shell for static editorial pages (help, about, legal, contact). Server component with no request data, so pages
 * built on it prerender fully.
 */
export function ContentPage({ eyebrow, title, intro, nav, children }: ContentPageProps) {
  return (
    <div className="shell-content section">
      <header className="mb-12 max-w-3xl md:mb-16">
        {eyebrow && <p className="eyebrow mb-4 text-muted-foreground">{eyebrow}</p>}
        <h1 className="heading-1">{title}</h1>
        {intro && <div className="mt-5 text-lg text-muted-foreground">{intro}</div>}
      </header>
      {nav ? (
        // minmax(0, 1fr) and min-w-0 let wide content (size tables) scroll inside its own box instead of widening the page.
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-16">
          <nav aria-label={nav.label} className="md:sticky md:top-28 md:self-start">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 md:flex-col">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.href === nav.current ? "page" : undefined}
                    className="link-reveal text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
