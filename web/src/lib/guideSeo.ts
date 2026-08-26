import type { Metadata } from "next";
import { SITE_NAME, publicPageMetadata } from "./seo";
import { SITE_ORIGIN, isIndexableSlug, siteUrl } from "./site";

export const GUIDE_STATUSES = [
  "draft",
  "review",
  "published",
  "archived",
] as const;

export type GuideStatus = (typeof GUIDE_STATUSES)[number];

export const GUIDE_CATEGORIES = [
  "Getting Started",
  "AI Training",
  "Coding",
  "Screenings",
  "Pay",
  "Skills",
  "Platforms",
  "Career",
  "Market",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export type GuideSourceKind =
  | "official"
  | "methodology"
  | "community"
  | "external";

export type GuideSource = {
  title: string;
  url?: string;
  kind?: GuideSourceKind;
};

export type GuideSeoReason =
  | "DRAFT"
  | "ARCHIVED"
  | "DEMO_ONLY"
  | "INSUFFICIENT_CONTENT"
  | "MISSING_METADATA"
  | "INVALID_SLUG"
  | "DUPLICATE"
  | "PRIVATE"
  | "ERROR_STATE";

export type GuideSeoEligibility = {
  indexable: boolean;
  includeInSitemap: boolean;
  reasons: GuideSeoReason[];
};

export type GuideSeoInput = {
  title?: string | null;
  slug?: string | null;
  filenameSlug?: string | null;
  description?: string | null;
  author?: string | null;
  datePublished?: string | null;
  status?: string | null;
  demo?: boolean | null;
  indexable?: boolean | null;
  body?: string | null;
  duplicate?: boolean | null;
  errorState?: boolean | null;
};

export const MIN_GUIDE_DESCRIPTION_CHARS = 40;
export const EDITORIAL_AUTHOR = "Happy Tasking Editorial";

const PLACEHOLDER =
  /\b(lorem ipsum|coming soon|placeholder|todo:|tbd|xxx)\b/i;

function normalizeStatus(value?: string | null): GuideStatus | null {
  if (!value) return null;
  const status = value.trim().toLowerCase();
  return (GUIDE_STATUSES as readonly string[]).includes(status)
    ? (status as GuideStatus)
    : null;
}

function hasPlaceholderCopy(value?: string | null): boolean {
  return Boolean(value && PLACEHOLDER.test(value));
}

/**
 * People-first body: original explanation, not a title echo or filler.
 * Word count is a backstop, not the only rule.
 */
export function hasMeaningfulGuideBody(
  title?: string | null,
  description?: string | null,
  body?: string | null,
): boolean {
  const raw = (body || "").trim();
  if (!raw || hasPlaceholderCopy(raw) || hasPlaceholderCopy(description)) {
    return false;
  }
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const titleNorm = (title || "").trim().toLowerCase();
  const descNorm = (description || "").trim().toLowerCase();
  if (text.toLowerCase() === titleNorm || text.toLowerCase() === descNorm) {
    return false;
  }
  const headings = (raw.match(/^#{2,3}\s+\S+/gm) || []).length;
  const sentences = text.split(/[.?!]+/).filter((part) => part.trim().length > 20);
  const uniqueVsMeta =
    text.length > Math.max(descNorm.length, titleNorm.length) + 80;
  return uniqueVsMeta && (headings >= 1 || sentences.length >= 3) && text.length >= 280;
}

export function guideSEOEligibility(input: GuideSeoInput): GuideSeoEligibility {
  const reasons: GuideSeoReason[] = [];
  const status = normalizeStatus(input.status);
  const slug = input.slug?.trim().toLowerCase() || "";
  const title = input.title?.trim() || "";
  const description = input.description?.trim() || "";
  const author = input.author?.trim() || "";
  const published = input.datePublished?.trim() || "";

  if (input.errorState) reasons.push("ERROR_STATE");
  if (input.duplicate) reasons.push("DUPLICATE");

  if (status === "draft" || status === "review" || !status) {
    reasons.push("DRAFT");
  }
  if (status === "archived") reasons.push("ARCHIVED");
  if (input.demo) reasons.push("DEMO_ONLY");
  if (input.indexable === false) reasons.push("PRIVATE");

  if (!title || !slug || !description || !author || !published) {
    reasons.push("MISSING_METADATA");
  }
  if (slug && !isIndexableSlug(slug)) reasons.push("INVALID_SLUG");
  if (
    slug &&
    input.filenameSlug &&
    input.filenameSlug.trim().toLowerCase() !== slug
  ) {
    reasons.push("INVALID_SLUG");
  }
  if (description && description.length < MIN_GUIDE_DESCRIPTION_CHARS) {
    reasons.push("INSUFFICIENT_CONTENT");
  } else if (
    !hasMeaningfulGuideBody(title, description, input.body)
  ) {
    reasons.push("INSUFFICIENT_CONTENT");
  }

  const unique = [...new Set(reasons)];
  const indexable = unique.length === 0;
  return {
    indexable,
    includeInSitemap: indexable,
    reasons: unique,
  };
}

export function isPublicGuideStatus(status?: string | null): boolean {
  return normalizeStatus(status) === "published";
}

export function guidePageTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

export function guidePageMetadata(
  guide: {
    title: string;
    slug: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string | null;
    ogImage?: string | null;
  },
  indexable: boolean,
): Metadata {
  const meta = publicPageMetadata({
    path: `/guides/${guide.slug}`,
    absoluteTitle: guidePageTitle(guide.title),
    description: guide.description,
    index: indexable,
    follow: true,
  });
  const image = guide.ogImage?.startsWith("/")
    ? [{ url: guide.ogImage, alt: guide.title }]
    : undefined;
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      title: guidePageTitle(guide.title),
      description: guide.description,
      url: siteUrl(`/guides/${guide.slug}`),
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified || guide.datePublished,
      authors: [guide.author],
      images: image || meta.openGraph?.images,
    },
    twitter: {
      ...meta.twitter,
      title: guidePageTitle(guide.title),
      description: guide.description,
      images: image ? [image[0].url] : meta.twitter && "images" in meta.twitter
        ? meta.twitter.images
        : undefined,
    },
  };
}

/** Article JSON-LD only for indexable published guides. Never ratings. */
export function guideArticleJsonLd(guide: {
  title: string;
  slug: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string | null;
  ogImage?: string | null;
  heroImage?: string | null;
}): Record<string, unknown> {
  const url = siteUrl(`/guides/${guide.slug}`);
  const image = [guide.ogImage, guide.heroImage].find(
    (value) => value && value.startsWith("/"),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified || guide.datePublished,
    author: {
      "@type": "Organization",
      name: guide.author,
      url: SITE_ORIGIN,
    },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(image ? { image: siteUrl(image) } : {}),
  };
}

export function estimateReadingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
