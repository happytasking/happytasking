"use client";

import { rem } from "@/lib/scale";

type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, { px: number; text: string }> = {
  xs: { px: 24, text: "text-[0.5625rem]" },
  sm: { px: 32, text: "text-[0.6875rem]" },
  md: { px: 40, text: "text-[0.8125rem]" },
  lg: { px: 48, text: "text-[0.9375rem]" },
};

function hueFrom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 360;
  return h;
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

type Props = {
  name?: string | null;
  /** When true, show a neutral anonymous mark instead of initials. */
  anonymous?: boolean;
  size?: Size;
  className?: string;
};

/**
 * Circular people avatar. Uses deterministic initials when a name is known;
 * otherwise a quiet anonymous glyph for identity-protected posts.
 */
export function UserAvatar({
  name,
  anonymous = false,
  size = "md",
  className = "",
}: Props) {
  const { px, text } = SIZES[size];
  const label = (name || "").trim();

  if (anonymous || !label) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-subtle ring-1 ring-border ${className}`}
        style={{ width: rem(px), height: rem(px) }}
        aria-hidden="true"
        title="Identity protected"
      >
        <svg
          width={rem(px * 0.45)}
          height={rem(px * 0.45)}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-2.67 0-8 1.34-8 4V15h16v-1.5c0-2.66-5.33-4-8-4Z" />
        </svg>
      </span>
    );
  }

  const hue = hueFrom(label);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight text-white ${text} ${className}`}
      style={{
        width: rem(px),
        height: rem(px),
        background: `linear-gradient(135deg, hsl(${hue} 48% 48%), hsl(${(hue + 32) % 360} 42% 32%))`,
      }}
      aria-hidden="true"
      title={label}
    >
      {initials(label)}
    </span>
  );
}

/** Prefer display name, then username, for avatar labels. */
export function authorName(
  author?: { displayName?: string | null; username?: string | null } | null,
): string {
  return author?.displayName?.trim() || author?.username?.trim() || "Community member";
}
