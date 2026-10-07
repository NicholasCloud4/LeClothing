import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ContentPage } from "@/components/content-page";
import { PlusIcon } from "@/components/icons";
import { CHECKOUT_HOLD_MS } from "@/lib/payments";
import { helpNav } from "./help-links";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Answers about ordering, payment, delivery, returns and your LE Clothing account.",
};

/** The checkout hold rounded down to a friendly figure ("about 30 minutes"). */
const holdMinutes = Math.floor(CHECKOUT_HOLD_MS / 60_000 / 10) * 10;

const topics = [
  { title: "Shipping", body: "Delivery options, prices and the countries we ship to.", href: "/help/shipping" },
  {
    title: "Returns & exchanges",
    body: "How to send a piece back or swap it for another size.",
    href: "/help/returns",
  },
  { title: "Size guide", body: "Body measurements for our clothing and shoe sizes.", href: "/help/size-guide" },
  { title: "Contact us", body: "Reach a client advisor by email or phone.", href: "/contact" },
];

type Faq = { question: string; answer: ReactNode };

const faqGroups: { title: string; items: Faq[] }[] = [
  {
    title: "Ordering & payment",
    items: [
      {
        question: "Do I need an account to place an order?",
        answer: (
          <p>
            No. You can check out as a guest. With an account, your bag is saved across devices, your addresses are
            remembered and every order appears in your account. If you sign in after adding pieces as a guest, they are
            moved into your account&apos;s bag.
          </p>
        ),
      },
      {
        question: "How can I pay?",
        answer: (
          <p>
            We accept payment by card. When you continue to payment, you are taken to a secure checkout page hosted by
            our payment provider, Stripe, where you enter your card details. LE Clothing never sees or stores your full
            card number. Prices are shown and charged in US dollars.
          </p>
        ),
      },
      {
        question: "Are the pieces in my bag reserved for me?",
        answer: (
          <p>
            Not while they sit in your bag: availability is confirmed when you check out. Once you continue to payment,
            we hold your pieces for about {holdMinutes} minutes while you pay. If you cancel or the time runs out, the
            hold is released and your bag stays as it was, so you can try again.
          </p>
        ),
      },
      {
        question: "Why was I asked to review my bag at checkout?",
        answer: (
          <p>
            We check every price and size again when you place your order. If anything changed since you opened the
            checkout page, such as a size selling out, nothing is ordered and we ask you to review your bag first, so
            you are never charged an amount you did not see.
          </p>
        ),
      },
    ],
  },
  {
    title: "After you order",
    items: [
      {
        question: "Where can I find my order?",
        answer: (
          <p>
            If you were signed in, every order is listed under{" "}
            <Link href="/account/orders" className="link">
              your account&apos;s orders
            </Link>
            , with its items, delivery address and status. As a guest, you see a confirmation page with your order
            number once payment is complete. You can reopen it in the same browser for 24 hours (for your most recent
            order only), so keep a note of your order number.
          </p>
        ),
      },
      {
        question: "Can I change or cancel my order?",
        answer: (
          <p>
            Please{" "}
            <Link href="/contact" className="link">
              contact client services
            </Link>{" "}
            as soon as possible with your order number, and an advisor will do their best to help before your order is
            prepared.
          </p>
        ),
      },
      {
        question: "How long does delivery take, and what does it cost?",
        answer: (
          <p>
            It depends on the delivery option you choose at checkout. See{" "}
            <Link href="/help/shipping" className="link">
              shipping options and prices
            </Link>
            .
          </p>
        ),
      },
      {
        question: "How do I return or exchange a piece?",
        answer: (
          <p>
            Contact client services with your order number and the pieces you would like to send back. The full process
            is described in our{" "}
            <Link href="/help/returns" className="link">
              returns and exchanges policy
            </Link>
            .
          </p>
        ),
      },
    ],
  },
  {
    title: "Your account",
    items: [
      {
        question: "Can I save my delivery addresses?",
        answer: (
          <p>
            Yes. Signed-in customers can add, edit and remove addresses and choose a default under{" "}
            <Link href="/account/addresses" className="link">
              saved addresses
            </Link>
            . Changing a saved address does not change orders you have already placed.
          </p>
        ),
      },
      {
        question: "How do I find my size?",
        answer: (
          <p>
            Our{" "}
            <Link href="/help/size-guide" className="link">
              size guide
            </Link>{" "}
            lists body measurements for every size we offer. For fit advice on a particular piece, a client advisor is
            happy to help.
          </p>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <ContentPage
      eyebrow="Client Services"
      title="How Can We Help?"
      intro="Find answers to common questions about ordering, delivery and returns, or get in touch with a client advisor."
      nav={helpNav("/help")}
    >
      <section aria-labelledby="topics-title">
        <h2 id="topics-title" className="heading-2">
          Help topics
        </h2>
        <ul className="mt-6 grid gap-px border bg-border sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.href} className="bg-background">
              <Link href={topic.href} className="group flex h-full flex-col gap-2 p-6">
                <span className="heading-3 underline decoration-transparent decoration-1 underline-offset-[0.3em] transition-colors group-hover:decoration-current">
                  {topic.title}
                </span>
                <span className="text-muted-foreground">{topic.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {faqGroups.map((group, index) => (
        <section key={group.title} aria-labelledby={`faq-${index}`} className="mt-16">
          <h2 id={`faq-${index}`} className="heading-2">
            {group.title}
          </h2>
          <div className="mt-4 max-w-3xl border-t">
            {group.items.map((item) => (
              <details key={item.question} className="group border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <PlusIcon className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <div className="pb-6 text-muted-foreground">{item.answer}</div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </ContentPage>
  );
}
