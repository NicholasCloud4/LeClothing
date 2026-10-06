import Link from "next/link";

const columns = [
  {
    title: "Client Services",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Returns & exchanges", href: "/help/returns" },
      { label: "FAQ", href: "/help" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Craftsmanship", href: "/about/craft" },
      { label: "Sustainability", href: "/about/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of sale", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Cookie settings", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
  {
    title: "Follow Us",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "TikTok", href: "https://tiktok.com" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="surface-inverse">
      <div className="shell section-tight">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-6 md:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="eyebrow mb-5 font-sans">{column.title}</h2>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="link-muted">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t pt-10 text-center">
          <Link href="/" className="-mr-[0.3em] font-display text-2xl tracking-[0.3em] uppercase">
            LE Clothing
          </Link>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:gap-6">
            <span>United States (USD $)</span>
            <span>© LE Clothing. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
