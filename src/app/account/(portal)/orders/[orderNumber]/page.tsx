import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatOrderDate, OrderDetails } from "@/components/order-details";
import { requireUser } from "@/lib/auth-session";
import { getOrderForUser } from "@/lib/db/queries/orders";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/account/orders/[orderNumber]">) {
  return (
    <Suspense
      fallback={<div aria-busy="true" aria-label="Loading your order" className="h-96 animate-pulse bg-muted" />}
    >
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: Pick<PageProps<"/account/orders/[orderNumber]">, "params">) {
  const { orderNumber } = await params;
  const user = await requireUser(`/account/orders/${orderNumber}`);
  // Scoped to the signed-in user: someone else's order number is simply not found.
  const order = await getOrderForUser(user.id, orderNumber);
  if (!order) notFound();

  return (
    <>
      <Link href="/account/orders" className="link-muted mb-6 inline-block">
        ← All orders
      </Link>
      <header className="mb-8 space-y-1">
        <h2 className="heading-2">{order.orderNumber}</h2>
        <p className="text-muted-foreground">
          Placed {formatOrderDate(order.createdAt)} · {ORDER_STATUS_LABELS[order.status]}
        </p>
      </header>
      <OrderDetails order={order} />
    </>
  );
}
