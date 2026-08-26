import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import {
  EDITORIAL_AUTHOR,
  GUIDE_CATEGORIES,
  estimateReadingMinutes,
  guideSEOEligibility,
  isPublicGuideStatus,
  type GuideCategory,
  type GuideSeoEligibility,
  type GuideSource,
  type GuideStatus,
} from "./guideSeo";

export type Guide = {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  author: string;
  authorUrl?: string;
  datePublished: string;
  dateModified: string;
  category: GuideCategory | string;
  tags: string[];
  heroImage?: string;
  ogImage?: string;
  status: GuideStatus | string;
  featured: boolean;
  indexable: boolean;
  demo: boolean;
  readingTime: number;
  relatedCompanies: string[];
  relatedSkills: string[];
  relatedGuides: string[];
  sources: GuideSource[];
  body: string;
  filename: string;
  seo: GuideSeoEligibility;
};

function toIsoDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : raw;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function toSources(value: unknown): GuideSource[] {
  if (!Array.isArray(value)) return [];
  const sources: GuideSource[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = String(row.title || "").trim();
    if (!title) continue;
    const url = row.url ? String(row.url).trim() : "";
    const kind = row.kind ? String(row.kind).trim() : "";
    sources.push({
      title,
      ...(url ? { url } : {}),
      ...(kind === "official" ||
      kind === "methodology" ||
      kind === "community" ||
      kind === "external"
        ? { kind }
        : {}),
    });
  }
  return sources;
}

export function guidesContentDir(): string {
  const candidates = [
    path.join(process.cwd(), "content", "guides"),
    path.join(process.cwd(), "..", "content", "guides"),
  ];
  return candidates.find((dir) => fs.existsSync(dir)) || candidates[1];
}

export function parseGuideFile(filename: string, raw: string): Guide {
  const filenameSlug = filename.replace(/\.mdx$/i, "").toLowerCase();
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const body = parsed.content.trim();
  const slug = String(data.slug || filenameSlug)
    .trim()
    .toLowerCase();
  const title = String(data.title || "").trim();
  const description = String(data.description || "").trim();
  const datePublished = toIsoDate(data.datePublished);
  const dateModified = toIsoDate(data.dateModified) || datePublished;
  const status = String(data.status || "draft").trim().toLowerCase();
  const categoryRaw = String(data.category || "").trim();
  const category =
    (GUIDE_CATEGORIES as readonly string[]).includes(categoryRaw)
      ? categoryRaw
      : categoryRaw;
  const readingOverride = Number(data.readingTime);
  const guide: Guide = {
    title,
    slug,
    description,
    excerpt: String(data.excerpt || description).trim(),
    author: String(data.author || EDITORIAL_AUTHOR).trim(),
    authorUrl: data.authorUrl ? String(data.authorUrl).trim() : undefined,
    datePublished,
    dateModified,
    category,
    tags: toStringArray(data.tags),
    heroImage: data.heroImage ? String(data.heroImage).trim() : undefined,
    ogImage: data.ogImage ? String(data.ogImage).trim() : undefined,
    status,
    featured: Boolean(data.featured),
    indexable: data.indexable !== false,
    demo: Boolean(data.demo),
    readingTime:
      Number.isFinite(readingOverride) && readingOverride > 0
        ? Math.round(readingOverride)
        : estimateReadingMinutes(body),
    relatedCompanies: toStringArray(data.relatedCompanies),
    relatedSkills: toStringArray(data.relatedSkills),
    relatedGuides: toStringArray(data.relatedGuides),
    sources: toSources(data.sources),
    body,
    filename,
    seo: {
      indexable: false,
      includeInSitemap: false,
      reasons: [],
    },
  };
  guide.seo = guideSEOEligibility({
    title: guide.title,
    slug: guide.slug,
    filenameSlug,
    description: guide.description,
    author: guide.author,
    datePublished: guide.datePublished,
    status: guide.status,
    demo: guide.demo,
    indexable: guide.indexable,
    body: guide.body,
  });
  return guide;
}

export const loadAllGuides = cache(async (): Promise<Guide[]> => {
  const dir = guidesContentDir();
  if (!fs.existsSync(dir)) return [];
  const names = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx") && !name.startsWith("_") && !name.startsWith("."));
  const seen = new Map<string, string>();
  const guides: Guide[] = [];
  for (const name of names) {
    try {
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const guide = parseGuideFile(name, raw);
      const previous = seen.get(guide.slug);
      if (previous) {
        guide.seo = guideSEOEligibility({
          title: guide.title,
          slug: guide.slug,
          filenameSlug: name.replace(/\.mdx$/i, ""),
          description: guide.description,
          author: guide.author,
          datePublished: guide.datePublished,
          status: guide.status,
          demo: guide.demo,
          indexable: guide.indexable,
          body: guide.body,
          duplicate: true,
        });
      } else {
        seen.set(guide.slug, name);
      }
      guides.push(guide);
    } catch {
      continue;
    }
  }
  return guides.sort((a, b) =>
    b.dateModified.localeCompare(a.dateModified, "en"),
  );
});

export const loadPublishedGuides = cache(async (): Promise<Guide[]> => {
  const all = await loadAllGuides();
  return all.filter((guide) => isPublicGuideStatus(guide.status));
});

export const loadPublicGuide = cache(async (slug: string): Promise<Guide | null> => {
  if (!slug) return null;
  const all = await loadAllGuides();
  const guide = all.find((item) => item.slug === slug.toLowerCase());
  if (!guide || !isPublicGuideStatus(guide.status)) return null;
  return guide;
});

export async function loadIndexableGuides(): Promise<
  Array<{ slug: string; lastModified: string }>
> {
  const published = await loadPublishedGuides();
  return published
    .filter((guide) => guide.seo.includeInSitemap)
    .map((guide) => ({
      slug: guide.slug,
      lastModified: `${guide.dateModified}T00:00:00.000Z`,
    }));
}

export function guidesByCategory(guides: Guide[]): Array<{
  category: string;
  guides: Guide[];
}> {
  const order = [...GUIDE_CATEGORIES];
  const groups = new Map<string, Guide[]>();
  for (const guide of guides) {
    const key = guide.category || "Getting Started";
    const list = groups.get(key) || [];
    list.push(guide);
    groups.set(key, list);
  }
  const known = order
    .filter((category) => (groups.get(category) || []).length > 0)
    .map((category) => ({
      category,
      guides: groups.get(category) || [],
    }));
  const extra = [...groups.keys()]
    .filter(
      (category) =>
        !(GUIDE_CATEGORIES as readonly string[]).includes(category),
    )
    .map((category) => ({ category, guides: groups.get(category) || [] }));
  return [...known, ...extra];
}

export function relatedPublishedGuides(
  guide: Guide,
  catalog: Guide[],
  limit = 4,
): Guide[] {
  const wanted = new Set(guide.relatedGuides.map((slug) => slug.toLowerCase()));
  const out: Guide[] = [];
  for (const other of catalog) {
    if (other.slug === guide.slug) continue;
    if (!wanted.has(other.slug)) continue;
    if (!isPublicGuideStatus(other.status)) continue;
    out.push(other);
    if (out.length >= limit) break;
  }
  return out;
}
