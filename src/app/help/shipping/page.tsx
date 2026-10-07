import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { COUNTRIES } from "@/lib/address";
import { SHIPPING_METHODS, SHIPPING_METHOD_IDS } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { helpNav } from "../help-links";

export const metadata: Metadata = {
  title: "Shipping",
  description: "LE Clothing delivery options, prices and the countries we ship to.",
};

function shippingPrice(cents: number) {
  return cents === 0 ? "Complimentary" : formatPrice(cents);
}

export default function ShippingPage() {
  return (
    <ContentPage
      eyebrow="Client Services"
      title="Shipping"
      intro="Every order is wrapped in our signature packaging and sent with the delivery option you choose at checkout."
      nav={helpNav("/help/shipping")}
    >
      <div className="prose-content">
        <h2>Delivery options</h2>
        <p>Choose your delivery option at checkout. Its price is shown in your order summary before you pay.</p>
      </div>

      <div className="mt-6 max-w-3xl overflow-x-auto">
        <table className="w-full min-w-md border-collapse text-left">
          <caption className="sr-only">Delivery options, estimated delivery times and prices</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="eyebrow py-3 pr-6 font-medium text-muted-foreground">
                Option
              </th>
              <th scope="col" className="eyebrow py-3 pr-6 font-medium text-muted-foreground">
                Estimated delivery
              </th>
              <th scope="col" className="eyebrow py-3 text-right font-medium text-muted-foreground">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {SHIPPING_METHOD_IDS.map((id) => {
              const method = SHIPPING_METHODS[id];
              return (
                <tr key={id} className="border-b">
                  <th scope="row" className="py-4 pr-6 font-normal">
                    {method.label}
                  </th>
                  <td className="py-4 pr-6 text-muted-foreground">{method.detail}</td>
                  <td className="price py-4 text-right">{shippingPrice(method.priceCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="prose-content mt-12">
        <h2>Where we deliver</h2>
        <p>We currently deliver to the following countries:</p>
      </div>
      <ul className="mt-6 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {COUNTRIES.map((country) => (
          <li key={country.code}>{country.name}</li>
        ))}
      </ul>

      <div className="prose-content mt-12">
        <h2>Good to know</h2>
        <ul>
          <li>Delivery times are estimates, counted in business days from when your order is dispatched.</li>
          <li>
            Each order ships to a single address. Signed-in customers can keep several addresses in{" "}
            <Link href="/account/addresses">their address book</Link>.
          </li>
          <li>
            Once your order is placed, its delivery address can no longer be changed online. If something is wrong,{" "}
            <Link href="/contact">contact client services</Link> with your order number straight away.
          </li>
        </ul>
        <p>
          Need to send something back? Read our <Link href="/help/returns">returns and exchanges policy</Link>.
        </p>
      </div>
    </ContentPage>
  );
}
