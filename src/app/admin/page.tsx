import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-session";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Loading" className="h-24 animate-pulse bg-muted" />}>
      <AdminOverview />
    </Suspense>
  );
}

async function AdminOverview() {
  const user = await requireAdmin("/admin");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">
        Signed in as {user.name} ({user.email}).
      </p>
      <Link href="/admin/products" className="link self-start">
        Edit products and stock
      </Link>
    </div>
  );
}
