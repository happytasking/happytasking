"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Charts render at 1 SVG unit = 1 CSS pixel so labels stay crisp and correctly
 * sized at any breakpoint, which a stretched viewBox cannot do.
 */
export function useChartWidth(fallback = 720) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = el.clientWidth;
      if (next > 0) setWidth(next);
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
