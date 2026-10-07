import { Suspense } from "react";
import { TabNav, type TabLink } from "@/components/tab-nav";
import { signOutAction } from "@/lib/actions/auth";

const links: TabLink[] = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
];

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="shell-content section">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h1 className="heading-1">My account</h1>
        <form action={signOutAction}>
          <button type="submit" className="link-muted">
            Sign out
          </button>
        </form>
      </div>
      {/* usePathname() is request data on dynamic routes, so the tabs resolve inside Suspense. */}
      <Suspense fallback={<div aria-hidden="true" className="h-12 border-b" />}>
        <TabNav label="Account" links={links} />
      </Suspense>
      <div className="pt-10">{children}</div>
    </div>
  );
}
