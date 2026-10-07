import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { OrderItem } from "@/lib/orders";

/** Read-only list of what is in an order or about to be. Used by checkout, confirmation and the account. */
export function OrderLines({ items, label = "Items" }: { items: OrderItem[]; label?: string }) {
  return (
    <ul aria-label={label} className="divide-y">
      {items.map((item) => (
        <li key={`${item.slug}:${item.size}`} className="grid grid-cols-[4.5rem_1fr_auto] gap-4 py-4">
          <div className="media-frame">{item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="72px" />}</div>
          <div className="space-y-1">
            <p className="font-sans text-sm tracking-body">
              <Link href={`/products/${item.slug}`} className="link-reveal">
                {item.name}
              </Link>
            </p>
            <p className="text-muted-foreground">
              {item.color}
              {item.size !== "One size" && <> · Size {item.size}</>}
            </p>
            <p className="text-muted-foreground">Qty {item.quantity}</p>
          </div>
          <p className="price">{formatPrice(item.unitPriceCents * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({
  subtotalCents,
  shippingCents,
  totalCents,
}: {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}) {
  return (
    <dl className="space-y-3">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="price">{formatPrice(subtotalCents)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Shipping</dt>
        <dd className="price">{shippingCents === 0 ? "Complimentary" : formatPrice(shippingCents)}</dd>
      </div>
      <div className="flex justify-between border-t pt-3 text-base">
        <dt>Total</dt>
        <dd className="price">{formatPrice(totalCents)}</dd>
      </div>
    </dl>
  );
}
