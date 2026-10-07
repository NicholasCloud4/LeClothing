import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { aboutNav, HALF_COLUMN_SIZES, unsplash } from "../about-links";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description: "The wool, cashmere, leather, silk and cotton we work with, and the making details behind each piece.",
};

export default function CraftPage() {
  return (
    <ContentPage
      eyebrow="The House"
      title="Craftsmanship"
      intro="A short list of materials, chosen for how they wear over time, and the making details that are easy to miss and hard to fake."
      nav={aboutNav("/about/craft")}
    >
      <div className="grid gap-grid-x sm:grid-cols-2">
        <figure>
          <div className="media-frame">
            <Image
              src={unsplash("1520975954732-35dd22299614", 1200, 1600)}
              alt="Man in a black leather jacket crouching on a brick wall"
              fill
              sizes={HALF_COLUMN_SIZES}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </figure>
        <figure>
          <div className="media-frame">
            <Image
              src={unsplash("1539109136881-3be0616acf4b", 1200, 1600)}
              alt="Woman in a powder blue double-faced wool coat"
              fill
              sizes={HALF_COLUMN_SIZES}
              loading="eager"
            />
          </div>
        </figure>
      </div>

      <div className="prose-content mt-12">
        <h2>Materials</h2>

        <h3>Wool and cashmere</h3>
        <p>
          Our coats are cut from double-faced wool: two layers of cloth woven together, so a coat can be left unlined
          and still hold its shape. The <Link href="/products/belted-wool-coat">Belted Wool Coat</Link> is pure virgin
          wool; the <Link href="/products/double-faced-wool-coat">Double-Faced Wool Coat</Link> blends wool with ten per
          cent cashmere for a softer hand. Tailoring uses Italian Super 120s wool, a fine, smooth worsted that drapes
          well and recovers from creasing.
        </p>

        <h3>Leather and suede</h3>
        <p>
          We work with lambskin, which is light and supple from the first wear, and with vegetable-tanned calf leather,
          which starts firmer and darkens to a warm patina as it ages. Our ankle boots are made in Italy in brushed calf
          suede, lined in leather and set on a leather sole.
        </p>

        <h3>Silk</h3>
        <p>
          Silk appears in two forms: sand-washed, for a matte, slightly worn-in surface on relaxed trousers, and crêpe
          de chine, a fluid, finely textured weave for dresses. The rose print on our{" "}
          <Link href="/products/floral-wrap-dress">Floral Wrap Dress</Link> was hand-painted in our studio.
        </p>

        <h3>Cotton and linen</h3>
        <p>
          Our tees use long-staple Supima cotton jersey, made in Portugal, and a heavyweight 240 gsm cotton that keeps a
          boxy shape. Some of our cotton pieces, such as the brushed loopback sweatshirt and the twill playsuit, are
          made in organic cotton. A cotton and linen blend gives our hand-crocheted poncho its open, airy stitch.
        </p>

        <h2>Making</h2>
        <ul>
          <li>
            <strong>Half-canvas tailoring.</strong> A canvas layer through the chest and lapel gives a suit jacket a
            natural roll and lets it mould to the wearer, rather than relying on fused interlining alone.
          </li>
          <li>
            <strong>Unlined, hand-finished coats.</strong> Without a lining, every seam is on show, so seams are
            finished by hand to be as clean inside as out.
          </li>
          <li>
            <strong>Hand-stitched soles.</strong> Our suede ankle boots are set on a hand-stitched leather sole.
          </li>
          <li>
            <strong>Hand-crochet.</strong> The poncho is crocheted by hand, stitch by stitch, then finished with a long
            fringe.
          </li>
          <li>
            <strong>Finished by hand.</strong> Our cognac rider jacket is finished by hand to its patina, and our
            lambskin biker is lightly waxed so it develops character with wear.
          </li>
        </ul>

        <h2>Caring for your pieces</h2>
        <p>
          Good materials last longest when they are looked after. Every product page lists care instructions: dry
          cleaning for wool coats, tailoring and silk crêpe de chine, a specialist leather cleaner for leather jackets,
          and a cold machine wash for cotton jersey and loopback. Brush wool after wearing, let leather rest between
          wears, and store knitwear folded rather than hung.
        </p>
        <p>
          Questions about a material or how to care for it? Our client advisors are happy to help through the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </ContentPage>
  );
}
