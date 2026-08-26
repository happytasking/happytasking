import type { Company, PayByDomain, Review, TaskPulse, TaskScoreResult } from "./types";
import { SITE_NAME, publicPageMetadata } from "./seo";
import { siteUrl } from "./site";
import type { Metadata } from "next";

export const MIN_COMPANY_DESCRIPTION_CHARS = 40;
export const MIN_DESCRIPTION_WITH_WEBSITE_CHARS = 20;

export type CompanySeoReason =
  | "DEMO_ONLY"
  | "INSUFFICIENT_CONTENT"
  | "INSUFFICIENT_REAL_DATA"
  | "PRIVATE"
  | "INVALID_COMPANY"
  | "ERROR_STATE";

export type CompanySeoInput = {
  name?: string | null;
  slug?: string | null;
  status?: string | null;
  isDemo?: boolean | null;
  description?: string | null;
  website?: string | null;
  reviews?: number;
  payReports?: number;
  availabilityReports?: number;
  opportunities?: number;
  complaints?: number;
  errorState?: boolean;
};

export type CompanySeoEligibility = {
  indexable: boolean;
  includeInSitemap: boolean;
  reasons: CompanySeoReason[];
};

export type CompanyResolution = {
  sampleSize: number;
  responseRate: number | null;
  resolutionRate: number | null;
  resolutionScore: number | null;
  medianResponseHours: number | null;
};

export type SimilarCompany = {
  name: string;
  slug: string;
  isDemo?: boolean;
};

/** Keep in sync with server/src/services/companySeo.eligibility.ts */
export function isPublicCompanyWebsite(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local")) return false;
    if (host === "127.0.0.1" || host === "::1") return false;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
    if (host.endsWith(".vercel.app") || host.endsWith(".netlify.app")) return false;
    return true;
  } catch {
    return false;
  }
}

function hasUniquePublicIdentity(input: CompanySeoInput): boolean {
  const description = (input.description || "").trim();
  if (description.length >= MIN_COMPANY_DESCRIPTION_CHARS) return true;
  return (
    isPublicCompanyWebsite(input.website) &&
    description.length >= MIN_DESCRIPTION_WITH_WEBSITE_CHARS
  );
}

function hasRealCommunityEvidence(input: CompanySeoInput): boolean {
  return (
    (input.reviews ?? 0) > 0 ||
    (input.payReports ?? 0) > 0 ||
    (input.availabilityReports ?? 0) > 0 ||
    (input.opportunities ?? 0) > 0 ||
    (input.complaints ?? 0) > 0
  );
}

function isPlaceholderDescription(input: CompanySeoInput): boolean {
  const description = (input.description || "").trim().toLowerCase();
  const name = (input.name || "").trim().toLowerCase();
  if (!description || !name) return !description;
  return (
    description === name ||
    description === `${name}.` ||
    description === `${name} reviews`
  );
}

export function companySEOEligibility(
  input: CompanySeoInput,
): CompanySeoEligibility {
  const reasons: CompanySeoReason[] = [];

  if (input.errorState) reasons.push("ERROR_STATE");
  if (!input.name?.trim() || !input.slug?.trim()) {
    reasons.push("INVALID_COMPANY");
  }
  if (input.isDemo) reasons.push("DEMO_ONLY");
  if (input.status && input.status !== "ACTIVE") reasons.push("PRIVATE");

  const identity = hasUniquePublicIdentity(input);
  const community = hasRealCommunityEvidence(input);

  if (!identity && !community) {
    reasons.push("INSUFFICIENT_CONTENT");
  } else if (
    !community &&
    isPlaceholderDescription(input) &&
    !isPublicCompanyWebsite(input.website)
  ) {
    reasons.push("INSUFFICIENT_REAL_DATA");
  }

  const indexable = reasons.length === 0;
  return {
    indexable,
    includeInSitemap: indexable,
    reasons,
  };
}

export function companySeoInputFromCompany(company: Company): CompanySeoInput {
  return {
    name: company.name,
    slug: company.slug,
    status: company.companyStatus,
    isDemo: company.isDemo,
    description: company.description,
    website: company.website,
    reviews: company.seoEvidence?.reviews ?? company.score?.sampleSize ?? 0,
    payReports: company.seoEvidence?.payReports ?? 0,
    availabilityReports: company.seoEvidence?.availabilityReports ?? 0,
    opportunities: company.seoEvidence?.opportunities ?? 0,
    complaints: company.seoEvidence?.complaints ?? 0,
  };
}

export function companyPageHeading(name: string): string {
  return `${name} Reviews, Pay & Task Availability`;
}

