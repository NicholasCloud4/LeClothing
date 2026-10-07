import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatOrderDate, OrderDetails } from "@/components/order-details";
import { getSession } from "@/lib/auth-session";
import { reconcileCheckoutSession } from "@/lib/checkout-reconcile";
import { getOrderForViewer } from "@/lib/db/queries/orders";
import { isOrderNumber, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { isCheckoutSessionId } from "@/lib/payments";

// A private page: never indexed, never cached across visitors.
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

type ConfirmationProps = PageProps<"/checkout/confirmation/[orderNumber]">;

export default function ConfirmationPage({ params, searchParams }: ConfirmationProps) {
  return (
    <div className="shell section">
      <Suspense
        fallback={<div aria-busy="true" aria-label="Loading your order" className="h-96 animate-pulse bg-muted" />}
      >
        <Confirmation params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const HEADINGS: Record<OrderStatus, { title: string; body: (email: string) => string }> = {
  pending: {
    title: "Confirming your payment",
    body: (email) =>
      `We're waiting for the payment to be confirmed. Refresh this page in a moment; we'll also email ${email}.`,
  },
  paid: {
    title: "Thank you for your order",
    body: (email) => `Your payment has been received. We'll send updates to ${email}.`,
  },
  fulfilled: {
    title: "Thank you for your order",
    body: (email) => `Your order is on its way. We've sent the details to ${email}.`,
  },
  cancelled: {
    title: "This order was cancelled",
    body: () => "The payment wasn't completed, so nothing was charged and your items are back in stock.",
  },
};

async function Confirmation({ params, searchParams }: ConfirmationProps) {
  const { orderNumber } = await params;
  const { session_id: sessionId } = await searchParams;

  // Stripe sends the shopper here with the session id. The id is only a pointer: the session is re-read from
  // Stripe, which normally just confirms what the webhook already recorded. A product page refreshing stock
  // late is acceptable here, so no tag is expired from a render.
  if (isOrderNumber(orderNumber) && isCheckoutSessionId(sessionId)) {
    try {
      await reconcileCheckoutSession(sessionId);
    } catch (error) {
      console.error(`Could not confirm session ${sessionId} for ${orderNumber}`, error);
    }
  }

  const order = await getOrderForViewer(orderNumber);
  if (!order) notFound();

  const session = await getSession();
  const heading = HEADINGS[order.status];

  return (
    <>
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <p className="eyebrow text-muted-foreground">{ORDER_STATUS_LABELS[order.status]}</p>
        <h1 className="heading-1">{heading.title}</h1>
        <p className="text-muted-foreground">
          Order <span className="text-foreground">{order.orderNumber}</span> · {formatOrderDate(order.createdAt)}
        </p>
        <p className="max-w-lg text-muted-foreground">{heading.body(order.email)}</p>
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
