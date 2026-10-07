import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { legalNav } from "../legal-links";
import { TemplateNotice } from "../template-notice";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How LE Clothing works to make its website usable by everyone, and how to report an accessibility problem.",
};

export default function AccessibilityPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Accessibility"
      intro="We want everyone to be able to browse and buy from LE Clothing, whatever device, browser or assistive technology they use."
      nav={legalNav("/legal/accessibility")}
    >
      <div className="prose-content">
        <h2>Our approach</h2>
        <p>
          We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. We design and build pages with
          that standard in mind, and we treat accessibility problems as defects to fix rather than optional extras.
        </p>

        <h2>What the site does</h2>
        <ul>
          <li>
            <strong>Skip link.</strong> The first thing you reach with the Tab key is a &ldquo;Skip to content&rdquo;
            link that jumps past the header to the main content of the page.
          </li>
          <li>
            <strong>Keyboard navigation.</strong> Menus, forms, buttons and the shopping bag can be used with a keyboard
            alone, and the element in focus is always clearly marked.
          </li>
          <li>
            <strong>Labelled forms.</strong> Every form field has a label that screen readers announce, shown on screen
            on the account, checkout and address forms. When something needs correcting, the message appears next to the
            field it belongs to and is linked to it, so screen readers announce it too.
          </li>
          <li>
            <strong>Not relying on colour.</strong> Information such as stock levels (&ldquo;Only 2 left&rdquo;,
            &ldquo;Out of stock&rdquo;), errors and confirmations is always written out in words, not shown by colour
            alone.
          </li>
          <li>
            <strong>Images and structure.</strong> Product and editorial images have text alternatives, pages use a
            logical heading structure, and the page language is set so screen readers pronounce text correctly.
          </li>
          <li>
            <strong>Reduced motion.</strong> If you have asked your device to reduce motion, the site turns off its
            animations and transitions.
          </li>
        </ul>

        <h2>Known limitations</h2>
        <ul>
          <li>The site has not yet been audited by an independent accessibility specialist.</li>
          <li>
            Payment takes place on a page hosted by Stripe, which is outside our control. Stripe publishes its own
            information about the accessibility of its checkout.
          </li>
        </ul>

        <h2>Report a problem</h2>
        <p>
          If you find something on the site difficult or impossible to use, please tell us through the{" "}
          <Link href="/contact">contact page</Link>. It helps to include the address of the page, what you were trying
          to do, and the browser and any assistive technology you were using. We will look into every report, and if you
          need help placing an order in the meantime, our client advisors can help.
        </p>
      </div>
      <TemplateNotice />
    </ContentPage>
  );
}
