"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";

/**
 * Horizontally scrolling, snap-aligned list of products. Children must be <li> elements.
 * Touch and trackpad scroll natively; the arrow buttons are for mouse users on wider screens.
 */
export function ProductRail({ label, children }: { label: string; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atEdge, setAtEdge] = useState({ start: true, end: false });

  function updateEdges() {
    const track = trackRef.current;
    if (!track) return;
    setAtEdge({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Fires once on observe, which sets the initial edge state.
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div>
      <ul
        ref={trackRef}
        aria-label={label}
        onScroll={updateEdges}
        className="bleed-mobile scrollbar-none flex snap-x snap-mandatory gap-x-grid-x overflow-x-auto scroll-px-gutter px-gutter md:scroll-px-0 md:px-0"
      >
        {children}
      </ul>
      <div className="mt-8 hidden justify-end gap-2 md:flex">
        <button
          type="button"
          className="btn btn-secondary btn-icon btn-sm"
          onClick={() => scrollByPage(-1)}
          disabled={atEdge.start}
        >
          <ArrowRightIcon className="rotate-180" />
          <span className="sr-only">Previous products</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-icon btn-sm"
          onClick={() => scrollByPage(1)}
          disabled={atEdge.end}
        >
          <ArrowRightIcon />
          <span className="sr-only">Next products</span>
        </button>
      </div>
    </div>
  );
}
