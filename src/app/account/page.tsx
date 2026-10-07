import type { Metadata } from "next";
import { Suspense } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth-session";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <div className="shell-content section">
      <h1 className="heading-1 mb-8">My account</h1>
      <Suspense fallback={<div aria-hidden="true" className="h-40 animate-pulse bg-muted" />}>
        <AccountOverview />
      </Suspense>
    </div>
  );
}

async function AccountOverview() {
  const user = await requireUser("/account");

  return (
    <div className="flex flex-col gap-6">
      <p>
        Signed in as <span className="font-medium">{user.name}</span> ({user.email})
      </p>
      <form action={signOutAction}>
        <button type="submit" className="btn btn-secondary">
          Sign out
        </button>
      </form>
    </div>
  );
}
