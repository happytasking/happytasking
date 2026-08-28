export const AITRAINING_JOBS_SOURCE_KEY = "aitraining-jobs";
export const AITRAINING_JOBS_SOURCE_NAME = "AITraining.jobs";

export type OpportunitySourceAdapterId =
  | "aitraining-jobs"
  | "greenhouse"
  | "ashby"
  | "lever"
  | "workable"
  | "generic-public";

export type NormalizedPay = {
  minRate: number | null;
  maxRate: number | null;
  currency: string;
  unit: "HOURLY" | "PER_TASK" | "MILESTONE" | null;
  rawText: string | null;
};

export type CountryParse = {
  eligibility: "EXPLICIT" | "GLOBAL" | "UNSPECIFIED";
  codes: string[];
};

export type RelevanceDecision = {
  status: "ACCEPTED" | "QUARANTINED" | "REJECTED";
  reason: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type PrimarySourceGuess = {
  kind:
    | "greenhouse"
    | "ashby"
    | "lever"
    | "workable"
    | "company-careers"
    | "unknown";
  host: string | null;
  board: string | null;
  jobId: string | null;
  canonicalUrl: string | null;
  official: boolean;
};

export type NormalizedOpportunity = {
  sourceKey: string;
  externalId: string;
  title: string;
  companyName: string;
  companySlugHint: string;
  companyWebsite: string | null;
  workType: string | null;
  workLabel: string | null;
  locationText: string | null;
  remote: boolean;
  pay: NormalizedPay;
  country: CountryParse;
  postedAt: Date | null;
  sourceFirstSeenAt: Date | null;
  discoverySource: string;
  discoveryUrl: string;
  rawDiscoveryApplicationUrl: string | null;
  originalApplicationUrl: string | null;
  primary: PrimarySourceGuess;
  summary: string;
  fingerprint: string;
  relevance: RelevanceDecision;
};

export type AdapterFetchResult = {
  sourceKey: string;
  fetched: number;
  parsed: number;
  records: NormalizedOpportunity[];
  truncated: boolean;
  warnings: string[];
};

export type OpportunitySourceAdapter = {
  key: string;
  name: string;
  fetch(opts?: { maxRecords?: number }): Promise<AdapterFetchResult>;
};

export type SourceMetrics = {
  fetched: number;
  parsed: number;
  valid: number;
  rejected: number;
  quarantined: number;
  created: number;
  updated: number;
  unchanged: number;
  duplicates: number;
  stale: number;
  closed: number;
  errors: number;
  durationMs: number;
  error?: string;
};

export const EMPTY_SOURCE_METRICS: SourceMetrics = {
  fetched: 0,
  parsed: 0,
  valid: 0,
  rejected: 0,
  quarantined: 0,
  created: 0,
  updated: 0,
  unchanged: 0,
  duplicates: 0,
  stale: 0,
  closed: 0,
  errors: 0,
  durationMs: 0,
};
