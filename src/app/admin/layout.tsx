import { Suspense } from "react";
import { TabNav, type TabLink } from "@/components/tab-nav";
import { signOutAction } from "@/lib/actions/auth";

const links: TabLink[] = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
];

// No auth check here: layouts don't re-render on client navigation. Every admin page calls `requireAdmin()`.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="shell-content section">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h1 className="heading-1">Admin</h1>
        <form action={signOutAction}>
          <button type="submit" className="link-muted">
            Sign out
          </button>
        </form>
      </div>
      <Suspense fallback={<div aria-hidden="true" className="h-12 border-b" />}>
        <TabNav label="Admin" links={links} />
      </Suspense>
      <div className="pt-10">{children}</div>
    </div>
  );
}
