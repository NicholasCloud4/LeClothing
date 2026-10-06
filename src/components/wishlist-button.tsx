"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/icons";

type WishlistButtonProps = {
  productName: string;
  /** `ghost` floats over product imagery; `secondary` sits beside primary actions. */
  variant?: "ghost" | "secondary";
  size?: "sm" | "lg";
  className?: string;
};

export function WishlistButton({ productName, variant = "ghost", size = "sm", className = "" }: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);
  const variantClass = variant === "ghost" ? "btn-ghost hover:bg-background/70" : "btn-secondary";
  const sizeClass = size === "lg" ? "btn-lg w-14" : "btn-sm";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${productName} to wishlist`}
      onClick={() => setSaved((value) => !value)}
      className={`btn btn-icon ${variantClass} ${sizeClass} ${className}`}
    >
      <HeartIcon fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
