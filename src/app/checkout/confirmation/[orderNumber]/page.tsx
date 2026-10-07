import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatOrderDate, OrderDetails } from "@/components/order-details";
import { getSession } from "@/lib/auth-session";
import { getOrderForViewer } from "@/lib/db/queries/orders";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

// A private page: never indexed, never cached across visitors.
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

export default function ConfirmationPage({ params }: PageProps<"/checkout/confirmation/[orderNumber]">) {
  return (
    <div className="shell section">
      <Suspense
        fallback={<div aria-busy="true" aria-label="Loading your order" className="h-96 animate-pulse bg-muted" />}
      >
        <Confirmation params={params} />
      </Suspense>
    </div>
  );
}

async function Confirmation({ params }: Pick<PageProps<"/checkout/confirmation/[orderNumber]">, "params">) {
  const { orderNumber } = await params;
  const order = await getOrderForViewer(orderNumber);
  if (!order) notFound();

  const session = await getSession();

  return (
    <>
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <p className="eyebrow text-muted-foreground">{ORDER_STATUS_LABELS[order.status]}</p>
        <h1 className="heading-1">Thank you for your order</h1>
        <p className="text-muted-foreground">
          Order <span className="text-foreground">{order.orderNumber}</span> · {formatOrderDate(order.createdAt)}
        </p>
        <p className="max-w-lg text-muted-foreground">
          We&apos;ll send updates to {order.email}. Payment hasn&apos;t been collected yet, so nothing has been charged.
        </p>
      </header>

      <OrderDetails order={order} />

      <div className="mt-12 flex flex-col items-center gap-3 border-t pt-10 text-center sm:flex-row sm:justify-center">
        {session ? (
          <Link href="/account/orders" className="btn btn-secondary">
            View my orders
          </Link>
        ) : (
          <Link href="/account/sign-up" className="btn btn-secondary">
            Create an account
          </Link>
        )}
        <Link href="/collections/new-arrivals" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </>
  );
}
