// Sample catalog loaded by `npm run db:seed`. Images are Unsplash photos, cropped server-side
// by Unsplash's image CDN.

type SeedImage = { url: string; alt: string };
type SeedSize = { size: string; quantity: number };

export type SeedCategory = { slug: string; name: string; sortOrder: number };

export type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  priceCents: number;
  color: string;
  colorCount: number;
  isNew?: boolean;
  description: string;
  details: string[];
  sizes: SeedSize[];
  /** First image is the primary shot used on product cards. */
  images: SeedImage[];
};

// ---------------------------------------------------------------------------
// Images

function unsplash(id: string, width: number, height: number, crop = "crop=faces,entropy") {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&${crop}&w=${width}&h=${height}&q=80`;
}

/** Focal point for a zoomed detail crop: x/y as 0–1 fractions of the photo, z as zoom factor. */
type Focus = [x: number, y: number, zoom: number];

const DEFAULT_DETAILS: Focus[] = [
  [0.5, 0.3, 2],
  [0.5, 0.7, 2],
];

/** Primary shot plus close-up crops of the same photo, until real multi-angle photography exists. */
function gallery(id: string, name: string, alt: string, details: Focus[] = DEFAULT_DETAILS): SeedImage[] {
  return [
    { url: unsplash(id, 1200, 1600), alt },
    ...details.map(([x, y, zoom], index) => ({
      url: unsplash(id, 1200, 1600, `crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}`),
      alt: `${name}, close-up detail ${index + 1}`,
    })),
  ];
}

// ---------------------------------------------------------------------------
// Sizes and stock

const WOMEN_SIZES = ["XS", "S", "M", "L", "XL"];
const MEN_SIZES = ["S", "M", "L", "XL", "XXL"];
const TAILORING_SIZES = ["46", "48", "50", "52", "54"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41"];

function sizeRun(labels: string[], stock: number[]): SeedSize[] {
  return labels.map((size, index) => ({ size, quantity: stock[index] ?? 0 }));
}

function oneSize(quantity: number): SeedSize[] {
  return [{ size: "One size", quantity }];
}

// ---------------------------------------------------------------------------
// Categories

export const categories: SeedCategory[] = [
  { slug: "women", name: "Women", sortOrder: 0 },
  { slug: "men", name: "Men", sortOrder: 1 },
  { slug: "bags", name: "Bags", sortOrder: 2 },
  { slug: "shoes", name: "Shoes", sortOrder: 3 },
];

// ---------------------------------------------------------------------------
// Products, newest first: the seed gives each one an older `created_at` than the last,
// so the first eight make up the homepage's New Arrivals.

export const products: SeedProduct[] = [
  {
    slug: "belted-wool-coat",
    name: "Belted Wool Coat",
    categorySlug: "women",
    priceCents: 1450_00,
    color: "Camel",
    colorCount: 2,
    isNew: true,
    description:
      "A softly structured wrap coat in double-faced wool, cut long through the body and cinched with a self-tie belt. Dropped shoulders and deep patch pockets keep the silhouette relaxed.",
    details: [
      "100% virgin wool",
      "Unlined, hand-finished seams",
      "Notched lapels and removable self-tie belt",
      "Mid-calf length; model wears size S",
      "Dry clean only",
    ],
    sizes: sizeRun(WOMEN_SIZES, [0, 1, 2, 0, 0]),
    images: gallery("1539533018447-63fcce2678e3", "Belted Wool Coat", "Camel belted wool coat worn over black trousers", [
      [0.5, 0.3, 2],
      [0.5, 0.5, 2.5],
    ]),
  },
  {
    slug: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    categorySlug: "women",
    priceCents: 1890_00,
    color: "Black",
    colorCount: 1,
    isNew: true,
    description:
      "Our signature biker in supple lambskin, with an asymmetric zip, snap-down lapels and a fitted waist. Lightly waxed to develop character with every wear.",
    details: [
      "100% lambskin leather; cotton lining",
      "Silver-tone hardware",
      "Zip cuffs and three zip pockets",
      "Fitted; take your usual size",
      "Specialist leather clean only",
    ],
    sizes: sizeRun(WOMEN_SIZES, [3, 6, 4, 2, 1]),
    images: gallery("1551028719-00167b16eac5", "Leather Biker Jacket", "Black leather biker jacket on a hanger", [
      [0.6, 0.6, 2],
      [0.45, 0.4, 2.2],
    ]),
  },
  {
    slug: "satin-bomber-jacket",
    name: "Satin Bomber Jacket",
    categorySlug: "men",
    priceCents: 780_00,
    color: "Rust",
    colorCount: 3,
    isNew: true,
    description:
      "A lightweight bomber in fluid technical satin with ribbed collar, cuffs and hem. Finished with a two-way zip and a clean, minimal front.",
    details: [
      "Shell: 100% polyamide; lining: 100% cupro",
      "Two-way metal zip",
      "Welt side pockets and inside pocket",
      "Regular fit",
      "Machine wash cold",
    ],
    sizes: sizeRun(MEN_SIZES, [4, 8, 5, 0, 2]),
    images: gallery("1591047139829-d91aecb6caea", "Satin Bomber Jacket", "Rust satin bomber jacket on a hanger"),
  },
  {
    slug: "open-knit-poncho",
    name: "Open-Knit Poncho",
    categorySlug: "women",
    priceCents: 520_00,
    color: "Ivory",
    colorCount: 2,
    description:
      "A hand-crocheted poncho in an open, airy stitch, finished with a long fringed hem. Designed to drape over knitwear or a slip dress.",
    details: ["70% cotton, 30% linen", "Hand-crocheted", "V-neckline; fringed hem", "One size", "Hand wash cold, dry flat"],
    sizes: oneSize(7),
    images: gallery("1434389677669-e08b4cac3105", "Open-Knit Poncho", "Ivory open-knit poncho with fringed hem"),
  },
  {
    slug: "belted-utility-playsuit",
    name: "Belted Utility Playsuit",
    categorySlug: "women",
    priceCents: 460_00,
    color: "Olive",
    colorCount: 1,
    isNew: true,
    description:
      "A summer playsuit in washed cotton twill with fine adjustable straps and a covered buckle belt. Relaxed through the leg with discreet side pockets.",
    details: [
      "100% organic cotton twill",
      "Adjustable straps; concealed back zip",
      "Removable covered-buckle belt",
      "Relaxed fit",
      "Machine wash cold",
    ],
    sizes: sizeRun(WOMEN_SIZES, [0, 0, 0, 0, 0]),
    images: gallery("1618932260643-eee4a2f652a6", "Belted Utility Playsuit", "Olive belted playsuit hanging against a white wall"),
  },
  {
    slug: "silk-jogger-trousers",
    name: "Silk Jogger Trousers",
    categorySlug: "women",
    priceCents: 590_00,
    color: "Blush",
    colorCount: 4,
    description:
      "Elevated joggers in sand-washed silk with an elasticated waist, front patch pockets and cuffed ankles. Equally at home with knitwear or tailoring.",
    details: [
      "100% silk",
      "Elasticated waist with drawcord",
      "Patch pockets; cuffed hem",
      "Relaxed fit, tapered leg",
      "Dry clean recommended",
    ],
    sizes: sizeRun(WOMEN_SIZES, [2, 5, 7, 3, 2]),
    images: gallery("1594633312681-425c7b97ccd1", "Silk Jogger Trousers", "Blush silk jogger trousers with cuffed ankles"),
  },
  {
    slug: "suede-ankle-boots",
    name: "Suede Ankle Boots",
    categorySlug: "shoes",
    priceCents: 690_00,
    color: "Tan",
    colorCount: 2,
    description:
      "Slouchy ankle boots in brushed calf suede with a stacked Cuban heel and almond toe. Leather-lined and set on a hand-stitched leather sole.",
    details: [
      "Calf suede upper; leather lining and sole",
      "45 mm stacked heel",
      "Pull-on style",
      "True to size",
      "Made in Italy",
    ],
    sizes: sizeRun(SHOE_SIZES, [1, 3, 4, 2, 0, 1]),
    images: gallery(
      "1467043237213-65f2da53396f",
      "Suede Ankle Boots",
      "Tan suede ankle boots laid out with folded denim and a tee",
      [
        [0.35, 0.75, 2.2],
        [0.32, 0.8, 3],
      ],
    ),
  },
  {
    slug: "floral-wrap-dress",
    name: "Floral Wrap Dress",
    categorySlug: "women",
    priceCents: 640_00,
    color: "Ivory Floral",
    colorCount: 1,
    description:
      "A fluid wrap dress in printed silk crêpe de chine, with flutter sleeves and a self-tie waist. The hand-painted rose print was developed in our studio.",
    details: [
      "100% silk crêpe de chine",
      "Self-tie wrap closure",
      "Flutter sleeves; midi length",
      "Fluid fit",
      "Dry clean only",
    ],
    sizes: sizeRun(WOMEN_SIZES, [0, 2, 1, 0, 0]),
    images: gallery("1496747611176-843222e1e57c", "Floral Wrap Dress", "Floral print wrap dress worn by the sea"),
  },
  {
    slug: "essential-cotton-tee",
    name: "Essential Cotton Tee",
    categorySlug: "men",
    priceCents: 120_00,
    color: "White",
    colorCount: 5,
    description:
      "The foundation of the wardrobe: a crew-neck tee in dense, long-staple cotton jersey that holds its shape wash after wash.",
    details: ["100% Supima cotton jersey", "Ribbed crew neck", "Regular fit", "Machine wash cold", "Made in Portugal"],
    sizes: sizeRun(MEN_SIZES, [12, 20, 18, 9, 4]),
    images: gallery("1521572163474-6864f9cf17ab", "Essential Cotton Tee", "Plain white crew-neck cotton t-shirt", [
      [0.5, 0.3, 2],
      [0.5, 0.22, 2.8],
    ]),
  },
  {
    slug: "contrast-stitch-tee",
    name: "Contrast-Stitch Tee",
    categorySlug: "men",
    priceCents: 140_00,
    color: "Black",
    colorCount: 2,
    description:
      "A boxy tee in heavyweight cotton, outlined with tonal-white top stitching at the neck, shoulders and sleeves.",
    details: ["100% cotton, 240 gsm", "Contrast top stitching", "Boxy fit, dropped shoulder", "Machine wash cold"],
    sizes: sizeRun(MEN_SIZES, [5, 8, 6, 3, 0]),
    images: gallery("1622519407650-3df9883f76a5", "Contrast-Stitch Tee", "Black t-shirt with contrast white stitching", [
      [0.5, 0.45, 2],
      [0.65, 0.4, 2.5],
    ]),
  },
  {
    slug: "tailored-wool-suit",
    name: "Tailored Wool Suit",
    categorySlug: "men",
    priceCents: 2200_00,
    color: "Navy",
    colorCount: 2,
    description:
      "A two-button suit in Italian Super 120s wool, half-canvassed for a natural roll to the lapel. Sold as a set with flat-front trousers.",
    details: [
      "100% Super 120s wool",
      "Half-canvas construction",
      "Notch lapel; working cuff buttons",
      "Slim fit; trousers unhemmed",
      "Dry clean only",
    ],
    sizes: sizeRun(TAILORING_SIZES, [2, 4, 3, 1, 0]),
    images: gallery("1507679799987-c73779587ccf", "Tailored Wool Suit", "Man buttoning a navy tailored wool suit jacket"),
  },
  {
    slug: "leather-rider-jacket",
    name: "Leather Rider Jacket",
    categorySlug: "men",
    priceCents: 1650_00,
    color: "Cognac",
    colorCount: 1,
    description:
      "A classic rider in vegetable-tanned calf leather with an asymmetric zip and belted waist, finished by hand to a warm cognac patina.",
    details: [
      "100% calf leather; viscose lining",
      "Antique-brass hardware",
      "Zip cuffs and belted hem",
      "Regular fit",
      "Specialist leather clean only",
    ],
    sizes: sizeRun(MEN_SIZES, [0, 0, 0, 0, 0]),
    images: gallery("1487222477894-8943e31ef7b2", "Leather Rider Jacket", "Man in a cognac leather rider jacket", [
      [0.5, 0.65, 2],
      [0.4, 0.75, 2.5],
    ]),
  },
  {
    slug: "brushed-cotton-sweatshirt",
    name: "Brushed Cotton Sweatshirt",
    categorySlug: "men",
    priceCents: 290_00,
    color: "Pale Pink",
    colorCount: 3,
    description:
      "A relaxed crew-neck sweatshirt in loopback cotton, brushed on the inside for a soft, lived-in hand.",
    details: ["100% organic cotton loopback", "Brushed interior", "Ribbed collar, cuffs and hem", "Relaxed fit", "Machine wash cold"],
    sizes: sizeRun(MEN_SIZES, [6, 9, 7, 4, 2]),
    images: gallery(
      "1516826957135-700dedea698c",
      "Brushed Cotton Sweatshirt",
      "Pale pink brushed cotton sweatshirt with light denim",
      [
        [0.4, 0.35, 2],
        [0.45, 0.45, 2.6],
      ],
    ),
  },
  {
    slug: "double-faced-wool-coat",
    name: "Double-Faced Wool Coat",
    categorySlug: "women",
    priceCents: 2400_00,
    color: "Powder Blue",
    colorCount: 2,
    description:
      "An oversized coat in double-faced wool and cashmere, constructed without lining so it falls light and soft from the shoulder.",
    details: [
      "90% wool, 10% cashmere",
      "Unlined double-faced construction",
      "Concealed button front",
      "Oversized fit; size down for a closer fit",
      "Dry clean only",
    ],
    sizes: sizeRun(WOMEN_SIZES, [1, 3, 3, 2, 1]),
    images: gallery("1539109136881-3be0616acf4b", "Double-Faced Wool Coat", "Woman in a powder blue double-faced wool coat"),
  },
];
