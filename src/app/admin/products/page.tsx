import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminStockForm } from "@/components/admin-stock-form";
import { StockStatus } from "@/components/stock-status";
import { requireAdmin } from "@/lib/auth-session";
import { formatPrice } from "@/lib/catalog";
import { getAdminProducts, getProductEditor, type AdminProductSummary } from "@/lib/db/queries/admin-catalog";
import { formatDollars, formatImageLines } from "@/lib/product-form";

export const metadata: Metadata = { title: "Products", robots: { index: false } };

// The editor is `?edit=<id>` on this page rather than a `[id]` route, so it needs no `generateStaticParams`.
export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Loading products" className="h-64 animate-pulse bg-muted" />}>
      <AdminProducts searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminProducts({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  await requireAdmin("/admin/products");
  const { edit } = await searchParams;

  if (typeof edit === "string") {
    const id = Number(edit);
    if (!Number.isInteger(id) || id <= 0) notFound();
    return <ProductEditor id={id} />;
  }

  const products = await getAdminProducts();
  return <ProductTable products={products} />;
}

function ProductTable({ products }: { products: AdminProductSummary[] }) {
  if (products.length === 0) return <p className="text-muted-foreground">There are no products yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl text-left">
        <thead className="text-sm text-muted-foreground">
          <tr className="border-b">
            <th scope="col" className="py-3 pr-4 font-normal">
              Product
            </th>
            <th scope="col" className="py-3 pr-4 font-normal">
              Category
            </th>
            <th scope="col" className="py-3 pr-4 font-normal">
              Price
            </th>
            <th scope="col" className="py-3 font-normal">
              Stock
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const [image] = product.images;
            const units = product.stock.reduce((total, row) => total + row.quantity, 0);
            return (
              <tr key={product.id} className="border-b">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-15 w-12 shrink-0 bg-muted">
                      {image && <Image src={image.url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <Link href={`/admin/products?edit=${product.id}`} className="link">
                      {product.name}
                    </Link>
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{product.category.name}</td>
                <td className="py-3 pr-4 tabular-nums">{formatPrice(product.priceCents)}</td>
                <td className="py-3">
                  <StockStatus units={units} className="text-sm" />
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {product.stock.map((row) => `${row.size} ${row.quantity}`).join(" · ")}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

async function ProductEditor({ id }: { id: number }) {
  const editor = await getProductEditor(id);
  if (!editor) notFound();
  const { product, categories, stock } = editor;

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <Link href="/admin/products" className="link-muted self-start text-sm">
          &larr; All products
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="heading-2">{product.name}</h2>
          <Link href={`/products/${product.slug}`} className="link text-sm">
            View in store
          </Link>
        </div>
      </div>

      <section aria-labelledby="stock-title">
        <h3 id="stock-title" className="heading-3 mb-5">
          Stock
        </h3>
        <AdminStockForm key={product.id} productId={product.id} rows={stock} />
      </section>

      <section aria-labelledby="details-title">
        <h3 id="details-title" className="heading-3 mb-5">
          Details
        </h3>
        <AdminProductForm
          key={product.id}
          id={product.id}
          categories={categories}
          initialValues={{
            name: product.name,
            categoryId: String(product.categoryId),
            price: formatDollars(product.priceCents),
            color: product.color,
            colorCount: String(product.colorCount),
            description: product.description,
            details: product.details.join("\n"),
            images: formatImageLines(product.images),
            isNew: product.isNew ? "on" : "",
          }}
        />
      </section>
    </div>
  );
}
