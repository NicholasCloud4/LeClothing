import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderCard } from "@/components/order-card";
import { requireUser } from "@/lib/auth-session";
import { getOrdersForUser } from "@/lib/db/queries/orders";

export const metadata: Metadata = { title: "My orders" };

export default function OrdersPage() {
  return (
    <Suspense
      fallback={<div aria-busy="true" aria-label="Loading your orders" className="h-64 animate-pulse bg-muted" />}
    >
      <OrderHistory />
    </Suspense>
  );
}

async function OrderHistory() {
  const user = await requireUser("/account/orders");
  const orders = await getOrdersForUser(user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-section text-center">
        <p className="heading-3">No orders yet</p>
        <p className="max-w-sm text-muted-foreground">When you place an order, you&apos;ll find it here.</p>
        <Link href="/collections/new-arrivals" className="btn btn-primary mt-2">
          Shop new arrivals
        </Link>
      </div>
    );
  }

  return (
    <ul aria-label="Your orders" className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.orderNumber}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}
