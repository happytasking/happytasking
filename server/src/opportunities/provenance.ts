import { hostOf, safeHttpUrl } from "./urls.js";
import type { PrimarySourceGuess } from "./types.js";

const COMPANY_CAREER_HOSTS: Record<string, string> = {
  "jobs.micro1.ai": "micro1",
  "work.mercor.com": "mercor",
  "experts.afterquery.com": "afterquery",
  "app.usebraintrust.com": "braintrust",
  "www.alignerr.com": "alignerr",
  "app.alignerr.com": "alignerr",
  "app.outlier.ai": "outlier",
  "jobs.ashbyhq.com": "ashby",
  "job-boards.greenhouse.io": "greenhouse",
  "job-boards.eu.greenhouse.io": "greenhouse",
  "boards.greenhouse.io": "greenhouse",
  "jobs.lever.co": "lever",
  "apply.workable.com": "workable",
  "community.transperfect.com": "transperfect-dataforce",
  "careers.sigma.ai": "sigma-ai",
  "terac.com": "terac",
  "x.ai": "xai",
};

export function classifyPrimarySource(
  applyUrl: string | null | undefined,
): PrimarySourceGuess {
  const url = safeHttpUrl(applyUrl);
  if (!url) {
    return {
      kind: "unknown",
      host: null,
      board: null,
      jobId: null,
      canonicalUrl: null,
      official: false,
    };
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname;

  const greenhouse = host.match(/^(?:job-boards(?:\.eu)?|boards)\.greenhouse\.io$/);
  if (greenhouse) {
    const parts = path.split("/").filter(Boolean);
    const jobsIdx = parts.indexOf("jobs");
    const board = jobsIdx > 0 ? parts[0] : parts[0] || null;
    const jobId = jobsIdx >= 0 ? parts[jobsIdx + 1] || null : null;
    return {
      kind: "greenhouse",
      host,
      board,
      jobId,
      canonicalUrl: jobId && board
        ? `https://${host}/${board}/jobs/${jobId}`
        : `${url.origin}${url.pathname}`,
      official: true,
    };
  }

  if (host === "jobs.ashbyhq.com") {
    const parts = path.split("/").filter(Boolean);
    return {
      kind: "ashby",
      host,
      board: parts[0] || null,
      jobId: parts[1] || null,
      canonicalUrl: `${url.origin}${url.pathname}`,
      official: true,
    };
  }

  if (host === "jobs.lever.co") {
    const parts = path.split("/").filter(Boolean);
    return {
      kind: "lever",
      host,
      board: parts[0] || null,
      jobId: parts[1] || null,
      canonicalUrl: `${url.origin}${url.pathname}`,
      official: true,
    };
  }

  if (host === "apply.workable.com") {
    const parts = path.split("/").filter(Boolean);
    return {
      kind: "workable",
      host,
      board: parts[0] || null,
      jobId: parts[1] || null,
      canonicalUrl: `${url.origin}${url.pathname}`,
      official: true,
    };
  }

  return {
    kind: "company-careers",
    host,
    board: COMPANY_CAREER_HOSTS[`www.${host}`] || COMPANY_CAREER_HOSTS[host] || hostOf(applyUrl),
    jobId: path.split("/").filter(Boolean).at(-1) || null,
    canonicalUrl: `${url.origin}${url.pathname}`,
    official: Boolean(COMPANY_CAREER_HOSTS[host] || COMPANY_CAREER_HOSTS[`www.${host}`]),
  };
}

export function provenanceLabels(input: {
  discoverySource: string;
  primary: PrimarySourceGuess;
}): { sourceType: "PUBLIC_LISTING" | "AUTHORIZED_AGGREGATOR"; sourceLabel: string; discoveryNote: string | null } {
  if (input.primary.official) {
    return {
      sourceType: "PUBLIC_LISTING",
      sourceLabel: "Official public listing",
      discoveryNote: `Discovered through ${input.discoverySource}.`,
    };
  }
  return {
    sourceType: "AUTHORIZED_AGGREGATOR",
    sourceLabel: `Discovered through ${input.discoverySource}`,
    discoveryNote: null,
  };
}

export const COMMERCIAL_INDEPENDENCE_STATEMENT =
  "Commercial relationships do not influence Happy Tasking's independent company intelligence.";
