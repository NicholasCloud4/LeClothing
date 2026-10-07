import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { legalNav } from "../legal-links";
import { TemplateNotice } from "../template-notice";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal information LE Clothing collects, why, who it is shared with, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="We collect only what we need to run your account and deliver your orders. This page explains what that is and what we do with it."
      nav={legalNav("/legal/privacy")}
    >
      <div className="prose-content">
        <h2>Who we are</h2>
        <p>
          This website is run by LE Clothing. For any question about this policy or your information, please{" "}
          <Link href="/contact">contact us</Link>.
        </p>

        <h2>What we collect</h2>
        <h3>If you create an account</h3>
        <ul>
          <li>Your name and email address.</li>
          <li>
            Your password, which is stored only as a one-way hash. We cannot read it, and nobody at LE Clothing can see
            it.
          </li>
          <li>
            A record of each signed-in session: when it started and expires, the IP address and the browser information
            your device sent when you signed in. A session lasts 7 days and is extended while you keep using the site.
          </li>
          <li>Any shipping addresses you save in your address book, including an optional phone number.</li>
        </ul>

        <h3>When you shop</h3>
        <ul>
          <li>
            The contents of your shopping bag: which products, sizes and quantities. For a guest, the bag is linked to a
            cookie on your device; when you sign in, it is moved into your account.
          </li>
          <li>
            For each order: your email address, the shipping name, address and optional phone number you enter, the
            delivery method, the items ordered (name, colour, size, price and quantity), the amounts charged, the order
            status and when it changed.
          </li>
        </ul>

        <h3>Payment details</h3>
        <p>
          You enter your card details on a payment page hosted by Stripe. They go directly to Stripe and never reach our
          website. We receive only references to the payment and whether it succeeded.
        </p>

        <h3>What we don&apos;t collect</h3>
        <ul>
          <li>We don&apos;t use analytics, advertising or social media tracking on this site.</li>
          <li>
            We don&apos;t send marketing or order emails at the moment. The newsletter isn&apos;t active yet, and the
            sign-up form does not store your email address.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To create and secure your account and keep you signed in.</li>
          <li>To keep your shopping bag between visits and between devices once you sign in.</li>
          <li>To take payment for, prepare and deliver your orders, and to handle returns and questions about them.</li>
          <li>To show you your order history and saved addresses in your account.</li>
          <li>To keep the records we need to run the business and meet our legal obligations.</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>We don&apos;t sell or rent your personal information. We share it only where needed to fulfil your order:</p>
        <ul>
          <li>
            <strong>Stripe</strong>, our payment provider, receives your email address, your order number, and the
            items, amounts and delivery method of your order so it can take payment. What you enter on Stripe&apos;s
            payment page, such as card and billing details, is collected by Stripe under its own{" "}
            <a href="https://stripe.com/privacy">privacy policy</a>.
          </li>
          <li>
            <strong>Delivery carriers</strong> receive the name, address and phone number needed to deliver your parcel.
          </li>
          <li>
            <strong>Service providers</strong> that host our website and database process information on our behalf,
            only to provide those services.
          </li>
        </ul>
        <p>We may also disclose information where the law requires it.</p>

        <h2>How long we keep it</h2>
        <ul>
          <li>Account details and saved addresses are kept until you delete them or ask us to close your account.</li>
          <li>Sign-in sessions end when you sign out, or about 7 days after you last used the site.</li>
          <li>A guest shopping bag that has not been used for 30 days may be deleted.</li>
          <li>Order records are kept for as long as we need them for accounting, tax and legal purposes.</li>
        </ul>

        <h2>Your choices</h2>
        <p>
          In <Link href="/account">your account</Link> you can update your name, change your password, and add, edit or
          delete saved addresses at any time. To ask for a copy of the information we hold about you, to correct it, or
          to have your account deleted, please <Link href="/contact">contact us</Link>.
        </p>

        <h2>Cookies</h2>
        <p>
          We use a small number of cookies that the site needs to work, and no others. They are listed on our{" "}
          <Link href="/legal/cookies">cookie settings page</Link>.
        </p>

        <h2>Security</h2>
        <p>
          Passwords are hashed, the cookies that keep you signed in cannot be read by scripts on the page, and card
          details are handled entirely by Stripe. Account pages and order details are shown only to the person they
          belong to.
        </p>

        <h2>Changes to this policy</h2>
        <p>If we change how we use your information, we will update this page before the change takes effect.</p>
      </div>
      <TemplateNotice />
    </ContentPage>
  );
}
