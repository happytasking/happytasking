/**
 * Public TaskMatch catalog rules (Sprint 4.5).
 * Demo listings and demo companies never appear as live openings.
 */

export type CatalogCompany = {
  isDemo: boolean;
  companyStatus?: string;
};

export type CatalogOpportunity = {
  isDemo: boolean;
  status: string;
  company: CatalogCompany;
};

/**
 * Record-level demo filter for public evidence.
 * A real company identity must never pull demo reviews/pay/TaskPulse
 * into public metrics just because Company.isDemo became false.
 */
export function publicEvidenceWhere(companyIsDemo?: boolean) {
  if (companyIsDemo === true) return {};
  return { isDemo: false as const };
}

export function taskPulseReportScope(
  companyId: string,
  opts: { domainId?: string; realOnly?: boolean } = {},
) {
  return {
    companyId,
    ...(opts.domainId ? { domainId: opts.domainId } : {}),
    ...(opts.realOnly !== false ? { isDemo: false as const } : {}),
  };
}

export function publicOpportunityCatalogWhere(companySlug?: string) {
  return {
    status: "ACTIVE" as const,
    isDemo: false,
    company: {
      isDemo: false,
      companyStatus: "ACTIVE" as const,
      ...(companySlug ? { slug: companySlug } : {}),
    },
  };
}

export function isPublicOpportunityCatalogItem(row: CatalogOpportunity): boolean {
  if (row.isDemo) return false;
  if (row.status !== "ACTIVE") return false;
  if (row.company.isDemo) return false;
  if (row.company.companyStatus && row.company.companyStatus !== "ACTIVE") {
    return false;
  }
  return true;
}

export function hasPublicCommunityIntelligence(input: {
  taskScore: number | null;
  pulseAvailability: string | null | undefined;
  qualityScore: number | null;
  qualityInsufficient: boolean;
}): boolean {
  if (input.qualityInsufficient && input.taskScore == null && !input.pulseAvailability) {
    return false;
  }
  return (
    input.taskScore != null ||
    Boolean(input.pulseAvailability) ||
    (input.qualityScore != null && !input.qualityInsufficient)
  );
}
