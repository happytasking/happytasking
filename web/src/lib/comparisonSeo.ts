import type { Metadata } from "next";
import type { Company, TaskScoreResult } from "./types";
import { SITE_NAME, publicPageMetadata } from "./seo";
import { isIndexableSlug } from "./site";
import {
  companySEOEligibility,
  companySeoInputFromCompany,
  isPublicCompanyWebsite,
  type CompanySeoInput,
} from "./companySeo";

export const COMPARISON_SEPARATOR = "-vs-";

export type ComparisonSeoReason =
  | "DEMO_ONLY"
  | "COMPANY_A_INELIGIBLE"
  | "COMPANY_B_INELIGIBLE"
  | "INSUFFICIENT_COMPARISON_DATA"
  | "INSUFFICIENT_DISTINCT_CONTENT"
  | "PRIVATE"
  | "INVALID_PAIR"
  | "SAME_COMPANY"
  | "ERROR_STATE";

export type ComparisonSeoEligibility = {
  indexable: boolean;
  includeInSitemap: boolean;
  reasons: ComparisonSeoReason[];
};

export type NormalizedPair = {
  left: string;
  right: string;
  slug: string;
};

/**
 * Canonical pair order is alphabetical by slug (`en` localeCompare).
 * Never by TaskScore or “better” company. Outlier vs Mercor → mercor-vs-outlier.
 */
export function normalizeComparisonPair(
  companyA: string,
  companyB: string,
): NormalizedPair | null {
  const leftRaw = companyA.trim().toLowerCase();
  const rightRaw = companyB.trim().toLowerCase();
  if (!leftRaw || !rightRaw) return null;
  if (leftRaw === rightRaw) return null;
  const [left, right] =
    leftRaw.localeCompare(rightRaw, "en") <= 0
      ? [leftRaw, rightRaw]
      : [rightRaw, leftRaw];
  return { left, right, slug: `${left}${COMPARISON_SEPARATOR}${right}` };
}

export function comparisonPath(companyA: string, companyB: string): string | null {
  const pair = normalizeComparisonPair(companyA, companyB);
  return pair ? `/compare/${pair.slug}` : null;
}

/**
 * Every valid `{left}-vs-{right}` partition. Prefer longer left slugs so a
 * future company named `acme-vs-labs` wins over splitting at the first `-vs-`.
 */
export function parseComparisonSlugCandidates(
  raw: string,
): { a: string; b: string }[] {
  const slug = raw.trim().toLowerCase();
  if (!slug.includes(COMPARISON_SEPARATOR)) return [];
  const out: { a: string; b: string }[] = [];
  let from = 0;
  while (from < slug.length) {
    const index = slug.indexOf(COMPARISON_SEPARATOR, from);
    if (index <= 0) break;
    const left = slug.slice(0, index);
    const right = slug.slice(index + COMPARISON_SEPARATOR.length);
    if (isIndexableSlug(left) && isIndexableSlug(right) && left !== right) {
      out.push({ a: left, b: right });
    }
    from = index + 1;
  }
  return out.sort((x, y) => y.a.length - x.a.length);
}

/**
 * Parse `{slug}-vs-{slug}` without assuming a company slug cannot contain "-vs-".
 * When `knownSlugs` is provided, the split must match two known companies.
 */
export function parseComparisonSlug(
  raw: string,
  knownSlugs?: string[],
): { a: string; b: string } | null {
  const slug = raw.trim().toLowerCase();
  if (!slug.includes(COMPARISON_SEPARATOR)) return null;

  if (knownSlugs && knownSlugs.length > 0) {
    const known = new Set(
      knownSlugs.map((item) => item.trim().toLowerCase()).filter(Boolean),
    );
    const matches: { a: string; b: string }[] = [];
    for (const left of known) {
      const prefix = `${left}${COMPARISON_SEPARATOR}`;
      if (!slug.startsWith(prefix)) continue;
      const right = slug.slice(prefix.length);
      if (known.has(right) && right !== left) matches.push({ a: left, b: right });
    }
    matches.sort((x, y) => y.a.length - x.a.length);
    return matches[0] ?? null;
  }

  return parseComparisonSlugCandidates(slug)[0] ?? null;
}

