import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { legalNav } from "../legal-links";
import { TemplateNotice } from "../template-notice";

export const metadata: Metadata = {
  title: "Cookie settings",
  description:
    "The cookies LE Clothing uses: only those the site needs to work, with no analytics or advertising cookies.",
};

type SiteCookie = {
  name: string;
  /** Alternative name used in some environments. */
  note?: string;
  purpose: string;
  duration: string;
  setWhen: string;
};

// Keep in sync with the code: Better Auth (`src/lib/auth.ts`), `CART_COOKIE` (`src/lib/db/mutations/cart.ts`) and
// `LAST_ORDER_COOKIE` (`src/lib/actions/checkout.ts`).
const cookies: SiteCookie[] = [
  {
    name: "better-auth.session_token",
    note: "Named __Secure-better-auth.session_token on the secure (HTTPS) site.",
    purpose: "Keeps you signed in to your account.",
    duration: "7 days, renewed while you use the site. Removed when you sign out.",
    setWhen: "When you sign in or create an account.",
  },
  {
    name: "cart",
    purpose: "Remembers the shopping bag of a visitor who is not signed in.",
    duration: "30 days. Removed when you sign in and the bag moves into your account.",
    setWhen: "When you first add an item to your bag while signed out.",
  },
  {
    name: "last_order",
    purpose: "Lets you return to the confirmation page of your most recent order, even without an account.",
    duration: "24 hours.",
    setWhen: "When you go from checkout to payment.",
  },
];

export default function CookiesPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Cookie settings"
      intro="We only use cookies that the site needs to work. There are no analytics, advertising or tracking cookies, so there is nothing to switch on or off here."
      nav={legalNav("/legal/cookies")}
    >
      <div className="prose-content">
        <h2>Cookies we use</h2>
        <p>
          All of these are set by LE Clothing on this website only. They cannot be read by scripts on the page, are not
          sent with requests from other websites, and contain no personal details: just a random identifier or your
          order number.
        </p>
      </div>

      <ul className="mt-8 max-w-[68ch] border-b">
        {cookies.map((cookie) => (
          <li key={cookie.name} className="border-t py-6">
            <h3 className="heading-3">
              <code className="font-mono text-sm">{cookie.name}</code>
            </h3>
            {cookie.note && <p className="mt-1 text-sm text-muted-foreground">{cookie.note}</p>}
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="font-medium">Purpose</dt>
              <dd className="text-muted-foreground">{cookie.purpose}</dd>
              <dt className="font-medium">Duration</dt>
              <dd className="text-muted-foreground">{cookie.duration}</dd>
              <dt className="font-medium">Set</dt>
              <dd className="text-muted-foreground">{cookie.setWhen}</dd>
            </dl>
          </li>
        ))}
      </ul>

      <div className="prose-content mt-12">
        <h2>Payment with Stripe</h2>
        <p>
          When you pay, you leave this site for a payment page hosted by Stripe on its own domain. Stripe sets its own
          cookies there, for example to prevent fraud, under Stripe&apos;s{" "}
          <a href="https://stripe.com/privacy">privacy policy</a>. We don&apos;t control or have access to those
          cookies.
        </p>

        <h2>Managing cookies</h2>
        <p>
          Because these cookies are needed for the site to work, there is no setting to turn them off here. You can
          block or delete cookies in your browser&apos;s settings, but if you do, you won&apos;t be able to sign in, and
          a bag you fill while signed out won&apos;t be remembered.
        </p>
        <p>
          If we ever add cookies that are not strictly necessary, we will list them here and ask for your consent first.
          For more about how we handle your information, see our <Link href="/legal/privacy">privacy policy</Link>.
        </p>
      </div>
      <TemplateNotice />
    </ContentPage>
  );
}
