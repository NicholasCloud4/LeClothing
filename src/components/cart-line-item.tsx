import Image from "next/image";
import Link from "next/link";
import { updateCartLine } from "@/lib/actions/cart";
import { lineIssue, lineTotalCents, MAX_LINE_QUANTITY, purchasableQuantity, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

type CartLineItemProps = {
  line: CartLine;
};

/** One bag line with a quantity stepper and Remove. Both are plain forms, so they work without client JS. */
export function CartLineItem({ line }: CartLineItemProps) {
  const quantity = purchasableQuantity(line);
  const issue = lineIssue(line);
  const maxQuantity = Math.min(line.available, MAX_LINE_QUANTITY);
  const href = `/products/${line.slug}`;

  return (
    <li className="grid grid-cols-[6rem_1fr] gap-4 py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
      <Link href={href} className="block">
        <div className="media-frame">
          {line.image && (
            <Image src={line.image.src} alt={line.image.alt} fill sizes="(min-width: 640px) 128px, 96px" />
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-sans text-sm tracking-body">
              <Link href={href} className="link-reveal">
                {line.name}
              </Link>
            </h2>
            <p className="text-muted-foreground">
              {line.color}
              {line.size !== "One size" && <> · Size {line.size}</>}
            </p>
            <p className="price text-muted-foreground">{formatPrice(line.unitPriceCents)}</p>
          </div>
          <p className="price">{formatPrice(lineTotalCents(line))}</p>
        </div>

        {issue === "unavailable" && (
          <p role="alert" className="text-danger">
            This size has sold out. Remove it to continue.
          </p>
        )}
        {issue === "reduced" && (
          <p role="alert" className="text-warning">
            Only {line.available} left in this size, so we&apos;ve reduced your quantity.
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4">
          {issue === "unavailable" ? (
            <span />
          ) : (
            <div className="inline-flex items-center border border-input">
              <StepperForm
                line={line}
                quantity={quantity - 1}
                label={`Decrease quantity of ${line.name}`}
                disabled={quantity <= 1}
              >
                −
              </StepperForm>
              <span aria-label={`Quantity ${quantity}`} className="w-8 text-center">
                {quantity}
              </span>
              <StepperForm
                line={line}
                quantity={quantity + 1}
                label={`Increase quantity of ${line.name}`}
                disabled={quantity >= maxQuantity}
              >
                +
              </StepperForm>
            </div>
          )}

          <form action={updateCartLine}>
            <LineFields line={line} quantity={0} />
            <button type="submit" className="link-muted" aria-label={`Remove ${line.name} from your bag`}>
              Remove
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

function LineFields({ line, quantity }: { line: CartLine; quantity: number }) {
  return (
    <>
      <input type="hidden" name="productId" value={line.productId} />
      <input type="hidden" name="size" value={line.size} />
      <input type="hidden" name="quantity" value={quantity} />
    </>
  );
}

function StepperForm({
  line,
  quantity,
  label,
  disabled,
  children,
}: {
  line: CartLine;
  quantity: number;
  label: string;
  disabled: boolean;
  children: string;
}) {
  return (
    <form action={updateCartLine}>
      <LineFields line={line} quantity={quantity} />
      <button
        type="submit"
        aria-label={label}
        disabled={disabled}
        className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:text-subtle-foreground disabled:hover:bg-transparent"
      >
        {children}
      </button>
    </form>
  );
}
