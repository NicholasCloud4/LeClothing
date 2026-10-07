import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderCard } from "@/components/order-card";
import { PasswordForm, ProfileForm } from "@/components/profile-forms";
import { requireUser } from "@/lib/auth-session";
import { getOrdersForUser } from "@/lib/db/queries/orders";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <Suspense
      fallback={<div aria-busy="true" aria-label="Loading your account" className="h-64 animate-pulse bg-muted" />}
    >
      <AccountOverview searchParams={searchParams} />
    </Suspense>
  );
}

async function AccountOverview({ searchParams }: Pick<PageProps<"/account">, "searchParams">) {
  const user = await requireUser("/account");
  const { updated } = await searchParams;
  const recentOrders = await getOrdersForUser(user.id, 3);

  return (
    <div className="flex flex-col gap-14">
      {updated === "password" && (
        <p role="status" className="text-success">
          Your password has been updated. Other devices have been signed out.
        </p>
      )}

      <section aria-labelledby="recent-orders-title">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="recent-orders-title" className="heading-3">
            Recent orders
          </h2>
          {recentOrders.length > 0 && (
            <Link href="/account/orders" className="link">
              View all
            </Link>
          )}
        </div>
        {recentOrders.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <li key={order.orderNumber}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            You haven&apos;t placed an order yet.{" "}
            <Link href="/collections/new-arrivals" className="link">
              Start shopping
            </Link>
          </p>
        )}
      </section>

      <section aria-labelledby="profile-title">
        <h2 id="profile-title" className="heading-3 mb-5">
          Your details
        </h2>
        <ProfileForm name={user.name} email={user.email} />
      </section>

      <section aria-labelledby="password-title">
        <h2 id="password-title" className="heading-3 mb-5">
          Password
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