export function isCanonicalComparisonSlug(
  raw: string,
  companyA: string,
  companyB: string,
): boolean {
  const pair = normalizeComparisonPair(companyA, companyB);
  return Boolean(pair && pair.slug === raw.trim().toLowerCase());
}

const COMPARABLE_DIMS: Array<keyof NonNullable<TaskScoreResult["dimensions"]>> = [
  "pay",
  "taskAvailability",
  "projectStability",
  "paymentReliability",
  "reviewerFairness",
  "guidelineClarity",
  "supportQuality",
  "transparency",
  "overallExperience",
];

function hasPublicIdentity(input: CompanySeoInput): boolean {
  return companySEOEligibility({
    ...input,
    isDemo: false,
    status: "ACTIVE",
    errorState: false,
  }).reasons.every(
    (reason) =>
      reason !== "INSUFFICIENT_CONTENT" && reason !== "INSUFFICIENT_REAL_DATA",
  );
}

function publicWebsiteHost(url?: string | null): string | null {
  if (!isPublicCompanyWebsite(url) || !url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function comparableDimensionCount(
  a?: TaskScoreResult | null,
  b?: TaskScoreResult | null,
): number {
  let count = 0;
  if (a?.taskScore != null || b?.taskScore != null) count += 1;
  for (const key of COMPARABLE_DIMS) {
    if (a?.dimensions?.[key] != null || b?.dimensions?.[key] != null) count += 1;
  }
  return count;
}

export function comparisonSEOEligibility(
  companyA: CompanySeoInput,
  companyB: CompanySeoInput,
  comparisonData?: {
    scoreA?: TaskScoreResult | null;
    scoreB?: TaskScoreResult | null;
    errorState?: boolean;
  },
): ComparisonSeoEligibility {
  const reasons: ComparisonSeoReason[] = [];
  const slugA = companyA.slug?.trim().toLowerCase() || "";
  const slugB = companyB.slug?.trim().toLowerCase() || "";

  if (comparisonData?.errorState) reasons.push("ERROR_STATE");
  if (!slugA || !slugB || !companyA.name?.trim() || !companyB.name?.trim()) {
    reasons.push("INVALID_PAIR");
  }
  if (slugA && slugB && slugA === slugB) reasons.push("SAME_COMPANY");

  const eligA = companySEOEligibility(companyA);
  const eligB = companySEOEligibility(companyB);

  if (eligA.reasons.includes("DEMO_ONLY") || eligB.reasons.includes("DEMO_ONLY")) {
    reasons.push("DEMO_ONLY");
  }
  if (eligA.reasons.includes("PRIVATE") || eligB.reasons.includes("PRIVATE")) {
    reasons.push("PRIVATE");
  }
  if (
    !eligA.indexable &&
    !eligA.reasons.includes("DEMO_ONLY") &&
    !eligA.reasons.includes("PRIVATE")
  ) {
    reasons.push("COMPANY_A_INELIGIBLE");
  }
  if (
    !eligB.indexable &&
    !eligB.reasons.includes("DEMO_ONLY") &&
    !eligB.reasons.includes("PRIVATE")
  ) {
    reasons.push("COMPANY_B_INELIGIBLE");
  }

  const identityA = hasPublicIdentity(companyA);
  const identityB = hasPublicIdentity(companyB);
  const dims = comparableDimensionCount(
    comparisonData?.scoreA,
    comparisonData?.scoreB,
  );
  if (!identityA && !identityB && dims === 0) {
    reasons.push("INSUFFICIENT_COMPARISON_DATA");
  }
  const hostA = publicWebsiteHost(companyA.website);
  const hostB = publicWebsiteHost(companyB.website);
  if (hostA && hostB && hostA === hostB) {
    reasons.push("INSUFFICIENT_DISTINCT_CONTENT");
  }

  const unique = [...new Set(reasons)];
  const indexable = unique.length === 0;
  return {
    indexable,
    includeInSitemap: indexable,
    reasons: unique,
  };
}

/**
 * Product-validity blockers. DEMO_ONLY is not included: demo pairs may be
 * shown to users when they are useful. SEO indexability is a separate gate.
 */
export const RELATED_COMPARISON_BLOCKERS: ComparisonSeoReason[] = [
  "SAME_COMPANY",
  "INVALID_PAIR",
  "PRIVATE",
  "INSUFFICIENT_COMPARISON_DATA",
  "INSUFFICIENT_DISTINCT_CONTENT",
  "ERROR_STATE",
];

export type RelatedComparisonSide = {
  name?: string | null;
  slug?: string | null;
  isDemo?: boolean | null;
  status?: string | null;
  companyStatus?: string | null;
  website?: string | null;
  description?: string | null;
  seoEvidence?: Company["seoEvidence"];
  score?: TaskScoreResult | null;
  errorState?: boolean;
};

function relatedSideInput(side: RelatedComparisonSide): CompanySeoInput {
  return {
    name: side.name,
    slug: side.slug,
    status: side.status || side.companyStatus,
    isDemo: side.isDemo,
    website: side.website,
    description: side.description,
    reviews: side.seoEvidence?.reviews ?? side.score?.sampleSize ?? 0,
    payReports: side.seoEvidence?.payReports ?? 0,
    availabilityReports: side.seoEvidence?.availabilityReports ?? 0,
    opportunities: side.seoEvidence?.opportunities ?? 0,
    complaints: side.seoEvidence?.complaints ?? 0,
    errorState: side.errorState,
  };
}

export type ComparisonProductValidity = {
  valid: boolean;
  reasons: ComparisonSeoReason[];
};

export function comparisonProductValidity(
  companyA: RelatedComparisonSide,
  companyB: RelatedComparisonSide,
): ComparisonProductValidity {
  const inputA = relatedSideInput(companyA);
  const inputB = relatedSideInput(companyB);
  const slugA = inputA.slug?.trim().toLowerCase() || "";
  const slugB = inputB.slug?.trim().toLowerCase() || "";
  const seo = comparisonSEOEligibility(inputA, inputB, {
    scoreA: companyA.score,
    scoreB: companyB.score,
    errorState: Boolean(companyA.errorState || companyB.errorState),
  });
  const reasons = seo.reasons.filter((reason) =>
    RELATED_COMPARISON_BLOCKERS.includes(reason),
  );
  if (
    (slugA && !isIndexableSlug(slugA)) ||
    (slugB && !isIndexableSlug(slugB))
  ) {
    if (!reasons.includes("INVALID_PAIR")) reasons.push("INVALID_PAIR");
  }
  return { valid: reasons.length === 0, reasons };
}

/** Product gate for related chips. Does not require SEO indexability. */
export function isValidRelatedComparison(
  companyA: RelatedComparisonSide,
  companyB: RelatedComparisonSide,
): boolean {
  return comparisonProductValidity(companyA, companyB).valid;
}

export function comparisonSeoFromCompanies(a: Company, b: Company) {
  return comparisonSEOEligibility(
    companySeoInputFromCompany(a),
    companySeoInputFromCompany(b),
    { scoreA: a.score, scoreB: b.score },
  );
}

export function comparisonPageHeading(nameA: string, nameB: string): string {
  return `${nameA} vs ${nameB}: AI Work Comparison`;
}

export function comparisonPageTitle(nameA: string, nameB: string): string {
  return `${nameA} vs ${nameB}: Pay, Tasks, Reviews & Stability | ${SITE_NAME}`;
}

export function comparisonPageDescription(
  nameA: string,
  nameB: string,
  isDemo?: boolean,
): string {
  const base = `Compare ${nameA} and ${nameB} using community-reported pay, task availability, stability, contributor experiences and AI-work intelligence from ${SITE_NAME}.`;
  return isDemo
    ? `${base} Illustrative demo data — not production metrics.`
    : base;
}

export function comparisonPageMetadata(
  left: Company,
  right: Company,
  slug: string,
  indexable: boolean,
): Metadata {
  const demo = Boolean(left.isDemo || right.isDemo);
  return publicPageMetadata({
    path: `/compare/${slug}`,
    absoluteTitle: comparisonPageTitle(left.name, right.name),
    description: comparisonPageDescription(left.name, right.name, demo),
    index: indexable,
    follow: true,
  });
}

/** Missing metrics stay empty — never coerce null to 0. */
export function comparisonMetricDisplay(
  value: number | null | undefined,
): "Not enough data" | number {
  if (value == null || Number.isNaN(value)) return "Not enough data";
  return value;
}

export type ComparisonSectionId =
  | "quick"
  | "taskScore"
  | "pay"
  | "taskAvailability"
  | "projectStability"
  | "paymentReliability"
  | "reviewerFairness"
  | "guidelineClarity"
  | "support"
  | "transparency"
  | "experience"
  | "issues"
  | "fits"
  | "exploreA"
  | "exploreB"
  | "taskmatch"
  | "related";

export function comparisonSeoSections(left: Company, right: Company): ComparisonSectionId[] {
  const demo = Boolean(left.isDemo || right.isDemo);
  const sections: ComparisonSectionId[] = ["quick"];
  const dim = (key: keyof NonNullable<TaskScoreResult["dimensions"]>) =>
    left.score?.dimensions?.[key] != null ||
    right.score?.dimensions?.[key] != null;

  if (left.score?.taskScore != null || right.score?.taskScore != null) {
    sections.push("taskScore");
  }
  if (dim("pay") || (left.payByDomain?.length || 0) > 0 || (right.payByDomain?.length || 0) > 0) {
    sections.push("pay");
  }
  if (
    dim("taskAvailability") ||
    (left.pulse?.availability && (left.pulse.sampleSize ?? 0) > 0) ||
    (right.pulse?.availability && (right.pulse.sampleSize ?? 0) > 0)
  ) {
    sections.push("taskAvailability");
  }
  if (dim("projectStability")) sections.push("projectStability");
  if (dim("paymentReliability")) sections.push("paymentReliability");
  if (dim("reviewerFairness")) sections.push("reviewerFairness");
  if (dim("guidelineClarity")) sections.push("guidelineClarity");
  if (dim("supportQuality")) sections.push("support");
  if (dim("transparency")) sections.push("transparency");
  if (dim("overallExperience") || dim("wouldWorkAgainRate")) {
    sections.push("experience");
  }
  if (!demo && (left.resolution || right.resolution)) sections.push("issues");
  sections.push("fits", "exploreA", "exploreB", "taskmatch");
  return sections;
}

export type RelatedComparison = NormalizedPair & {
  leftName: string;
  rightName: string;
};

export function relatedComparisonPairs(
  left: Company,
  right: Company,
  limit = 4,
): RelatedComparison[] {
  const others = [
    ...(left.similarCompanies || []),
    ...(right.similarCompanies || []),
  ];
  const names = new Map<string, string>([
    [left.slug, left.name],
    [right.slug, right.name],
  ]);
  for (const other of others) names.set(other.slug, other.name);

  const currentSlug = normalizeComparisonPair(left.slug, right.slug)?.slug;
  const seenCompanies = new Set<string>([left.slug, right.slug]);
  const pairs: RelatedComparison[] = [];
  for (const other of others) {
    if (seenCompanies.has(other.slug)) continue;
    seenCompanies.add(other.slug);
    const withLeft = normalizeComparisonPair(left.slug, other.slug);
    const withRight = normalizeComparisonPair(right.slug, other.slug);
    for (const { pair, side } of [
      { pair: withLeft, side: left },
      { pair: withRight, side: right },
    ]) {
      if (!pair) continue;
      if (pair.slug === currentSlug) continue;
      if (pairs.some((item) => item.slug === pair.slug)) continue;
      if (!isValidRelatedComparison(side, other)) continue;
      pairs.push({
        ...pair,
        leftName: names.get(pair.left) || pair.left,
        rightName: names.get(pair.right) || pair.right,
      });
      if (pairs.length >= limit) return pairs;
    }
  }
  return pairs;
}
