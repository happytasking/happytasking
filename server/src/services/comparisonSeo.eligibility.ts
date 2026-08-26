import { companySEOEligibility, isPublicCompanyWebsite, type CompanySeoInput } from "./companySeo.eligibility.js";

export const COMPARISON_SEPARATOR = "-vs-";
export const MAX_SITEMAP_COMPARISONS = 40;
export const MAX_COMPARISONS_PER_COMPANY = 3;

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

/** Alphabetical slug order. Not score-based. Keep in sync with web/src/lib/comparisonSeo.ts */
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

export function comparisonSEOEligibility(
  companyA: CompanySeoInput,
  companyB: CompanySeoInput,
): ComparisonSeoEligibility {
  const reasons: ComparisonSeoReason[] = [];
  const slugA = companyA.slug?.trim().toLowerCase() || "";
  const slugB = companyB.slug?.trim().toLowerCase() || "";

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

export function selectComparisonPairs(
  companies: Array<{ slug: string; domains: string[]; updatedAt: Date }>,
): Array<{ left: string; right: string; slug: string; lastModified: Date }> {
  const pairs = new Map<
    string,
    { left: string; right: string; slug: string; lastModified: Date }
  >();
  const perCompany = new Map<string, number>();

  for (let i = 0; i < companies.length; i += 1) {
    for (let j = i + 1; j < companies.length; j += 1) {
      if (pairs.size >= MAX_SITEMAP_COMPARISONS) {
        return [...pairs.values()];
      }
      const a = companies[i];
      const b = companies[j];
      if (!sharesDomain(a.domains, b.domains)) continue;
      const pair = normalizeComparisonPair(a.slug, b.slug);
      if (!pair) continue;
      if ((perCompany.get(pair.left) ?? 0) >= MAX_COMPARISONS_PER_COMPANY) continue;
      if ((perCompany.get(pair.right) ?? 0) >= MAX_COMPARISONS_PER_COMPANY) continue;
      const lastModified =
        a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt;
      pairs.set(pair.slug, { ...pair, lastModified });
      perCompany.set(pair.left, (perCompany.get(pair.left) ?? 0) + 1);
      perCompany.set(pair.right, (perCompany.get(pair.right) ?? 0) + 1);
    }
  }

  return [...pairs.values()];
}

function sharesDomain(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  const set = new Set(a);
  return b.some((domain) => set.has(domain));
}

function publicWebsiteHost(url?: string | null): string | null {
  if (!isPublicCompanyWebsite(url) || !url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}
