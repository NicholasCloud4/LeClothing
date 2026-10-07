"use client";

import { HeartIcon } from "@/components/icons";
import { toggleWishlist, useWishlist } from "@/lib/wishlist";

type WishlistButtonProps = {
  productSlug: string;
  productName: string;
  /** `ghost` floats over product imagery; `secondary` sits beside primary actions. */
  variant?: "ghost" | "secondary";
  size?: "sm" | "lg";
  className?: string;
};

/** Saves the product to the browser wishlist (`@/lib/wishlist`). Unpressed until the client has read storage. */
export function WishlistButton({
  productSlug,
  productName,
  variant = "ghost",
  size = "sm",
  className = "",
}: WishlistButtonProps) {
  const saved = useWishlist().includes(productSlug);
  const variantClass = variant === "ghost" ? "btn-ghost hover:bg-background/70" : "btn-secondary";
  const sizeClass = size === "lg" ? "btn-lg w-14" : "btn-sm";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${productName} to wishlist`}
      onClick={() => toggleWishlist(productSlug)}
      className={`btn btn-icon ${variantClass} ${sizeClass} ${className}`}
    >
      <HeartIcon fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
