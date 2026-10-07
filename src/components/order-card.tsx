import Image from "next/image";
import Link from "next/link";
import { formatOrderDate } from "@/components/order-details";
import { formatPrice } from "@/lib/catalog";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/orders";

/** One row in an order history list. */
export function OrderCard({ order }: { order: Order }) {
  const units = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href={`/account/orders/${order.orderNumber}`}
      className="flex flex-col gap-4 border p-5 transition-colors hover:border-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <p className="font-medium">{order.orderNumber}</p>
        <p className="text-muted-foreground">
          {formatOrderDate(order.createdAt)} · {ORDER_STATUS_LABELS[order.status]}
        </p>
        <p className="text-muted-foreground">
          {units} {units === 1 ? "item" : "items"} · <span className="price">{formatPrice(order.totalCents)}</span>
        </p>
      </div>
      <ul aria-hidden="true" className="flex gap-2">
        {order.items.slice(0, 4).map((item) => (
          <li key={`${item.slug}:${item.size}`} className="relative aspect-product w-12 bg-muted">
            {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
          </li>
        ))}
      </ul>
    </Link>
  );
}
