import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatIcon, GiftIcon, PlusIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductRail } from "@/components/product-rail";
import { SectionHeading } from "@/components/section-heading";
import { categoryHref, formatPrice, getTotalStock, isOneSize, productHref, type Product } from "@/lib/catalog";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/db/queries/catalog";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.images[0].src] },
  };
}

// Reading `params` happens inside Suspense so client navigations can show the skeleton shell
// instantly; direct visits are fully prerendered from generateStaticParams.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <>
      <ProductJsonLd product={product} />

      <nav aria-label="Breadcrumb" className="shell pt-4 lg:pt-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="link-muted">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={categoryHref(product.category)} className="link-muted">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="shell pt-4 pb-section lg:pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12 xl:gap-20">
          <div className="bleed-mobile">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      <section aria-labelledby="related-title" className="shell section border-t">
        <SectionHeading id="related-title" eyebrow="Complete the Look" title="You May Also Like" />
        <ProductRail label="You may also like">
          {related.map((item) => (
            <li
              key={item.slug}
              className="w-[72%] shrink-0 snap-start sm:w-[42%] md:w-[calc((100%-2*var(--grid-gap-x))/3)] xl:w-[calc((100%-3*var(--grid-gap-x))/4)]"
            >
              <ProductCard product={item} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 72vw" />
            </li>
          ))}
        </ProductRail>
      </section>
    </>
  );
}

/** Mirrors the page layout with muted blocks so the swap to real content doesn't shift anything. */
function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="animate-pulse">
      <div className="shell pt-4 lg:pt-6">
        <div className="h-4 w-48 bg-muted" />
      </div>
      <div className="shell pt-4 pb-section lg:pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12 xl:gap-20">
          <div className="bleed-mobile">
            <div className="media-frame" />
          </div>
          <div className="flex flex-col gap-4 lg:max-w-md">
            <div className="h-3 w-20 bg-muted" />
            <div className="h-8 w-3/4 bg-muted" />
            <div className="h-5 w-24 bg-muted" />
            <div className="mt-4 h-12 bg-muted" />
            <div className="h-14 rounded-button bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductInfo({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-6 lg:max-w-md">
      <header className="flex flex-col gap-3">
        <div className="eyebrow flex items-center gap-2 text-muted-foreground">
          <Link href={categoryHref(product.category)} className="link-muted">
            {product.category.name}
          </Link>
          {product.isNew && (
            <>
              <span aria-hidden="true">·</span>
              <span>New</span>
            </>
          )}
        </div>
        <h1 className="heading-2">{product.name}</h1>
        <p className="price text-lg">{formatPrice(product.priceCents)}</p>
        <p className="text-muted-foreground">
          Color: <span className="text-foreground">{product.color}</span>
          {product.colors > 1 && <> · Available in {product.colors} colors</>}
        </p>
      </header>

      <ProductPurchase productName={product.name} sizes={product.sizes} oneSize={isOneSize(product)} />

      <p className="text-muted-foreground">{product.description}</p>

      <ul className="space-y-3 border-y py-5">
        <li className="flex items-center gap-3">
          <TruckIcon className="shrink-0" />
          Complimentary shipping and returns
        </li>
        <li className="flex items-center gap-3">
          <GiftIcon className="shrink-0" />
          Signature gift wrapping available
        </li>
        <li className="flex items-center gap-3">
          <ChatIcon className="shrink-0" />
          <span>
            Questions?{" "}
            <Link href="/contact" className="link">
              Contact a client advisor
            </Link>
          </span>
        </li>
      </ul>

      <div className="-mt-6">
        <Disclosure title="Details & Care">
          <ul className="list-disc space-y-1.5 pl-5">
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure title="Delivery & Returns">
          <p>
            Complimentary standard delivery in 2–4 business days, or express next-day delivery. Returns and exchanges are
            free within 30 days of delivery.
          </p>
        </Disclosure>
      </div>
    </div>
  );
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon className="transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-muted-foreground">{children}</div>
    </details>
  );
}

/** Product structured data for search engines. */
function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.src),
    category: product.category.name,
    color: product.color,
    url: productHref(product),
    offers: {
      "@type": "Offer",
      price: product.priceCents / 100,
      priceCurrency: "USD",
      availability: `https://schema.org/${getTotalStock(product) > 0 ? "InStock" : "OutOfStock"}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so catalog text can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
