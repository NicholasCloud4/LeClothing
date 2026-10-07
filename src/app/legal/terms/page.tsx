import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { legalNav } from "../legal-links";
import { TemplateNotice } from "../template-notice";

export const metadata: Metadata = {
  title: "Terms of sale",
  description: "The terms that apply when you buy from LE Clothing online: prices, payment, delivery and returns.",
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Terms of sale"
      intro="These terms apply to every order placed on this website. Please read them before you buy."
      nav={legalNav("/legal/terms")}
    >
      <div className="prose-content">
        <h2>About these terms</h2>
        <p>
          In these terms, &ldquo;we&rdquo; and &ldquo;us&rdquo; mean LE Clothing, and &ldquo;you&rdquo; means the person
          placing an order. If you have a question about these terms or an order, please{" "}
          <Link href="/contact">contact us</Link>.
        </p>

        <h2>Prices</h2>
        <ul>
          <li>All prices are shown and charged in US dollars (USD).</li>
          <li>
            The total you pay is the price of each item multiplied by its quantity, plus the delivery charge for the
            method you choose. Both are shown before you go to payment.
          </li>
          <li>
            Prices do not include sales tax, VAT, import duties or customs fees. The site does not calculate or collect
            them, and any that your country charges on delivery are payable by you.
          </li>
          <li>
            Prices are always re-checked when you check out. If a price has changed since you added an item to your bag,
            checkout stops and asks you to review your bag, so you always see the total you will pay before you pay it.
          </li>
        </ul>

        <h2>Availability</h2>
        <p>
          Adding an item to your bag does not reserve it. Stock is checked again when you check out, and if an item has
          sold out or the quantity you chose is no longer available, we let you know before anything is charged.
        </p>
        <p>
          Once you go to payment, the items in your order are held for you for about 30 minutes. If you do not complete
          payment in that time, or you return to the shop from the payment page, the order is cancelled, nothing is
          charged, and the items are released. Starting a new checkout for the same bag cancels the previous one.
        </p>

        <h2>Payment</h2>
        <p>
          Payment is taken by card through Stripe, on a secure payment page hosted by Stripe. Other payment methods may
          be offered on that page. Your card details are entered directly with Stripe and never reach our website.
        </p>
        <p>
          Your order is placed when you submit checkout and receives an order number beginning with &ldquo;LE-&rdquo;.
          It is confirmed once Stripe confirms your payment. If a payment fails or cannot be completed, the order is
          cancelled and the items are released.
        </p>

        <h2>Delivery</h2>
        <p>
          We deliver to the countries listed at checkout. The delivery methods, charges and estimated delivery times
          available for your order are shown at checkout; see <Link href="/help/shipping">shipping information</Link>{" "}
          for details. Estimated delivery times are a guide, not a guarantee.
        </p>

        <h2>Returns and refunds</h2>
        <p>
          Our returns policy, including the time you have to return an item and how to start a return, is set out on the{" "}
          <Link href="/help/returns">returns and exchanges page</Link>. Refunds are arranged by our client services team
          and are made to the original payment method.
        </p>

        <h2>Product information</h2>
        <p>
          We describe every piece as accurately as we can, including its composition, fit and care. Colours can look
          different from screen to screen, and natural materials such as leather and suede vary slightly from piece to
          piece.
        </p>

        <h2>Your account</h2>
        <p>
          You can check out as a guest or with an account. If you create an account, please keep your password private;
          you are responsible for orders placed while signed in to it. You can view your orders and saved addresses in{" "}
          <Link href="/account">your account</Link>.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. The version shown on this page when you place an order is the one
          that applies to it.
        </p>

        <h2>Contact</h2>
        <p>
          For any question about an order or these terms, please{" "}
          <Link href="/contact">contact our client services team</Link>.
        </p>
      </div>
      <TemplateNotice />
    </ContentPage>
  );
}
