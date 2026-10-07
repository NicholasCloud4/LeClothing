import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { ChatIcon } from "@/components/icons";
import { HELP_LINKS, helpNav } from "../help/help-links";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach LE Clothing client services by email or phone for help with orders, sizing and returns.",
};

// PLACEHOLDER contact details: replace with the real client-services inbox, phone line and hours.
const EMAIL = "clientservices@example.com";
const PHONE = { label: "+1 (555) 010-0100", href: "tel:+15550100100" };
const HOURS = [
  { days: "Monday – Friday", time: "9:00 – 18:00 ET" },
  { days: "Saturday", time: "10:00 – 16:00 ET" },
  { days: "Sunday", time: "Closed" },
];

export default function ContactPage() {
  const topics = HELP_LINKS.filter((link) => link.href !== "/contact");

  return (
    <ContentPage
      eyebrow="Client Services"
      title="Contact Us"
      intro="Our client advisors are here to help with orders, sizing, returns and styling advice."
      nav={helpNav("/contact")}
    >
      <div className="grid max-w-3xl gap-px border bg-border sm:grid-cols-2">
        <section aria-labelledby="email-title" className="flex flex-col gap-3 bg-background p-6">
          <h2 id="email-title" className="eyebrow text-muted-foreground">
            Email
          </h2>
          <a href={`mailto:${EMAIL}`} className="link self-start text-lg">
            {EMAIL}
          </a>
          <p className="text-muted-foreground">We aim to reply within one business day.</p>
        </section>
        <section aria-labelledby="phone-title" className="flex flex-col gap-3 bg-background p-6">
          <h2 id="phone-title" className="eyebrow text-muted-foreground">
            Phone
          </h2>
          <a href={PHONE.href} className="link self-start text-lg">
            {PHONE.label}
          </a>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-muted-foreground">
            {HOURS.map((entry) => (
              <div key={entry.days} className="contents">
                <dt>{entry.days}</dt>
                <dd className="price">{entry.time}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <p className="mt-6 flex max-w-3xl items-start gap-3 text-muted-foreground">
        <ChatIcon className="mt-0.5 shrink-0" />
        <span>
          If your message is about an order, please include your order number. You&apos;ll find it on your confirmation
          page or, if you were signed in, under{" "}
          <Link href="/account/orders" className="link text-foreground">
            your orders
          </Link>
          .
        </span>
      </p>

      <section aria-labelledby="topics-title" className="mt-16 max-w-3xl">
        <h2 id="topics-title" className="heading-2">
          Find an answer
        </h2>
        <ul className="mt-6 border-t">
          {topics.map((topic) => (
            <li key={topic.href} className="border-b">
              <Link href={topic.href} className="link-reveal block py-4">
                {topic.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="visit-title" className="mt-16 max-w-3xl">
        <h2 id="visit-title" className="heading-2">
          Visit a boutique
        </h2>
        <p className="mt-3 text-muted-foreground">
          Book a private styling appointment or have a piece altered in one of our boutiques.
        </p>
        <Link href="/stores" className="btn btn-secondary mt-6">
          Find a boutique
        </Link>
      </section>
    </ContentPage>
  );
}
