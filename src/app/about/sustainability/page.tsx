import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { aboutNav, COLUMN_SIZES, unsplash } from "../about-links";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "How we think about making clothes responsibly: fewer pieces, lasting materials, and care that extends their life.",
};

export default function SustainabilityPage() {
  return (
    <ContentPage
      eyebrow="The House"
      title="Sustainability"
      intro="We are a small house, and we would rather be precise about what we do than make broad promises. This page sets out where we stand today."
      nav={aboutNav("/about/sustainability")}
    >
      <figure>
        <div className="media-frame aspect-editorial">
          <Image
            src={unsplash("1558769132-cb1aea458c5e", 2000, 1125)}
            alt="Rail of neutral-toned knitwear beside dried pampas grass"
            fill
            sizes={COLUMN_SIZES}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </figure>

      <div className="prose-content mt-12">
        <h2>Fewer, longer-lasting pieces</h2>
        <p>
          The most useful thing we can do is make clothes worth keeping. We keep our collections small, return to the
          same shapes and colours season after season, and design pieces that work together, so each one is worn more
          often.
        </p>

        <h2>Materials chosen to last</h2>
        <p>
          We favour natural fibres and leathers that age well: wool, cashmere, silk, cotton, linen and leather. Some of
          our cotton pieces are made in organic cotton, and each product page states its exact composition so you can
          see what it is made from. You can read more about our materials on the{" "}
          <Link href="/about/craft">craftsmanship page</Link>.
        </p>

        <h2>Care extends a garment&apos;s life</h2>
        <p>
          How a piece is looked after matters as much as how it was made. Every product page includes care instructions,
          and our client advisors can answer questions about cleaning, storing or caring for a specific piece through
          the <Link href="/contact">contact page</Link>.
        </p>

        <h2>What we don&apos;t claim</h2>
        <p>
          We don&apos;t currently hold sustainability certifications or publish environmental figures, and we won&apos;t
          describe our products as &ldquo;sustainable&rdquo; or &ldquo;eco-friendly&rdquo; in general terms. When we can
          share measured, verifiable information about our sourcing and making, we will publish it here.
        </p>

        <h2>Questions</h2>
        <p>
          If you would like to know more about a particular product or material, please{" "}
          <Link href="/contact">get in touch</Link>. We will tell you what we know, and say so when we don&apos;t.
        </p>
      </div>
    </ContentPage>
  );
}
