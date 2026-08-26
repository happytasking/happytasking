import { publicPageMetadata } from "./seo";
import { siteUrl } from "./site";

export const TASKMATCH_PATH = "/taskmatch";

export const TASKMATCH_H1 = "Find AI training work that fits you.";

export const TASKMATCH_TITLE = "Find AI training work that fits you";

/** ~150–160 characters. Does not claim live jobs, counts, or hiring. */
export const TASKMATCH_DESCRIPTION =
  "Find AI training and evaluation work that fits you. TaskMatch combines verified opportunities, professional fit, and independent company intelligence.";

export const TASKMATCH_EMPTY_TITLE = "We don't list verified live openings yet.";

export const TASKMATCH_EMPTY_DESCRIPTION =
  "Happy Tasking is preparing independently sourced AI-work opportunities and company intelligence. This is the search landing for that catalog — not a broken job board.";

export const TASKMATCH_ERROR_TITLE = "TaskMatch is temporarily unavailable";

export const TASKMATCH_TRUST_NOTE =
  "Happy Tasking does not hire for these roles. Matches are estimates, not job offers.";

export function taskmatchPageMetadata() {
  return publicPageMetadata({
    path: TASKMATCH_PATH,
    title: TASKMATCH_TITLE,
    description: TASKMATCH_DESCRIPTION,
    index: true,
    follow: true,
  });
}

export function taskmatchCanonical() {
  return siteUrl(TASKMATCH_PATH);
}

export function jsonLdContainsForbiddenTaskMatchTypes(data: unknown): boolean {
  const blob = JSON.stringify(data);
  return (
    blob.includes('"JobPosting"') ||
    blob.includes('"aggregateRating"') ||
    blob.includes('"AggregateRating"')
  );
}

export function isLiveCatalogOpportunity(item: {
  isDemo: boolean;
  status?: string;
  company?: { isDemo?: boolean };
}): boolean {
  if (item.isDemo) return false;
  if (item.company?.isDemo) return false;
  if (item.status && item.status !== "ACTIVE") return false;
  return true;
}
