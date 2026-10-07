import type { ContentPageLink } from "@/components/content-page";

/** Legal pages, shown as the section nav on every page under /legal. */
export const LEGAL_LINKS: ContentPageLink[] = [
  { label: "Terms of sale", href: "/legal/terms" },
  { label: "Privacy policy", href: "/legal/privacy" },
  { label: "Cookie settings", href: "/legal/cookies" },
  { label: "Accessibility", href: "/legal/accessibility" },
];

export function legalNav(current: string) {
  return { label: "Legal", links: LEGAL_LINKS, current };
}
