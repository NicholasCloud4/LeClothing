// Sample catalog used by the storefront until products come from the database.
// Images are Unsplash photos, cropped server-side by Unsplash's image CDN.

export type CatalogImage = {
  src: string;
  alt: string;
};

export type ProductCategory = "Women" | "Men" | "Shoes" | "Bags";

export type Size = {
  label: string;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  /** Name of the color shown in the photography. */
  color: string;
  /** Total number of colorways the style comes in. */
  colors: number;
  description: string;
  details: string[];
  sizes: Size[];
  /** First image is the primary shot used on product cards. */
  images: CatalogImage[];
  isNew?: boolean;
};

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

// ---------------------------------------------------------------------------
// Images

function unsplash(id: string, width: number, height: number, crop = "crop=faces,entropy") {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&${crop}&w=${width}&h=${height}&q=80`;
}

/** Portrait shot matching the 3:4 `aspect-product` frame. */
function productShot(id: string, alt: string): CatalogImage {
  return { src: unsplash(id, 1200, 1600), alt };
}

/** Focal point for a zoomed detail crop: x/y as 0–1 fractions of the photo, z as zoom factor. */
type Focus = [x: number, y: number, zoom: number];

const DEFAULT_DETAILS: Focus[] = [
  [0.5, 0.3, 2],
  [0.5, 0.7, 2],
];

/** Primary shot plus close-up crops of the same photo, until real multi-angle photography exists. */
function gallery(id: string, name: string, alt: string, details: Focus[] = DEFAULT_DETAILS): CatalogImage[] {
  return [
    productShot(id, alt),
    ...details.map(([x, y, zoom], index) => ({
      src: unsplash(id, 1200, 1600, `crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}`),
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

function sizeRun(labels: string[], stock: number[]): Size[] {
  return labels.map((label, index) => ({ label, stock: stock[index] ?? 0 }));
}

function oneSize(stock: number): Size[] {
  return [{ label: "One size", stock }];
}

/** At or below this many units, a product or size is flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 3;

export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export function getStockState(units: number): StockState {
  if (units <= 0) return "out_of_stock";
  if (units <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function getTotalStock(product: Product) {
  return product.sizes.reduce((total, size) => total + size.stock, 0);
}

export function isOneSize(product: Product) {
  return product.sizes.length === 1 && product.sizes[0].label === "One size";
}

// ---------------------------------------------------------------------------
// Formatting and routes

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number) {
  return priceFormatter.format(amount);
}

export function productHref(product: Product) {
  return `/products/${product.slug}`;
}

export function categoryHref(category: ProductCategory) {
  return `/collections/${category.toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Products

export const products: Product[] = [
  {
    slug: "belted-wool-coat",
    name: "Belted Wool Coat",
    category: "Women",
    price: 1450,
    color: "Camel",
    colors: 2,
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
    category: "Women",
    price: 1890,
    color: "Black",
    colors: 1,
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
    category: "Men",
    price: 780,
    color: "Rust",
    colors: 3,
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
    category: "Women",
    price: 520,
    color: "Ivory",
    colors: 2,
    description:
      "A hand-crocheted poncho in an open, airy stitch, finished with a long fringed hem. Designed to drape over knitwear or a slip dress.",
    details: ["70% cotton, 30% linen", "Hand-crocheted", "V-neckline; fringed hem", "One size", "Hand wash cold, dry flat"],
    sizes: oneSize(7),
    images: gallery("1434389677669-e08b4cac3105", "Open-Knit Poncho", "Ivory open-knit poncho with fringed hem"),
  },
  {
    slug: "belted-utility-playsuit",
    name: "Belted Utility Playsuit",
    category: "Women",
    price: 460,
    color: "Olive",
    colors: 1,
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
    category: "Women",
    price: 590,
    color: "Blush",
    colors: 4,
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
    category: "Shoes",
    price: 690,
    color: "Tan",
    colors: 2,
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
    category: "Women",
    price: 640,
    color: "Ivory Floral",
    colors: 1,
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
    category: "Men",
    price: 120,
    color: "White",
    colors: 5,
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
    category: "Men",
    price: 140,
    color: "Black",
    colors: 2,
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
    category: "Men",
    price: 2200,
    color: "Navy",
    colors: 2,
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
    category: "Men",
    price: 1650,
    color: "Cognac",
    colors: 1,
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
    category: "Men",
    price: 290,
    color: "Pale Pink",
    colors: 3,
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
    category: "Women",
    price: 2400,
    color: "Powder Blue",
    colors: 2,
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

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

function pick(slugs: string[]) {
  return slugs.map((slug) => {
    const product = getProduct(slug);
    if (!product) throw new Error(`Unknown product slug in catalog selection: ${slug}`);
    return product;
  });
}

/** Same-category styles first, then the rest of the catalog. */
export function getRelatedProducts(product: Product, limit = 8) {
  const others = products.filter((candidate) => candidate.slug !== product.slug);
  const sameCategory = others.filter((candidate) => candidate.category === product.category);
  const rest = others.filter((candidate) => candidate.category !== product.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export const newArrivals = pick([
  "belted-wool-coat",
  "leather-biker-jacket",
  "satin-bomber-jacket",
  "open-knit-poncho",
  "belted-utility-playsuit",
  "silk-jogger-trousers",
  "suede-ankle-boots",
  "floral-wrap-dress",
]);

export const essentials = pick([
  "essential-cotton-tee",
  "contrast-stitch-tee",
  "tailored-wool-suit",
  "leather-rider-jacket",
  "brushed-cotton-sweatshirt",
  "double-faced-wool-coat",
]);

// ---------------------------------------------------------------------------
// Homepage content

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
