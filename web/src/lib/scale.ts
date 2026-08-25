/**
 * Component sizes are authored as pixel numbers against a 16px base, matching the
 * design tokens in globals.css. Emitting them as rem keeps avatars, logos, and
 * chart geometry locked to the `html { font-size }` UI scale instead of drifting
 * out of proportion with the type around them.
 */
const BASE_PX = 16;

/** Converts an authored pixel size into a rem length string. */
export function rem(px: number): string {
  return `${px / BASE_PX}rem`;
}

/**
 * Current pixel value of an authored size, for the few places that need a real
 * number (SVG coordinate systems, canvas, measured layout).
 */
export function scaledPx(px: number): number {
  if (typeof window === "undefined") return px;
  const root = parseFloat(
    getComputedStyle(document.documentElement).fontSize || `${BASE_PX}`,
  );
  return (px * root) / BASE_PX;
}
