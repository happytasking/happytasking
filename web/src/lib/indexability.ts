import { cache } from "react";
import type { MetadataRoute } from "next";
import { isIndexableSlug, siteUrl } from "./site";

/** Account, compose, and staff surfaces — never index, never sitemap. */
export const PRIVATE_PREFIXES = [
  "/login",
  "/register",
  "/onboarding",
  "/profile",
  "/moderation",
  "/taskmatch/profile",
  "/reviews/new",
  "/issues/new",
] as const;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Paths Google should not spend crawl budget on. Includes /api/ after Sprint 0 SSR. */
export function robotsDisallowPaths(): string[] {
  return ["/api/", ...PRIVATE_PREFIXES];
}

/**
 * Static URLs that are eligible for the index. This list is the sitemap
 * static section — do not add a noindex page here.
 */
export const STATIC_PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/companies", changeFrequency: "daily", priority: 0.9 },
  { path: "/compare", changeFrequency: "weekly", priority: 0.8 },
  { path: "/community", changeFrequency: "daily", priority: 0.8 },
  { path: "/market", changeFrequency: "hourly", priority: 0.8 },
  { path: "/issues", changeFrequency: "daily", priority: 0.8 },
  { path: "/taskmatch", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/manifesto", changeFrequency: "monthly", priority: 0.6 },
  { path: "/methodology", changeFrequency: "monthly", priority: 0.6 },
  { path: "/governance", changeFrequency: "monthly", priority: 0.6 },
  { path: "/open-source", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-companies", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-for-contributors", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.5 },
];

export type SitemapCollection = "companies" | "skills" | "opportunities";

export type SitemapEntry = { slug: string; lastModified: string };

export type IndexableLists = {
  companies: SitemapEntry[];
  skills: SitemapEntry[];
  opportunities: SitemapEntry[];
  /** False when the upstream sitemap API could not be read. */
  fetched: boolean;
};

const EMPTY: IndexableLists = {
  companies: [],
  skills: [],
  opportunities: [],
  fetched: false,
};

export const SITEMAP_REVALIDATE = 3600;

/**
 * Dynamic indexability comes from the API that also feeds sitemap.xml.
 * Demo, inactive, and empty shells are omitted server-side.
 */
export const loadIndexableLists = cache(
  async (): Promise<IndexableLists> => {
    const origin = process.env.API_PROXY_ORIGIN || "http://127.0.0.1:5000";
    try {
      const res = await fetch(`${origin}/api/v1/sitemap`, {
        headers: { Accept: "application/json" },
        next: { revalidate: SITEMAP_REVALIDATE },
      });
      if (!res.ok) return EMPTY;
      const json = (await res.json()) as {
        success?: boolean;
        data?: Omit<IndexableLists, "fetched"> | null;
      };
      if (!json.success || !json.data) return EMPTY;
      return {
        companies: Array.isArray(json.data.companies) ? json.data.companies : [],
        skills: Array.isArray(json.data.skills) ? json.data.skills : [],
        opportunities: Array.isArray(json.data.opportunities)
          ? json.data.opportunities
          : [],
        fetched: true,
      };
    } catch {
      return EMPTY;
    }
  },
);

export async function isListedInSitemap(
  collection: SitemapCollection,
  slug: string,
): Promise<boolean> {
  if (!isIndexableSlug(slug)) return false;
  const lists = await loadIndexableLists();
  return lists[collection].some((entry) => entry.slug === slug);
}

/**
 * Resource URLs (company, opportunity, skill) are indexable iff they would
 * appear in the sitemap. Demo rows are never listed. `isDemo` is a second
 * lock so a sitemap bug cannot index illustrative intelligence.
 */
export async function mayIndexListedResource(
  collection: SitemapCollection,
  slug: string,
  isDemo: boolean,
): Promise<boolean> {
  if (isDemo) return false;
  return isListedInSitemap(collection, slug);
}

export function mapSitemapEntries(
  entries: SitemapEntry[],
  pathFor: (slug: string) => string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
): MetadataRoute.Sitemap {
  return entries
    .filter((entry) => isIndexableSlug(entry.slug))
    .map((entry) => ({
      url: siteUrl(pathFor(entry.slug)),
      lastModified: parseDate(entry.lastModified),
      changeFrequency,
      priority,
    }));
}

function parseDate(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function staticSitemapEntries(): MetadataRoute.Sitemap {
  return STATIC_PUBLIC_ROUTES.map((route) => ({
    url: siteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
