import { OrderLines, OrderTotals } from "@/components/order-lines";
import { countryName } from "@/lib/address";
import { SHIPPING_METHODS, type ShippingMethod } from "@/lib/cart";
import type { Order } from "@/lib/orders";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export function formatOrderDate(date: Date) {
  return dateFormatter.format(date);
}

/** Items, totals, address and delivery for one order. Shared by the confirmation page and the account. */
export function OrderDetails({ order }: { order: Order }) {
  const { shipTo } = order;
  const method = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
      <section aria-labelledby="order-items-title">
        <h2 id="order-items-title" className="heading-3 mb-2">
          Items
        </h2>
        <div className="border-y">
          <OrderLines items={order.items} label="Items in this order" />
        </div>
      </section>

      <div className="flex flex-col gap-8">
        <section aria-labelledby="order-totals-title" className="bg-muted p-6">
          <h2 id="order-totals-title" className="heading-3 mb-5">
            Summary
          </h2>
          <OrderTotals
            subtotalCents={order.subtotalCents}
            shippingCents={order.shippingCents}
            totalCents={order.totalCents}
          />
        </section>

        <section aria-labelledby="order-ship-title">
          <h2 id="order-ship-title" className="heading-3 mb-3">
            Shipping to
          </h2>
          <address className="space-y-0.5 not-italic text-muted-foreground">
            <p className="text-foreground">{shipTo.name}</p>
            <p>{shipTo.line1}</p>
            {shipTo.line2 && <p>{shipTo.line2}</p>}
            <p>
              {shipTo.city}
              {shipTo.region && `, ${shipTo.region}`} {shipTo.postalCode}
            </p>
            <p>{countryName(shipTo.country)}</p>
            {shipTo.phone && <p>{shipTo.phone}</p>}
          </address>
          {method && (
            <p className="mt-3 text-muted-foreground">
              {method.label} · {method.detail}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
