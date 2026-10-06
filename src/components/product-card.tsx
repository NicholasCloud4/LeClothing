import Image from "next/image";
import Link from "next/link";
import { formatPrice, getTotalStock, productHref, type Product } from "@/lib/catalog";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product, sizes }: { product: Product; sizes: string }) {
  const [image] = product.images;
  const soldOut = getTotalStock(product) === 0;
  const label = soldOut ? "Sold out" : product.isNew ? "New" : null;

  return (
    <article className="group relative">
      <Link href={productHref(product)} className="block">
        <div className="media-frame">
          <Image src={image.src} alt={image.alt} fill sizes={sizes} />
        </div>
        <div className="mt-3 space-y-1">
          {label && <p className="eyebrow text-2xs text-muted-foreground">{label}</p>}
          <h3 className="font-sans text-sm tracking-body">{product.name}</h3>
          <p className="price text-muted-foreground">
            {formatPrice(product.price)}
            {product.colors > 1 && <span className="ml-2">· {product.colors} colors</span>}
          </p>
        </div>
      </Link>
      <WishlistButton productName={product.name} className="absolute top-2 right-2" />
    </article>
  );
}
