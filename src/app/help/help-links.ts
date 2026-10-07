import type { ContentPageLink } from "@/components/content-page";

/** Client-services topics, shown as the section nav on every help page and on /contact. */
export const HELP_LINKS: ContentPageLink[] = [
  { label: "FAQ", href: "/help" },
  { label: "Shipping", href: "/help/shipping" },
  { label: "Returns & exchanges", href: "/help/returns" },
  { label: "Size guide", href: "/help/size-guide" },
  { label: "Contact us", href: "/contact" },
];

export function helpNav(current: string) {
  return { label: "Client services", links: HELP_LINKS, current };
}
