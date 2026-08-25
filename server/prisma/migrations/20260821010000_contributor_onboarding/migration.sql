-- Contributor onboarding, profile visibility, badges, and analytics.

CREATE TYPE "TenureBucket" AS ENUM (
  'LESS_THAN_1_MONTH',
  'ONE_TO_THREE_MONTHS',
  'THREE_TO_SIX_MONTHS',
  'SIX_TO_TWELVE_MONTHS',
  'ONE_TO_TWO_YEARS',
  'TWO_PLUS_YEARS'
);

CREATE TYPE "FieldVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'AGGREGATE_ONLY');

CREATE TYPE "BadgeType" AS ENUM ('FOUNDING_TASKER');

ALTER TABLE "User"
  ADD COLUMN "onboardingStartedAt" TIMESTAMP(3),
  ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3),
  ADD COLUMN "onboardingVersion" INTEGER,
  ADD COLUMN "activatedAt" TIMESTAMP(3);

CREATE INDEX "User_onboardingCompletedAt_idx" ON "User"("onboardingCompletedAt");

ALTER TABLE "Skill" ADD COLUMN "userSuggested" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "WorkerExperience" ADD COLUMN "tenureBucket" "TenureBucket";

CREATE UNIQUE INDEX "WorkerExperience_userId_companyId_key" ON "WorkerExperience"("userId", "companyId");
CREATE INDEX "WorkerExperience_currentlyActive_companyId_idx" ON "WorkerExperience"("currentlyActive", "companyId");

CREATE TABLE "UserDomain" (
  "userId" TEXT NOT NULL,
  "domainId" TEXT NOT NULL,
  CONSTRAINT "UserDomain_pkey" PRIMARY KEY ("userId", "domainId"),
  CONSTRAINT "UserDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UserSkill" (
  "userId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("userId", "skillId"),
  CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "OnboardingProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "currentStep" TEXT NOT NULL DEFAULT 'welcome',
  "skippedSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OnboardingProgress_userId_key" ON "OnboardingProgress"("userId");

CREATE TABLE "ProfileVisibility" (
  "userId" TEXT NOT NULL,
  "country" "FieldVisibility" NOT NULL DEFAULT 'AGGREGATE_ONLY',
  "domains" "FieldVisibility" NOT NULL DEFAULT 'AGGREGATE_ONLY',
  "skills" "FieldVisibility" NOT NULL DEFAULT 'AGGREGATE_ONLY',
  "companyExperience" "FieldVisibility" NOT NULL DEFAULT 'AGGREGATE_ONLY',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileVisibility_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "ProfileVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UserBadge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "BadgeType" NOT NULL,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserBadge_userId_type_key" ON "UserBadge"("userId", "type");
CREATE INDEX "UserBadge_type_idx" ON "UserBadge"("type");

CREATE TABLE "PlatformSetting" (
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "properties" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");
