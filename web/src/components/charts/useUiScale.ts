"use client";

import { useEffect, useState } from "react";

const BASE_PX = 16;

/**
 * Ratio between the current root font size and the 16px base that chart geometry
 * is authored against.
 *
 * Charts draw at 1 SVG unit = 1 CSS pixel, so unlike the rem-based CSS elsewhere
 * they do not inherit the UI scale set on `html` in globals.css and have to opt in.
 * Returns 1 during server render and on the first paint, then settles — the same
 * shape as `useChartWidth`, which already re-renders these charts after mount.
 */
export function useUiScale(): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const read = () => {
      const px = parseFloat(
        getComputedStyle(document.documentElement).fontSize || `${BASE_PX}`,
      );
      if (px > 0) setScale(px / BASE_PX);
    };

    read();
    // Root font size can change with a browser text-size preference.
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return scale;
}
