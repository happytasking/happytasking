-- Additive schema/data foundation for contribution history, market signals,
-- watches, notifications, and normalized ISO 3166-1 alpha-2 country codes.

-- CreateEnum
CREATE TYPE "ContributionImpactType" AS ENUM ('SUBMISSION', 'VERIFICATION', 'COMMUNITY_ENGAGEMENT', 'MODERATION', 'ADJUSTMENT');
CREATE TYPE "ContributionSourceType" AS ENUM ('REVIEW', 'PAY_REPORT', 'TASK_AVAILABILITY_REPORT', 'DISCUSSION', 'COMMENT', 'COMPLAINT', 'OTHER');
CREATE TYPE "SignalScopeType" AS ENUM ('GLOBAL', 'COMPANY', 'DOMAIN', 'SKILL', 'COUNTRY', 'COMPANY_DOMAIN', 'COMPANY_SKILL', 'COMPANY_COUNTRY', 'DOMAIN_COUNTRY', 'SKILL_COUNTRY', 'CUSTOM');
CREATE TYPE "MarketSignalType" AS ENUM ('TASK_AVAILABILITY', 'PAY_RATE', 'TASK_SCORE', 'REVIEW_VOLUME', 'WORKER_SENTIMENT');
CREATE TYPE "TaskWatchType" AS ENUM ('TASK_AVAILABILITY', 'PAY_RATE', 'TASK_SCORE', 'MARKET_SIGNAL');
CREATE TYPE "NotificationType" AS ENUM ('WATCH_TRIGGERED', 'CONTRIBUTION_UPDATE', 'SYSTEM');
CREATE TYPE "EmailDeliveryState" AS ENUM ('NOT_REQUESTED', 'PENDING', 'SENT', 'FAILED', 'SUPPRESSED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "Review" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "WorkerExperience" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "PayReport" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "TaskAvailabilityReport" ADD COLUMN "countryCode" TEXT;

-- CreateTable
CREATE TABLE "ContributionImpact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "impactType" "ContributionImpactType" NOT NULL,
    "sourceType" "ContributionSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "beforeSnapshot" JSONB,
    "afterSnapshot" JSONB,
    "metadata" JSONB,
    "reviewId" TEXT,
    "payReportId" TEXT,
    "taskAvailabilityReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContributionImpact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketSignalSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "signalType" "MarketSignalType" NOT NULL,
    "scopeType" "SignalScopeType" NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketSignalSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "watchType" "TaskWatchType" NOT NULL,
    "scopeType" "SignalScopeType" NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "notifyInApp" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaskWatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "taskWatchId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "dedupeKey" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "emailDeliveryState" "EmailDeliveryState" NOT NULL DEFAULT 'NOT_REQUESTED',
    "emailAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailLastAttemptAt" TIMESTAMP(3),
    "emailDeliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_countryCode_createdAt_idx" ON "User"("countryCode", "createdAt");
CREATE INDEX "Review_countryCode_domainId_createdAt_idx" ON "Review"("countryCode", "domainId", "createdAt");
CREATE INDEX "WorkerExperience_country_domain_created_idx" ON "WorkerExperience"("countryCode", "domainId", "createdAt");
CREATE INDEX "PayReport_countryCode_domainId_createdAt_idx" ON "PayReport"("countryCode", "domainId", "createdAt");
CREATE INDEX "TaskAvailabilityReport_country_domain_created_idx" ON "TaskAvailabilityReport"("countryCode", "domainId", "createdAt");

CREATE UNIQUE INDEX "ContributionImpact_source_dedupe_key" ON "ContributionImpact"("userId", "impactType", "sourceType", "sourceId");
CREATE INDEX "ContributionImpact_sourceType_sourceId_idx" ON "ContributionImpact"("sourceType", "sourceId");
CREATE INDEX "ContributionImpact_companyId_createdAt_idx" ON "ContributionImpact"("companyId", "createdAt");
CREATE INDEX "ContributionImpact_userId_createdAt_idx" ON "ContributionImpact"("userId", "createdAt");

CREATE UNIQUE INDEX "MarketSignalSnapshot_scope_target_period_key" ON "MarketSignalSnapshot"("signalType", "scopeType", "scopeKey", "targetType", "targetKey", "periodEnd");
CREATE INDEX "MarketSignalSnapshot_scope_signal_created_idx" ON "MarketSignalSnapshot"("scopeType", "scopeKey", "signalType", "createdAt");
CREATE INDEX "MarketSignalSnapshot_targetType_targetKey_createdAt_idx" ON "MarketSignalSnapshot"("targetType", "targetKey", "createdAt");
CREATE INDEX "MarketSignalSnapshot_companyId_createdAt_idx" ON "MarketSignalSnapshot"("companyId", "createdAt");

CREATE UNIQUE INDEX "TaskWatch_owner_scope_target_key" ON "TaskWatch"("userId", "watchType", "scopeType", "scopeKey", "targetType", "targetKey");
CREATE INDEX "TaskWatch_scopeType_scopeKey_enabled_idx" ON "TaskWatch"("scopeType", "scopeKey", "enabled");
CREATE INDEX "TaskWatch_targetType_targetKey_enabled_idx" ON "TaskWatch"("targetType", "targetKey", "enabled");
CREATE INDEX "TaskWatch_companyId_enabled_idx" ON "TaskWatch"("companyId", "enabled");

CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");
CREATE INDEX "Notification_email_delivery_queue_idx" ON "Notification"("emailDeliveryState", "emailAttempts", "createdAt");
CREATE INDEX "Notification_taskWatchId_createdAt_idx" ON "Notification"("taskWatchId", "createdAt");

-- AddForeignKey
ALTER TABLE "ContributionImpact" ADD CONSTRAINT "ContributionImpact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContributionImpact" ADD CONSTRAINT "ContributionImpact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContributionImpact" ADD CONSTRAINT "ContributionImpact_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContributionImpact" ADD CONSTRAINT "ContributionImpact_payReportId_fkey" FOREIGN KEY ("payReportId") REFERENCES "PayReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContributionImpact" ADD CONSTRAINT "ContributionImpact_taskAvailabilityReportId_fkey" FOREIGN KEY ("taskAvailabilityReportId") REFERENCES "TaskAvailabilityReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketSignalSnapshot" ADD CONSTRAINT "MarketSignalSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskWatch" ADD CONSTRAINT "TaskWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskWatch" ADD CONSTRAINT "TaskWatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_taskWatchId_fkey" FOREIGN KEY ("taskWatchId") REFERENCES "TaskWatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Safe backfill for country values currently used by seed/live records. Unknown
-- values remain NULL so they can be normalized deliberately rather than guessed.
CREATE TEMP TABLE "country_code_backfill" (
    "country" TEXT PRIMARY KEY,
    "code" TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO "country_code_backfill" ("country", "code") VALUES
    ('argentina', 'AR'),
    ('australia', 'AU'),
    ('brazil', 'BR'),
    ('canada', 'CA'),
    ('egypt', 'EG'),
    ('france', 'FR'),
    ('germany', 'DE'),
    ('india', 'IN'),
    ('indonesia', 'ID'),
    ('japan', 'JP'),
    ('kenya', 'KE'),
    ('mexico', 'MX'),
    ('morocco', 'MA'),
    ('netherlands', 'NL'),
    ('philippines', 'PH'),
    ('poland', 'PL'),
    ('singapore', 'SG'),
    ('south korea', 'KR'),
    ('republic of korea', 'KR'),
    ('united arab emirates', 'AE'),
    ('united kingdom', 'GB'),
    ('uk', 'GB'),
    ('great britain', 'GB'),
    ('united states', 'US'),
    ('united states of america', 'US'),
    ('usa', 'US');

UPDATE "User" AS target
SET "countryCode" = mapping."code"
FROM "country_code_backfill" AS mapping
WHERE target."countryCode" IS NULL
  AND lower(trim(target."country")) = mapping."country";

UPDATE "Review" AS target
SET "countryCode" = mapping."code"
FROM "country_code_backfill" AS mapping
WHERE target."countryCode" IS NULL
  AND lower(trim(target."country")) = mapping."country";

UPDATE "WorkerExperience" AS target
SET "countryCode" = mapping."code"
FROM "country_code_backfill" AS mapping
WHERE target."countryCode" IS NULL
  AND lower(trim(target."country")) = mapping."country";

UPDATE "PayReport" AS target
SET "countryCode" = mapping."code"
FROM "country_code_backfill" AS mapping
WHERE target."countryCode" IS NULL
  AND lower(trim(target."country")) = mapping."country";

UPDATE "TaskAvailabilityReport" AS target
SET "countryCode" = mapping."code"
FROM "country_code_backfill" AS mapping
WHERE target."countryCode" IS NULL
  AND lower(trim(target."country")) = mapping."country";
