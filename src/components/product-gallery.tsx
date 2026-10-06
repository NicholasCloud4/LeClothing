"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CatalogImage } from "@/lib/catalog";

/**
 * Phones: full-bleed swipeable carousel with position dots.
 * Desktop (lg+): editorial grid with the primary shot spanning both columns.
 */
export function ProductGallery({ images, productName }: { images: CatalogImage[]; productName: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  function showImage(index: number) {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <ul
        ref={trackRef}
        aria-label={`${productName} images`}
        onScroll={handleScroll}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-grid-x lg:overflow-visible"
      >
        {images.map((image, index) => (
          <li key={image.src} className={`w-full shrink-0 snap-start ${index === 0 ? "lg:col-span-2" : ""}`}>
            <div className="media-frame">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={index === 0 ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
                {...(index === 0 && { loading: "eager", fetchPriority: "high" })}
              />
            </div>
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div className="flex justify-center gap-1 pt-3 lg:hidden">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              onClick={() => showImage(index)}
              className="group/dot p-2"
            >
              <span
                className={`block size-1.5 rounded-full transition-colors ${
                  index === active ? "bg-foreground" : "bg-subtle-foreground/50 group-hover/dot:bg-subtle-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
