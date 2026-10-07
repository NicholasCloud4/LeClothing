import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { helpNav } from "../help-links";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "How to return or exchange an LE Clothing order, free of charge within 30 days of delivery.",
};

export default function ReturnsPage() {
  return (
    <ContentPage
      eyebrow="Client Services"
      title="Returns & Exchanges"
      intro="If a piece isn't quite right, you may return or exchange it free of charge within 30 days of delivery."
      nav={helpNav("/help/returns")}
    >
      <div className="prose-content">
        <h2>Our policy</h2>
        <ul>
          <li>
            Returns and exchanges are <strong>complimentary within 30 days</strong> of the date your order is delivered.
          </li>
          <li>Pieces must be unworn, unwashed and unaltered, with all original tags and packaging.</li>
          <li>Shoes should be tried on a soft surface and returned in their original box.</li>
          <li>Pieces that have been altered or personalised at your request cannot be returned.</li>
        </ul>

        <h2>How to return a piece</h2>
        <ol>
          <li>
            <Link href="/contact">Contact client services</Link> with your order number and the pieces you would like to
            return or exchange.
          </li>
          <li>A client advisor will confirm your return and send you instructions and a prepaid return label.</li>
          <li>Pack the pieces securely in their original packaging and send them back within 14 days.</li>
          <li>
            Once your return has arrived and been checked, we refund the pieces to your original payment card. Your bank
            may take a few business days to show the refund.
          </li>
        </ol>

        <h2>Exchanges</h2>
        <p>
          To exchange a piece for another size or colour, let your client advisor know when you contact us. We will
          reserve the new piece where it is available and send it once your return is on its way. If you are unsure of
          your size, our <Link href="/help/size-guide">size guide</Link> may help.
        </p>

        <h2>Damaged or incorrect pieces</h2>
        <p>
          If a piece arrives damaged or isn&apos;t what you ordered, please <Link href="/contact">contact us</Link>{" "}
          within 7 days of delivery and we will put it right.
        </p>
      </div>
    </ContentPage>
  );
}
