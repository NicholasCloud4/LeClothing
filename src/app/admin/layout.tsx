import { signOutAction } from "@/lib/actions/auth";

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
      {children}
    </div>
  );
}
