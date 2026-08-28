import { isIsoCountryCode } from "./isoCountries.js";
import { isSourceWorkType } from "./workTypes.js";

export type CatalogFilters = {
  company?: string;
  domain?: string;
  skill?: string;
  country?: string;
  remote?: string;
  includeUnspecified?: string;
  workType?: string;
  q?: string;
  paymentModel?: string;
  minRate?: number;
};

export function normalizeCountryParam(
  value: string | undefined | null,
): string | undefined {
  if (!value) return undefined;
  const code = value.trim().toUpperCase();
  if (!isIsoCountryCode(code)) return undefined;
  return code;
}

export function normalizeWorkTypeParam(
  value: string | undefined | null,
): string | undefined {
  if (!value) return undefined;
  const key = value.trim().toLowerCase();
  return isSourceWorkType(key) ? key : undefined;
}

export function normalizeSearchQuery(
  value: string | undefined | null,
): string | undefined {
  if (!value) return undefined;
  const q = value.replace(/[%_]/g, " ").trim().slice(0, 80);
  return q || undefined;
}

export function comparablePaySortValue(
  rateUnit: string | null | undefined,
  maxRate: number | null | undefined,
): number {
  if (rateUnit !== "HOURLY" || maxRate == null) return Number.NEGATIVE_INFINITY;
  return maxRate;
}

export function newestTimestamp(input: {
  publishedAt?: Date | string | null;
  firstSeenAt?: Date | string | null;
}): number {
  const published = input.publishedAt ? new Date(input.publishedAt).getTime() : 0;
  if (published) return published;
  return input.firstSeenAt ? new Date(input.firstSeenAt).getTime() : 0;
}

export function isNewListing(
  firstSeenAt: Date | string | null | undefined,
  now = Date.now(),
): boolean {
  if (!firstSeenAt) return false;
  const ts = new Date(firstSeenAt).getTime();
  if (Number.isNaN(ts)) return false;
  return now - ts < 24 * 60 * 60 * 1000;
}

export function recommendedRank(input: {
  matchScore?: number | null;
  qualityScore?: number | null;
}): number {
  return (input.matchScore ?? 40) * 0.6 + (input.qualityScore ?? 40) * 0.4;
}
