/** Canonical production origin. Sitemap, robots, and metadata must not emit localhost, IPs, or www. */
export const SITE_ORIGIN = "https://happytasking.com";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export function siteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
}

export function isIndexableSlug(value: string): boolean {
  return SAFE_SLUG.test(value) && value.length <= 180;
}
