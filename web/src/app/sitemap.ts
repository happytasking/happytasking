import type { MetadataRoute } from "next";
import { isIndexableSlug, siteUrl } from "@/lib/site";

export const revalidate = 3600;

type SitemapEntry = { slug: string; lastModified: string };

type IndexableLists = {
  companies: SitemapEntry[];
  skills: SitemapEntry[];
  opportunities: SitemapEntry[];
};

const EMPTY: IndexableLists = {
  companies: [],
  skills: [],
  opportunities: [],
};

/**
 * Static public routes. Split into a sitemap index later if dynamic URLs
 * approach the ~50k single-file limit.
 */
const STATIC_ROUTES: Array<{
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicLists = await loadIndexableLists();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: siteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const companies = mapDynamic(
    dynamicLists.companies,
    (slug) => `/companies/${slug}`,
    0.8,
    "weekly",
  );
  const skills = mapDynamic(
    dynamicLists.skills,
    (slug) => `/skills/${slug}`,
    0.7,
    "weekly",
  );
  const opportunities = mapDynamic(
    dynamicLists.opportunities,
    (slug) => `/taskmatch/opportunities/${slug}`,
    0.7,
    "weekly",
  );

  return [...staticEntries, ...companies, ...skills, ...opportunities];
}

function mapDynamic(
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

async function loadIndexableLists(): Promise<IndexableLists> {
  const origin = process.env.API_PROXY_ORIGIN || "http://127.0.0.1:5000";
  try {
    const res = await fetch(`${origin}/api/v1/sitemap`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return EMPTY;
    const json = (await res.json()) as {
      success?: boolean;
      data?: IndexableLists | null;
    };
    if (!json.success || !json.data) return EMPTY;
    return {
      companies: Array.isArray(json.data.companies) ? json.data.companies : [],
      skills: Array.isArray(json.data.skills) ? json.data.skills : [],
      opportunities: Array.isArray(json.data.opportunities)
        ? json.data.opportunities
        : [],
    };
  } catch {
    return EMPTY;
  }
}
