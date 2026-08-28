-- Sprint 4.6: additive opportunity ingestion, sync, provenance, referrals.
-- Non-destructive: no DROP TABLE/COLUMN, no TRUNCATE, no reseed.

ALTER TYPE "OpportunityStatus" ADD VALUE IF NOT EXISTS 'STALE';
ALTER TYPE "OpportunitySourceType" ADD VALUE IF NOT EXISTS 'AUTHORIZED_AGGREGATOR';
ALTER TYPE "OpportunitySourceType" ADD VALUE IF NOT EXISTS 'PUBLIC_API';
ALTER TYPE "OpportunitySourceType" ADD VALUE IF NOT EXISTS 'PUBLIC_FEED';
ALTER TYPE "OpportunitySourceType" ADD VALUE IF NOT EXISTS 'PUBLIC_PAGE';

CREATE TYPE "OpportunityAccessMode" AS ENUM (
  'AUTHORIZED_AGGREGATOR',
  'PUBLIC_API',
  'PUBLIC_FEED',
  'PUBLIC_PAGE',
  'COMPANY_SUBMITTED',
  'COMMUNITY_REPORTED',
  'MANUAL'
);

CREATE TYPE "OpportunitySyncRunStatus" AS ENUM (
  'RUNNING',
  'SUCCESS',
  'PARTIAL_SUCCESS',
  'FAILED',
  'SKIPPED_LOCKED'
);

CREATE TYPE "OpportunityRelevanceStatus" AS ENUM (
  'ACCEPTED',
  'QUARANTINED',
  'REJECTED'
);

CREATE TYPE "CountryEligibility" AS ENUM (
  'EXPLICIT',
  'GLOBAL',
  'UNSPECIFIED'
);

CREATE TYPE "ReferralProgramStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'PENDING'
);

ALTER TABLE "Opportunity"
  ADD COLUMN IF NOT EXISTS "summary" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "sourceKey" TEXT,
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "fingerprint" TEXT,
  ADD COLUMN IF NOT EXISTS "discoverySource" TEXT,
  ADD COLUMN IF NOT EXISTS "discoveryUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "primarySource" TEXT,
  ADD COLUMN IF NOT EXISTS "primarySourceUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "originalApplicationUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "rawDiscoveryApplicationUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "countryEligibility" "CountryEligibility" NOT NULL DEFAULT 'UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS "locationText" TEXT,
  ADD COLUMN IF NOT EXISTS "workType" TEXT,
  ADD COLUMN IF NOT EXISTS "relevanceStatus" "OpportunityRelevanceStatus" NOT NULL DEFAULT 'ACCEPTED',
  ADD COLUMN IF NOT EXISTS "relevanceReason" TEXT,
  ADD COLUMN IF NOT EXISTS "firstSeenAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Opportunity_sourceKey_externalId_key"
  ON "Opportunity" ("sourceKey", "externalId");

CREATE INDEX IF NOT EXISTS "Opportunity_fingerprint_idx" ON "Opportunity" ("fingerprint");
CREATE INDEX IF NOT EXISTS "Opportunity_status_isDemo_lastSeenAt_idx"
  ON "Opportunity" ("status", "isDemo", "lastSeenAt");
CREATE INDEX IF NOT EXISTS "Opportunity_workType_status_idx"
  ON "Opportunity" ("workType", "status");

CREATE TABLE IF NOT EXISTS "OpportunitySource" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "adapter" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "accessMode" "OpportunityAccessMode" NOT NULL,
  "syncCadenceMinutes" INTEGER NOT NULL DEFAULT 60,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "allowedHosts" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "lastAttemptAt" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),
  "lastError" TEXT,
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "health" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "config" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OpportunitySource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OpportunitySource_key_key" ON "OpportunitySource" ("key");

CREATE TABLE IF NOT EXISTS "OpportunitySyncRun" (
  "id" TEXT NOT NULL,
  "status" "OpportunitySyncRunStatus" NOT NULL DEFAULT 'RUNNING',
  "trigger" TEXT NOT NULL DEFAULT 'cron',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "durationMs" INTEGER,
  "error" TEXT,
  "metrics" JSONB,
  CONSTRAINT "OpportunitySyncRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OpportunitySyncRun_startedAt_idx" ON "OpportunitySyncRun" ("startedAt");
CREATE INDEX IF NOT EXISTS "OpportunitySyncRun_status_startedAt_idx"
  ON "OpportunitySyncRun" ("status", "startedAt");

CREATE TABLE IF NOT EXISTS "OpportunitySyncSourceResult" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "fetched" INTEGER NOT NULL DEFAULT 0,
  "parsed" INTEGER NOT NULL DEFAULT 0,
  "valid" INTEGER NOT NULL DEFAULT 0,
  "rejected" INTEGER NOT NULL DEFAULT 0,
  "quarantined" INTEGER NOT NULL DEFAULT 0,
  "created" INTEGER NOT NULL DEFAULT 0,
  "updated" INTEGER NOT NULL DEFAULT 0,
  "unchanged" INTEGER NOT NULL DEFAULT 0,
  "duplicates" INTEGER NOT NULL DEFAULT 0,
  "stale" INTEGER NOT NULL DEFAULT 0,
  "closed" INTEGER NOT NULL DEFAULT 0,
  "errors" INTEGER NOT NULL DEFAULT 0,
  "durationMs" INTEGER,
  "error" TEXT,
  "metrics" JSONB,
  CONSTRAINT "OpportunitySyncSourceResult_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OpportunitySyncSourceResult_runId_fkey"
    FOREIGN KEY ("runId") REFERENCES "OpportunitySyncRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OpportunitySyncSourceResult_sourceKey_fkey"
    FOREIGN KEY ("sourceKey") REFERENCES "OpportunitySource"("key") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OpportunitySyncSourceResult_runId_idx"
  ON "OpportunitySyncSourceResult" ("runId");
CREATE INDEX IF NOT EXISTS "OpportunitySyncSourceResult_sourceKey_runId_idx"
  ON "OpportunitySyncSourceResult" ("sourceKey", "runId");

CREATE TABLE IF NOT EXISTS "OpportunitySyncLock" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "holder" TEXT,
  "lockedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OpportunitySyncLock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReferralProgram" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "programName" TEXT NOT NULL,
  "status" "ReferralProgramStatus" NOT NULL DEFAULT 'INACTIVE',
  "termsUrl" TEXT,
  "authorized" BOOLEAN NOT NULL DEFAULT false,
  "disclosure" TEXT NOT NULL DEFAULT 'Happy Tasking may earn a commission if you join through this link. This does not affect your pay or our company scores.',
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralProgram_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReferralProgram_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ReferralProgram_companyId_status_idx"
  ON "ReferralProgram" ("companyId", "status");

CREATE TABLE IF NOT EXISTS "ReferralDestination" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "opportunityId" TEXT,
  "programId" TEXT NOT NULL,
  "referralCode" TEXT,
  "referralUrl" TEXT NOT NULL,
  "campaign" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralDestination_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReferralDestination_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ReferralDestination_opportunityId_fkey"
    FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ReferralDestination_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "ReferralProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ReferralDestination_companyId_active_idx"
  ON "ReferralDestination" ("companyId", "active");
CREATE INDEX IF NOT EXISTS "ReferralDestination_opportunityId_active_idx"
  ON "ReferralDestination" ("opportunityId", "active");
