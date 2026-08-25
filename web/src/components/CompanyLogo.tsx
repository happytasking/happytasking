"use client";

import { useEffect, useState } from "react";
import { rem } from "@/lib/scale";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Brand assets are a mix of square marks (Mercor, Outlier) and very wide
 * wordmarks (Remotasks is 6.5:1), so every size carries both a cap height and
 * the width a wordmark may occupy.
 */
const SIZES: Record<Size, { height: number; slot: number; text: string; radius: string }> = {
  xs: { height: 18, slot: 62, text: "text-[0.53125rem]", radius: "rounded-[0.3125rem]" },
  sm: { height: 24, slot: 92, text: "text-[0.625rem]", radius: "rounded-md" },
  md: { height: 28, slot: 104, text: "text-[0.6875rem]", radius: "rounded-lg" },
  lg: { height: 40, slot: 156, text: "text-[0.9375rem]", radius: "rounded-xl" },
  xl: { height: 52, slot: 210, text: "text-[1.1875rem]", radius: "rounded-2xl" },
};

/**
 * Above this ratio an asset is a wordmark or a stacked lockup, neither of which
 * stays readable in the square marks used inside dense text rows.
 */
const WORDMARK_RATIO = 1.5;

/** Deterministic hue so a company without a logo always gets the same colour. */
function monogramStyle(name: string) {
  const seed = name
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const hue = seed % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 46% 46%), hsl(${(hue + 28) % 360} 44% 30%))`,
  };
}

function initials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

type Fit = "slot" | "auto" | "mark";

type Props = {
  name: string;
  logoUrl?: string | null;
  size?: Size;
  /**
   * `slot` reserves a fixed width so names stay aligned down a list, `auto`
   * takes only the width the aspect ratio needs, and `mark` forces a square —
   * falling back to the monogram for wordmarks, which a square would shrink
   * into an unreadable sliver.
   */
  fit?: Fit;
  className?: string;
};

export function CompanyLogo({
  name,
  logoUrl,
  size = "md",
  fit = "slot",
  className = "",
}: Props) {
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  const { height: heightPx, slot: slotPx, text, radius } = SIZES[size];
  const height = rem(heightPx);
  const slot = rem(slotPx);

  useEffect(() => {
    setFailed(false);
    setRatio(null);
    if (!logoUrl || fit !== "mark") return;
    // In `mark` fit the shape of the asset decides whether it can be used at
    // all, so measure it before rendering to avoid a monogram/logo flicker.
    const probe = new Image();
    probe.onload = () => setRatio(probe.naturalWidth / Math.max(1, probe.naturalHeight));
    probe.onerror = () => setFailed(true);
    probe.src = logoUrl;
  }, [logoUrl, fit]);

  const monogram = (
    <span
      className={`${radius} inline-flex shrink-0 items-center justify-center font-bold tracking-tight text-white ${text}`}
      style={{ height, width: height, ...monogramStyle(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );

  if (fit === "mark") {
    const usable = !!logoUrl && !failed && ratio != null && ratio <= WORDMARK_RATIO;
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ height, width: height }}
      >
        {usable ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl!}
            alt={`${name} logo`}
            className="max-h-full max-w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : ratio == null && logoUrl && !failed ? (
          <span className={`${radius} h-full w-full bg-surface-2`} aria-hidden="true" />
        ) : (
          monogram
        )}
      </span>
    );
  }

  if (!logoUrl || failed) {
    if (fit === "auto") return <span className={`inline-flex ${className}`}>{monogram}</span>;
    return (
      <span
        className={`inline-flex shrink-0 items-center ${className}`}
        style={{ height, width: slot }}
      >
        {monogram}
      </span>
    );
  }

  if (fit === "auto") {
    return (
      <span className={`inline-flex shrink-0 items-center ${className}`} style={{ height }}>
        {/* Logos are arbitrary remote or local assets, so plain img avoids loader config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-auto object-contain object-left"
          // minWidth keeps a square's worth of space while the asset is still
          // loading, so the row does not reflow around a zero-width image.
          style={{ height, maxWidth: slot, minWidth: height }}
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      style={{ height, width: slot }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="max-h-full max-w-full object-contain object-left"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
