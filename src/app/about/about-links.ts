import type { ContentPageLink } from "@/components/content-page";

/** "The house" pages, shown as the section nav on every about page and on /careers. */
export const ABOUT_LINKS: ContentPageLink[] = [
  { label: "Our story", href: "/about" },
  { label: "Craftsmanship", href: "/about/craft" },
  { label: "Sustainability", href: "/about/sustainability" },
  { label: "Careers", href: "/careers" },
];

export function aboutNav(current: string) {
  return { label: "The house", links: ABOUT_LINKS, current };
}

/**
 * Unsplash CDN URL for a photo already used elsewhere in the repo (`next.config.ts` only allows images.unsplash.com).
 * Same shape as the helper in `src/lib/content.ts`.
 */
export function unsplash(id: string, width: number, height: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces,entropy&w=${width}&h=${height}&q=80`;
}

/** `sizes` for an image spanning the content column next to the section nav (12rem nav + 4rem gap on md+). */
export const COLUMN_SIZES = "(min-width: 1280px) 64rem, (min-width: 768px) calc(100vw - 20rem), 100vw";

/** `sizes` for one of two images side by side in that column. */
export const HALF_COLUMN_SIZES = "(min-width: 1280px) 32rem, (min-width: 768px) calc(50vw - 10rem), 100vw";
