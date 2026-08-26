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

/** Public https URL that is not localhost, a private IP, or a preview host. */
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

/**
 * One eligibility decision for company detail robots + sitemap.
 * Indexable iff includeInSitemap. Demo rows never qualify.
 */
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

/** Backward-compatible content check used by older sitemap tests. */
export function companyHasIndexableContent(row: {
  description: string;
  reviews: number;
  payReports: number;
  availabilityReports: number;
  opportunities: number;
  complaints: number;
  website?: string | null;
}): boolean {
  return companySEOEligibility({
    name: "Example",
    slug: "example",
    status: "ACTIVE",
    isDemo: false,
    description: row.description,
    website: row.website ?? null,
    reviews: row.reviews,
    payReports: row.payReports,
    availabilityReports: row.availabilityReports,
    opportunities: row.opportunities,
    complaints: row.complaints,
  }).includeInSitemap;
}
