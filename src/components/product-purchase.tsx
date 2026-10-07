"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { CheckIcon } from "@/components/icons";
import { StockStatus } from "@/components/stock-status";
import { WishlistButton } from "@/components/wishlist-button";
import { addToCart } from "@/lib/actions/cart";
import type { Size } from "@/lib/catalog";

type ProductPurchaseProps = {
  productSlug: string;
  productName: string;
  sizes: Size[];
  oneSize: boolean;
};

/**
 * Size selection, live stock messaging and bag actions. "Add to bag" saves to the cart; "Notify me" still only
 * confirms locally.
 */
export function ProductPurchase({ productSlug, productName, sizes, oneSize }: ProductPurchaseProps) {
  const totalStock = sizes.reduce((total, size) => total + size.stock, 0);
  const soldOut = totalStock === 0;

  const [selectedLabel, setSelectedLabel] = useState<string | null>(oneSize && !soldOut ? sizes[0].label : null);
  const [missingSize, setMissingSize] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [notifyRequested, setNotifyRequested] = useState(false);
  const sizeGroupRef = useRef<HTMLDivElement>(null);

  const selected = sizes.find((size) => size.label === selectedLabel);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [added]);

  function selectSize(label: string) {
    setSelectedLabel(label);
    setMissingSize(false);
    setAddError(null);
    setAdded(false);
  }

  function addToBag() {
    if (!selected) {
      setMissingSize(true);
      sizeGroupRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
      return;
    }
    setAddError(null);
    startTransition(async () => {
      const result = await addToCart(productSlug, selected.label);
      if (result.ok) {
        setAdded(true);
      } else {
        setAdded(false);
        setAddError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {!oneSize && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p id="size-label" className="eyebrow">
              Size{selected && <span className="ml-2 font-normal tracking-body normal-case">{selected.label}</span>}
            </p>
            <Link href="/help/size-guide" className="link text-xs">
              Size guide
            </Link>
          </div>
          <div
            ref={sizeGroupRef}
            role="radiogroup"
            aria-labelledby="size-label"
            aria-describedby="stock-message"
            className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2"
          >
            {sizes.map((size) => (
              <label
                key={size.label}
                className="flex h-12 cursor-pointer items-center justify-center rounded-field border border-input text-sm transition-colors hover:border-foreground has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground has-disabled:cursor-not-allowed has-disabled:border-border has-disabled:text-subtle-foreground has-disabled:line-through has-disabled:hover:border-border"
              >
                <input
                  type="radio"
                  name="size"
                  value={size.label}
                  checked={selectedLabel === size.label}
                  disabled={size.stock === 0}
                  onChange={() => selectSize(size.label)}
                  className="sr-only"
                />
                {size.label}
                {size.stock === 0 && <span className="sr-only">, out of stock</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      <div id="stock-message" aria-live="polite" className="min-h-5">
        {missingSize ? (
          <p className="text-danger">Please select a size.</p>
        ) : addError ? (
          <p className="text-danger">{addError}</p>
        ) : selected && !oneSize ? (
          <StockStatus units={selected.stock} suffix={`in size ${selected.label}`} />
        ) : (
          <StockStatus units={totalStock} />
        )}
      </div>

      <div className="flex gap-2">
        {soldOut ? (
          notifyRequested ? (
            <p role="status" className="flex h-14 flex-1 items-center gap-2">
              <CheckIcon /> We&apos;ll email you when it&apos;s back.
            </p>
          ) : (
            <button type="button" className="btn btn-secondary btn-lg flex-1" onClick={() => setNotifyRequested(true)}>
              Notify me when available
            </button>
          )
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg flex-1"
            onClick={addToBag}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              "Adding…"
            ) : added ? (
              <>
                <CheckIcon /> Added to bag
              </>
            ) : (
              "Add to bag"
            )}
          </button>
        )}
        <WishlistButton productName={productName} variant="secondary" size="lg" />
      </div>

      <p role="status" className="sr-only">
        {added ? `${productName}, size ${selected?.label}, added to your bag.` : ""}
      </p>
    </div>
  );
}