export function companyPageTitle(name: string): string {
  return `${companyPageHeading(name)} | ${SITE_NAME}`;
}

export function companyPageDescription(name: string, isDemo?: boolean): string {
  const base = `Explore contributor-reported ${name} pay, task availability, stability, reviews, and AI-work experiences on ${SITE_NAME}.`;
  return isDemo
    ? `${base} Illustrative demo data — not production metrics.`
    : base;
}

export function companyPageMetadata(
  company: Company,
  indexable: boolean,
): Metadata {
  return publicPageMetadata({
    path: `/companies/${company.slug}`,
    absoluteTitle: companyPageTitle(company.name),
    description: companyPageDescription(company.name, company.isDemo),
    index: indexable,
    follow: true,
  });
}

export type CompanySeoSectionId =
  | "overview"
  | "reputation"
  | "pay"
  | "taskAvailability"
  | "projectStability"
  | "paymentReliability"
  | "reviewerFairness"
  | "guidelineClarity"
  | "support"
  | "transparency"
  | "reviews"
  | "issues"
  | "compare"
  | "similar"
  | "taskmatch";

const DIMENSION_SECTIONS: Array<{
  id: CompanySeoSectionId;
  key: keyof NonNullable<TaskScoreResult["dimensions"]>;
}> = [
  { id: "pay", key: "pay" },
  { id: "taskAvailability", key: "taskAvailability" },
  { id: "projectStability", key: "projectStability" },
  { id: "paymentReliability", key: "paymentReliability" },
  { id: "reviewerFairness", key: "reviewerFairness" },
  { id: "guidelineClarity", key: "guidelineClarity" },
  { id: "support", key: "supportQuality" },
  { id: "transparency", key: "transparency" },
];

export function companySeoSections(input: {
  isDemo?: boolean;
  description?: string | null;
  country?: string | null;
  headquarters?: string | null;
  website?: string | null;
  workDomains?: string[];
  score?: TaskScoreResult | null;
  pulse?: TaskPulse | null;
  payByDomain?: PayByDomain[];
  reviews?: Review[];
  resolution?: CompanyResolution | null;
  similarCompanies?: SimilarCompany[];
  topIssues?: { category: string; count: number }[];
}): CompanySeoSectionId[] {
  const sections: CompanySeoSectionId[] = [];
  const hasOverview =
    Boolean(input.description?.trim()) ||
    Boolean(input.country) ||
    Boolean(input.headquarters) ||
    isPublicCompanyWebsite(input.website) ||
    (input.workDomains && input.workDomains.length > 0);
  if (hasOverview) sections.push("overview");

  const score = input.score;
  if (score?.taskScore != null && (score.sampleSize ?? 0) > 0) {
    sections.push("reputation");
  }

  const dims = score?.dimensions;
  if (input.payByDomain && input.payByDomain.length > 0) {
    sections.push("pay");
  } else if (dims?.pay != null) {
    sections.push("pay");
  }

  if (dims) {
    for (const item of DIMENSION_SECTIONS) {
      if (item.id === "pay") continue;
      if (dims[item.key] != null) sections.push(item.id);
    }
  } else if (input.pulse?.availability && (input.pulse.sampleSize ?? 0) > 0) {
    sections.push("taskAvailability");
  }

  if (input.reviews && input.reviews.length > 0) sections.push("reviews");
  if (
    !input.isDemo &&
    (input.resolution || (input.topIssues && input.topIssues.length > 0))
  ) {
    sections.push("issues");
  }
  if (input.similarCompanies && input.similarCompanies.length > 0) {
    sections.push("compare");
    sections.push("similar");
  }
  sections.push("taskmatch");
  return sections;
}

/**
 * Listed-company Organization only — never ratings, reviews, or demo metrics.
 * Omitted for demo / ineligible pages.
 */
export function listedCompanyJsonLd(company: Company, indexable: boolean) {
  if (!indexable || company.isDemo) return null;
  const website = isPublicCompanyWebsite(company.website)
    ? company.website
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl(`/companies/${company.slug}#organization`),
    name: company.name,
    url: website || siteUrl(`/companies/${company.slug}`),
    description: company.description?.trim() || undefined,
  };
}

export function jsonLdContainsForbiddenMetrics(data: unknown): boolean {
  const blob = JSON.stringify(data).toLowerCase();
  return (
    blob.includes("aggregaterating") ||
    blob.includes("ratingvalue") ||
    blob.includes("reviewcount") ||
    blob.includes('"review"') ||
    blob.includes("taskscore")
  );
}
