import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { aboutNav, COLUMN_SIZES, HALF_COLUMN_SIZES, unsplash } from "./about-links";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "The point of view behind LE Clothing: fewer, better pieces, cut with care and made to be worn for years.",
};

const further = [
  {
    href: "/about/craft",
    title: "Craftsmanship",
    body: "The wool, leather, silk and cotton we work with, and how each piece is made.",
  },
  {
    href: "/about/sustainability",
    title: "Sustainability",
    body: "What we do today, and what we won't claim until we can show it.",
  },
  {
    href: "/careers",
    title: "Careers",
    body: "Working at the house, and how to get in touch with us.",
  },
  {
    href: "/collections/new-arrivals",
    title: "New arrivals",
    body: "The latest pieces from the studio, newest first.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="The House"
      title="Our story"
      intro="LE Clothing makes a deliberately small wardrobe: coats, tailoring, leather and soft separates, chosen to be worn often and kept for years."
      nav={aboutNav("/about")}
    >
      <figure>
        <div className="media-frame aspect-editorial">
          <Image
            src={unsplash("1554412933-514a83d2f3c8", 2000, 1125)}
            alt="Model in a black wool coat with ruffled placket against a red backdrop"
            fill
            sizes={COLUMN_SIZES}
            loading="eager"
            fetchPriority="high"
            className="object-top"
          />
        </div>
      </figure>

      <div className="prose-content mt-12">
        <h2>A point of view</h2>
        <p>
          We start from a simple idea: a wardrobe works best when every piece in it earns its place. So we make fewer
          things, and we spend our time on the parts you notice after a season of wear rather than in the first five
          minutes: the weight of a cloth, the way a shoulder sits, a seam that has been finished by hand.
        </p>
        <p>
          The palette stays quiet on purpose. Camel, navy, cognac, ivory and black sit alongside one another, so a coat
          bought this winter still has something to say to the trousers you bought two years ago.
        </p>

        <h2>Made to be lived in</h2>
        <p>
          Our pieces are meant to change with you. Lambskin softens, vegetable-tanned leather darkens to a patina,
          double-faced wool relaxes into the shape of the person wearing it. We would rather design for that slow change
          than for a single perfect photograph.
        </p>
        <p>
          That is also why every product page lists its composition, fit and care in plain terms, so you know exactly
          what you are buying and how to look after it.
        </p>
      </div>

      <div className="mt-12 grid gap-grid-x sm:grid-cols-2">
        <figure>
          <div className="media-frame">
            <Image
              src={unsplash("1539533018447-63fcce2678e3", 1200, 1600)}
              alt="Camel belted wool coat worn over black trousers"
              fill
              sizes={HALF_COLUMN_SIZES}
            />
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            The Belted Wool Coat, in double-faced virgin wool.
          </figcaption>
        </figure>
        <figure>
          <div className="media-frame">
            <Image
              src={unsplash("1507679799987-c73779587ccf", 1200, 1600)}
              alt="Man buttoning a navy tailored wool suit jacket"
              fill
              sizes={HALF_COLUMN_SIZES}
            />
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            The Tailored Wool Suit, half-canvassed in Italian wool.
          </figcaption>
        </figure>
      </div>

      <div className="prose-content mt-12">
        <h2>The studio</h2>
        <p>
          Design happens in our own studio, where we develop prints such as the hand-painted rose on our silk wrap
          dress, and work with specialist makers for leather, tailoring and footwear. We keep collections small enough
          that we can stand behind each piece in them.
        </p>
      </div>

      <section aria-labelledby="about-further-title" className="mt-16 border-t pt-12">
        <h2 id="about-further-title" className="heading-2">
          More from the house
        </h2>
        <ul className="mt-8 grid gap-x-grid-x gap-y-8 sm:grid-cols-2">
          {further.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group block border-t pt-5">
                <span className="heading-3 underline decoration-transparent decoration-1 underline-offset-[0.3em] transition-colors group-hover:decoration-current">
                  {item.title}
                </span>
                <span className="mt-2 block text-muted-foreground">{item.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ContentPage>
  );
}
