// Homepage editorial content. Products themselves come from the database (see `@/lib/db/queries/catalog`).
// Images are Unsplash photos, cropped server-side by Unsplash's image CDN.

import type { CatalogImage } from "@/lib/catalog";

export type Collection = {
  slug: string;
  title: string;
  image: CatalogImage;
};

export type Feature = {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  image: CatalogImage;
};

function unsplash(id: string, width: number, height: number, crop = "crop=faces,entropy") {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&${crop}&w=${width}&h=${height}&q=80`;
}

/** Portrait shot matching the 3:4 `aspect-product` frame. */
function productShot(id: string, alt: string): CatalogImage {
  return { src: unsplash(id, 1200, 1600), alt };
}

export const hero = {
  eyebrow: "Autumn–Winter Collection",
  title: "Dressed for the Evening",
  cta: { label: "Discover the collection", href: "/collections/autumn-winter" },
  images: [
    {
      src: unsplash("1554412933-514a83d2f3c8", 1400, 2000),
      alt: "Model in a black wool coat with ruffled placket against a red backdrop",
    },
    {
      src: unsplash("1595777457583-95e059d581b8", 1400, 2000),
      alt: "Model in a flowing red evening gown on a stone terrace",
    },
  ],
} satisfies {
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
  images: [CatalogImage, CatalogImage];
};

export const collections: Collection[] = [
  {
    slug: "women",
    title: "Women",
    image: productShot("1485968579580-b6d095142e6e", "Woman in a tailored plaid coat on a city street"),
  },
  {
    slug: "men",
    title: "Men",
    image: productShot("1617137968427-85924c800a22", "Man in a navy suit and open-collar shirt"),
  },
  {
    slug: "bags",
    title: "Bags",
    image: productShot("1584917865442-de89df76afd3", "Red structured leather top-handle bag"),
  },
  {
    slug: "shoes",
    title: "Shoes",
    image: productShot("1543163521-1bf539c55dd2", "Pair of floral print stiletto pumps on a plinth"),
  },
];

export const features: Feature[] = [
  {
    eyebrow: "Featured Collection",
    title: "The Knitwear Edit",
    body: "Hand-finished cashmere, merino and mohair in a palette of oat, stone and cocoa, made to be layered through the colder months.",
    cta: { label: "Shop knitwear", href: "/collections/knitwear" },
    image: {
      src: unsplash("1558769132-cb1aea458c5e", 1600, 2000),
      alt: "Rail of neutral-toned knitwear beside dried pampas grass",
    },
  },
  {
    eyebrow: "Menswear",
    title: "City Leather",
    body: "Supple lambskin cut close to the body, with hardware finished by hand. Built to soften and age with every wear.",
    cta: { label: "Shop menswear", href: "/collections/men" },
    image: {
      src: unsplash("1520975954732-35dd22299614", 1600, 2000),
      alt: "Man in a black leather jacket crouching on a brick wall",
    },
  },
];

export const boutique = {
  eyebrow: "Our Boutiques",
  title: "Visit Us in Store",
  body: "Book a private styling appointment, collect online orders and enjoy complimentary alterations.",
  cta: { label: "Find a boutique", href: "/stores" },
  image: {
    src: unsplash("1441984904996-e0b6ba687e04", 2400, 1350),
    alt: "Boutique interior with hanging rails of clothing under pendant lights",
  },
};
