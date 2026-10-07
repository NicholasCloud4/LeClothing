import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { getSession } from "@/lib/auth-session";
import { hasPurchasableLines, purchasableQuantity } from "@/lib/cart";
import { getAddressesForUser } from "@/lib/db/queries/addresses";
import { getCart } from "@/lib/db/queries/cart";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="shell section">
      <h1 className="heading-1 mb-8 text-center">Checkout</h1>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContents />
      </Suspense>
    </div>
  );
}

async function CheckoutContents() {
  const [cart, session] = await Promise.all([getCart(), getSession()]);
  if (!hasPurchasableLines(cart)) redirect("/cart");

  const saved = session ? await getAddressesForUser(session.user.id) : null;

  return (
    <CheckoutForm
      // Sold-out lines are left out of the order, as the bag page says.
      lines={cart.lines.filter((line) => purchasableQuantity(line) > 0)}
      defaultEmail={session?.user.email ?? ""}
      savedAddresses={
        saved &&
        saved.map(({ id, fullName, line1, line2, city, region, postalCode, country, phone }) => ({
          id,
          fullName,
          line1,
          line2: line2 ?? "",
          city,
          region: region ?? "",
          postalCode,
          country,
          phone: phone ?? "",
        }))
      }
    />
  );
}

function CheckoutSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading checkout"
      className="grid animate-pulse gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16"
    >
      <div className="space-y-6">
        <div className="h-24 bg-muted" />
        <div className="h-80 bg-muted" />
      </div>
      <div className="h-72 bg-muted" />
    </div>
  );
}
