import type { Metadata } from "next";

/** Canonical production origin. Sitemap, robots, and metadata must not emit localhost, IPs, or www. */
export const SITE_ORIGIN = "https://happytasking.com";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const PATH_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9-]{0,179}$/;

export function siteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
}

export function isIndexableSlug(value: string): boolean {
  return SAFE_SLUG.test(value) && value.length <= 180;
}

/** Path params that are safe to put in a canonical URL. */
export function isCanonicalSegment(value: string): boolean {
  return PATH_SEGMENT.test(value);
}

function canonicalPath(pathname: string): string {
  if (pathname === "/") return "/";
  return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
}

/** Self-referencing canonical resolved against https://happytasking.com. */
export function canonicalMetadata(pathname: string): Metadata {
  const path = canonicalPath(pathname);
  return {
    alternates: { canonical: path },
    openGraph: { url: path },
  };
}

/** Private surfaces should not inherit a public parent's canonical. */
export function privatePageMetadata(): Metadata {
  return {
    alternates: { canonical: null },
    robots: { index: false, follow: false },
  };
}
