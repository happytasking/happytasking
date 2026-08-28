import { env } from "../../config/env.js";
import { parseCountryLocation } from "../country.js";
import { opportunityFingerprint } from "../fingerprint.js";
import { fetchAllowed, sleep, withBackoff } from "../http.js";
import { listingPayFromSource } from "../pay.js";
import { classifyPrimarySource } from "../provenance.js";
import { classifyRelevance } from "../relevance.js";
import {
  AITRAINING_JOBS_SOURCE_KEY,
  AITRAINING_JOBS_SOURCE_NAME,
  type AdapterFetchResult,
  type NormalizedOpportunity,
  type OpportunitySourceAdapter,
} from "../types.js";
import { stripKnownAggregatorReferralParams } from "../urls.js";

export const AITRAINING_ALLOWED_HOSTS = ["aitraining.jobs"];
export const AITRAINING_PAGE_SIZE = 60;
export const AITRAINING_PAGE_DELAY_MS = 300;

export const FETCH_ROLES_RE =
  /createServerReference\)?\("([a-f0-9]+)"[^)]*"fetchRoles"\)/;

export class StaleFetchRolesActionError extends Error {
  constructor(message = "AITraining.jobs fetchRoles action is stale or unreadable") {
    super(message);
    this.name = "StaleFetchRolesActionError";
  }
}

export class SourceDegradedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceDegradedError";
  }
}

export type AiTrainingRoleRow = {
  id: string;
  title: string;
  location: string | null;
  remote: boolean;
  work_type: string | null;
  workLabel?: string | null;
  compensation_text: string | null;
  platform_slug: string;
  platformName?: string;
  platformLogoDomain?: string | null;
  posted_at: string | null;
  first_seen_at: string | null;
  applyHref: string | null;
  applySponsored?: boolean;
  applyRel?: string | null;
  partner?: boolean;
  highlight?: string | null;
  pay?: { payLow?: number; payHigh?: number } | null;
};

