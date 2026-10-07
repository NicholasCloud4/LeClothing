// Storefront product types and pure helpers. Safe to import from client components.
// Products are loaded from the database by `@/lib/db/queries/catalog`.

export type CatalogImage = {
  src: string;
  alt: string;
};

export type ProductCategory = {
  slug: string;
  name: string;
};

export type Size = {
  label: string;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  /** Name of the color shown in the photography. */
  color: string;
  /** Total number of colorways the style comes in. */
  colors: number;
  description: string;
  details: string[];
  sizes: Size[];
  /** First image is the primary shot used on product cards. */
  images: CatalogImage[];
  isNew: boolean;
};

// ---------------------------------------------------------------------------
// Stock

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

export function formatPrice(cents: number) {
  return priceFormatter.format(cents / 100);
}

export function productHref(product: Product) {
  return `/products/${product.slug}`;
}

export function categoryHref(category: ProductCategory) {
  return `/collections/${category.slug}`;
}
