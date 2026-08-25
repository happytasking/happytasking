import Image from "next/image";
import Link from "next/link";
import { rem } from "@/lib/scale";

/**
 * Aspect ratios measured from the trimmed brand exports in public/brand.
 * Every lockup is sized by height so the artwork never distorts.
 */
const RATIO = {
  mark: 1,
  lockup: 4.92, // icon + HappyTasking wordmark
  full: 4.56, // icon + wordmark + tagline
  wordmark: 6.7,
  tagline: 35.29, // "— KNOW BEFORE YOU TASK —"
} as const;

function widthFor(kind: keyof typeof RATIO, height: number) {
  return Math.round(height * RATIO[kind]);
}

/**
 * Heights are authored in pixels for next/image's intrinsic sizing, then rendered
 * in rem so the brand scales with the UI scale instead of shrinking next to it.
 */
function boxFor(kind: keyof typeof RATIO, height: number) {
  return { height: rem(height), width: rem(widthFor(kind, height)) };
}

/** Illustrated app mark on its own — nav avatars, favicons, compact contexts. */
export function LogoMark({
  className = "",
  size = 32,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      priority={priority}
      style={{ height: rem(size), width: rem(size) }}
      aria-hidden="true"
    />
  );
}

/**
 * Icon + wordmark. The tagline is deliberately omitted here: at header scale it
 * renders under 4px tall in the real lockup, so it reads as noise rather than brand.
 */
export function BrandLockup({
  className = "",
  href = "/",
  height = 34,
  priority = false,
}: {
  className?: string;
  href?: string | null;
  height?: number;
  priority?: boolean;
}) {
  const art = (
    <Image
      src="/brand/logo-lockup.png"
      alt="Happy Tasking"
      width={widthFor("lockup", height)}
      height={height}
      priority={priority}
      className="h-auto w-auto"
      style={boxFor("lockup", height)}
    />
  );

  if (!href) {
    return <span className={`inline-flex shrink-0 ${className}`}>{art}</span>;
  }

  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="Happy Tasking home"
    >
      {art}
    </Link>
  );
}

/** Icon + wordmark + tagline, as drawn in the logo. Needs ~48px of height to stay legible. */
export function BrandFull({
  className = "",
  height = 56,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo-full.png"
      alt="Happy Tasking — Know before you task"
      width={widthFor("full", height)}
      height={height}
      priority={priority}
      className={`h-auto w-auto ${className}`}
      style={boxFor("full", height)}
    />
  );
}

/** The rule-flanked tagline on its own, for wide slots where the lockup would be redundant. */
export function BrandTagline({
  className = "",
  height = 14,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <Image
      src="/brand/logo-tagline.png"
      alt="Know before you task"
      width={widthFor("tagline", height)}
      height={height}
      className={`h-auto w-auto ${className}`}
      style={boxFor("tagline", height)}
    />
  );
}