export function parseNextActionPayload(body: string): { rows: AiTrainingRoleRow[]; total: number } {
  const line = body
    .split("\n")
    .map((row) => row.trim())
    .find((row) => /^1:\{/.test(row));
  if (!line) {
    throw new StaleFetchRolesActionError("AITraining.jobs fetchRoles payload missing");
  }
  const json = JSON.parse(line.slice(2)) as {
    rows?: AiTrainingRoleRow[];
    total?: number;
  };
  const rows = Array.isArray(json.rows) ? json.rows : [];
  return { rows, total: Number(json.total ?? rows.length) };
}

export function discoverFetchRolesActionId(js: string): string | null {
  return js.match(FETCH_ROLES_RE)?.[1] ?? null;
}

export function factualSummary(row: AiTrainingRoleRow): string {
  const company = row.platformName || row.platform_slug;
  const parts = [
    `${row.title} at ${company}.`,
    row.workLabel ? `${row.workLabel}.` : null,
    row.remote ? "Remote." : row.location ? `${row.location}.` : null,
    row.compensation_text
      ? `Listed pay ${row.compensation_text.replace(/\$\$+/g, "$")}.`
      : "Pay not listed.",
  ].filter(Boolean);
  return parts.join(" ").slice(0, 400);
}

export function normalizeAiTrainingRow(
  row: AiTrainingRoleRow,
  discoveryUrl: string,
): NormalizedOpportunity {
  const pay = listingPayFromSource({
    compensationText: row.compensation_text,
    platformPayLow: row.pay?.payLow,
    platformPayHigh: row.pay?.payHigh,
  });
  const companySlugHint = (row.platform_slug || "unknown").toLowerCase();
  const originalApplicationUrl = stripKnownAggregatorReferralParams(row.applyHref);
  const primary = classifyPrimarySource(originalApplicationUrl || row.applyHref);
  const country = parseCountryLocation(row.location, Boolean(row.remote));
  const title = (row.title || "").trim();
  return {
    sourceKey: AITRAINING_JOBS_SOURCE_KEY,
    externalId: row.id,
    title,
    companyName: row.platformName || row.platform_slug,
    companySlugHint,
    companyWebsite: row.platformLogoDomain
      ? `https://${row.platformLogoDomain.replace(/^https?:\/\//, "")}`
      : null,
    workType: row.work_type,
    workLabel: row.workLabel || null,
    locationText: row.location,
    remote: Boolean(row.remote),
    pay,
    country,
    postedAt: row.posted_at ? new Date(row.posted_at) : null,
    sourceFirstSeenAt: row.first_seen_at ? new Date(row.first_seen_at) : null,
    discoverySource: AITRAINING_JOBS_SOURCE_NAME,
    discoveryUrl,
    rawDiscoveryApplicationUrl: row.applyHref,
    originalApplicationUrl,
    primary,
    summary: factualSummary(row),
    fingerprint: opportunityFingerprint({
      companySlug: companySlugHint,
      title,
      locationText: row.location,
      workType: row.work_type,
    }),
    relevance: classifyRelevance({
      title,
      workType: row.work_type,
      workLabel: row.workLabel,
      platformSlug: row.platform_slug,
    }),
  };
}

async function resolveActionId(
  base: string,
  configured: string,
  opts: { requireDiscovery?: boolean } = {},
): Promise<string | null> {
  try {
    const home = await fetchAllowed(base.endsWith("/") ? base : `${base}/`, {
      allowedHosts: AITRAINING_ALLOWED_HOSTS,
    });
    const chunk = home.body.match(
      /\/_next\/static\/chunks\/app\/\(marketing\)\/page-[^"']+\.js/,
    )?.[0];
    if (!chunk) return opts.requireDiscovery ? null : configured;
    const js = await fetchAllowed(new URL(chunk, base).toString(), {
      allowedHosts: AITRAINING_ALLOWED_HOSTS,
    });
    return discoverFetchRolesActionId(js.body) || (opts.requireDiscovery ? null : configured);
  } catch {
    return opts.requireDiscovery ? null : configured;
  }
}

async function paginateFetchRoles(
  baseUrl: string,
  actionId: string,
  opts: { maxRecords?: number } = {},
): Promise<AdapterFetchResult> {
  const maxRecords = opts.maxRecords;
  const records: NormalizedOpportunity[] = [];
  const warnings: string[] = [];
  let total = 0;
  let offset = 0;
  let fetched = 0;

  while (true) {
    if (maxRecords != null && records.length >= maxRecords) break;
    const payload = {
      platforms: null,
      workType: null,
      remoteOnly: false,
      search: null,
      country: null,
      sort: "recent",
      offset,
      limit: AITRAINING_PAGE_SIZE,
      withCount: offset === 0,
    };
    const res = await withBackoff(() =>
      fetchAllowed(`${baseUrl}/`, {
        allowedHosts: AITRAINING_ALLOWED_HOSTS,
        method: "POST",
        headers: {
          accept: "text/x-component",
          "content-type": "text/plain;charset=UTF-8",
          "next-action": actionId,
        },
        body: JSON.stringify([payload]),
      }),
    );
    const parsed = parseNextActionPayload(res.body);
    if (offset === 0) total = parsed.total;
    fetched += parsed.rows.length;
    for (const row of parsed.rows) {
      if (!row?.id || !row.title) continue;
      records.push(normalizeAiTrainingRow(row, `${baseUrl}/`));
      if (maxRecords != null && records.length >= maxRecords) break;
    }
    if (parsed.rows.length === 0) break;
    offset += parsed.rows.length;
    if (offset >= total && total > 0) break;
    if (parsed.rows.length < AITRAINING_PAGE_SIZE && maxRecords == null) {
      if (total > 0 && offset >= total) break;
    }
    if (maxRecords == null || records.length < maxRecords) {
      await sleep(AITRAINING_PAGE_DELAY_MS);
    }
  }

  const truncated = maxRecords != null && total > records.length;
  if (fetched > 0 && records.length === 0) {
    warnings.push("Fetched rows but none parsed");
  }

  return {
    sourceKey: AITRAINING_JOBS_SOURCE_KEY,
    fetched: total || fetched,
    parsed: records.length,
    records,
    truncated,
    warnings,
  };
}

export function createAITrainingJobsAdapter(
  overrides: { baseUrl?: string; actionId?: string } = {},
): OpportunitySourceAdapter {
  const baseUrl = (overrides.baseUrl || env.AITRAINING_JOBS_BASE_URL).replace(/\/+$/, "");
  return {
    key: AITRAINING_JOBS_SOURCE_KEY,
    name: AITRAINING_JOBS_SOURCE_NAME,
    async fetch(opts = {}): Promise<AdapterFetchResult> {
      if (env.AITRAINING_JOBS_SOURCE_MODE !== "live" || !env.AITRAINING_JOBS_ENABLED) {
        return {
          sourceKey: AITRAINING_JOBS_SOURCE_KEY,
          fetched: 0,
          parsed: 0,
          records: [],
          truncated: false,
          warnings: ["AITraining.jobs live adapter disabled"],
        };
      }

      const configured = overrides.actionId || env.AITRAINING_JOBS_FETCH_ROLES_ACTION;
      let actionId = (await resolveActionId(baseUrl, configured)) || configured;
      try {
        const result = await paginateFetchRoles(baseUrl, actionId, opts);
        if (!opts.maxRecords && result.fetched <= 0 && result.records.length === 0) {
          throw new SourceDegradedError(
            "AITraining.jobs returned no listings; existing catalog preserved",
          );
        }
        return result;
      } catch (error) {
        if (!(error instanceof StaleFetchRolesActionError)) throw error;
        const rediscovered = await resolveActionId(baseUrl, configured, {
          requireDiscovery: true,
        });
        if (!rediscovered || rediscovered === actionId) {
          throw new SourceDegradedError(
            "AITraining.jobs fetchRoles action could not be rediscovered from public pages",
          );
        }
        const retried = await paginateFetchRoles(baseUrl, rediscovered, opts);
        retried.warnings.push("Rediscovered fetchRoles action id after stale Next-Action");
        return retried;
      }
    },
  };
}
