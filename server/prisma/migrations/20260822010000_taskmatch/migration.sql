-- TaskMatch pillar: opportunities, preferences, match snapshots.

CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
CREATE TYPE "LanguageProficiency" AS ENUM ('BASIC', 'CONVERSATIONAL', 'PROFESSIONAL', 'NATIVE');
CREATE TYPE "LookingStatus" AS ENUM ('READY', 'OPEN_TO_OFFERS', 'NOT_LOOKING');
CREATE TYPE "WorkloadBucket" AS ENUM ('UNDER_10', 'TEN_TO_TWENTY', 'TWENTY_TO_THIRTY', 'THIRTY_TO_FORTY', 'FORTY_PLUS');
CREATE TYPE "StartTiming" AS ENUM ('IMMEDIATELY', 'WITHIN_1_WEEK', 'WITHIN_2_WEEKS', 'WITHIN_1_MONTH', 'EXPLORING');
CREATE TYPE "OpportunityStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED', 'UNKNOWN');
CREATE TYPE "OpportunitySourceType" AS ENUM ('ADMIN', 'PUBLIC_LISTING', 'COMPANY_SUBMITTED', 'COMMUNITY_REPORTED');
CREATE TYPE "OpportunityRemoteType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "ApplicationJourneyStatus" AS ENUM ('SAVED', 'APPLIED', 'SCREENING', 'QUALIFIED', 'MATCHED', 'WORKING', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "TipModerationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

ALTER TABLE "UserSkill" ADD COLUMN "proficiency" "SkillProficiency";

CREATE TABLE "UserLanguage" (
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "proficiency" "LanguageProficiency" NOT NULL DEFAULT 'PROFESSIONAL',
  CONSTRAINT "UserLanguage_pkey" PRIMARY KEY ("userId", "code"),
  CONSTRAINT "UserLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UserWorkPreference" (
  "userId" TEXT NOT NULL,
  "lookingStatus" "LookingStatus",
  "workload" "WorkloadBucket",
  "startTiming" "StartTiming",
  "professionalExperienceYears" DOUBLE PRECISION,
  "aiWorkExperienceYears" DOUBLE PRECISION,
  "desiredRate" DOUBLE PRECISION,
  "desiredRateCurrency" TEXT NOT NULL DEFAULT 'USD',
  "desiredRateUnit" "RateUnit",
  "paymentModelPreference" "PaymentModel",
  "linkedinUrl" TEXT,
  "githubUrl" TEXT,
  "portfolioUrl" TEXT,
  "resumeUrl" TEXT,
  "summary" TEXT,
  "openToRecruiterContact" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserWorkPreference_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "UserWorkPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Opportunity" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" "OpportunityStatus" NOT NULL DEFAULT 'ACTIVE',
  "sourceType" "OpportunitySourceType" NOT NULL DEFAULT 'ADMIN',
  "sourceUrl" TEXT,
  "countryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "remoteType" "OpportunityRemoteType" NOT NULL DEFAULT 'REMOTE',
  "paymentModel" "PaymentModel" NOT NULL DEFAULT 'HOURLY',
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "minRate" DOUBLE PRECISION,
  "maxRate" DOUBLE PRECISION,
  "rateUnit" "RateUnit" NOT NULL DEFAULT 'HOURLY',
  "weeklyHoursMin" INTEGER,
  "weeklyHoursMax" INTEGER,
  "experienceYearsMin" DOUBLE PRECISION,
  "experienceYearsPreferred" DOUBLE PRECISION,
  "languageRequirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "applicationUrl" TEXT,
  "applicationProcess" JSONB,
  "screeningType" TEXT,
  "estimatedProcessMinutes" INTEGER,
  "screeningDifficulty" INTEGER,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "lastVerifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");
CREATE INDEX "Opportunity_companyId_status_idx" ON "Opportunity"("companyId", "status");
CREATE INDEX "Opportunity_status_lastVerifiedAt_idx" ON "Opportunity"("status", "lastVerifiedAt");
CREATE INDEX "Opportunity_featured_status_idx" ON "Opportunity"("featured", "status");

CREATE TABLE "OpportunitySkill" (
  "opportunityId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "preferredLevel" "SkillProficiency",
  CONSTRAINT "OpportunitySkill_pkey" PRIMARY KEY ("opportunityId", "skillId"),
  CONSTRAINT "OpportunitySkill_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OpportunitySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "OpportunityDomain" (
  "opportunityId" TEXT NOT NULL,
  "domainId" TEXT NOT NULL,
  CONSTRAINT "OpportunityDomain_pkey" PRIMARY KEY ("opportunityId", "domainId"),
  CONSTRAINT "OpportunityDomain_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OpportunityDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "OpportunityLanguage" (
  "opportunityId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "OpportunityLanguage_pkey" PRIMARY KEY ("opportunityId", "code"),
  CONSTRAINT "OpportunityLanguage_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "SavedOpportunity" (
  "userId" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("userId", "opportunityId"),
  CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UserOpportunityStatus" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "status" "ApplicationJourneyStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserOpportunityStatus_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserOpportunityStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserOpportunityStatus_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserOpportunityStatus_userId_opportunityId_key" ON "UserOpportunityStatus"("userId", "opportunityId");
CREATE INDEX "UserOpportunityStatus_userId_status_idx" ON "UserOpportunityStatus"("userId", "status");

CREATE TABLE "MatchSnapshot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "candidateMatchScore" INTEGER NOT NULL,
  "opportunityQualityScore" INTEGER,
  "confidence" TEXT NOT NULL,
  "recommendation" TEXT NOT NULL,
  "components" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatchSnapshot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MatchSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MatchSnapshot_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MatchSnapshot_userId_createdAt_idx" ON "MatchSnapshot"("userId", "createdAt");
CREATE INDEX "MatchSnapshot_opportunityId_createdAt_idx" ON "MatchSnapshot"("opportunityId", "createdAt");

CREATE TABLE "CompanyApplicationGuide" (
  "companyId" TEXT NOT NULL,
  "steps" JSONB NOT NULL,
  "estimatedTime" TEXT,
  "difficulty" INTEGER,
  "officialSourceUrl" TEXT,
  "officialSummary" TEXT,
  "communitySummary" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyApplicationGuide_pkey" PRIMARY KEY ("companyId"),
  CONSTRAINT "CompanyApplicationGuide_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ApplicationTip" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "opportunityId" TEXT,
  "companyId" TEXT,
  "body" TEXT NOT NULL,
  "status" "TipModerationStatus" NOT NULL DEFAULT 'PENDING',
  "flaggedReason" TEXT,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationTip_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ApplicationTip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ApplicationTip_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ApplicationTip_opportunityId_status_idx" ON "ApplicationTip"("opportunityId", "status");
CREATE INDEX "ApplicationTip_companyId_status_idx" ON "ApplicationTip"("companyId", "status");

CREATE TABLE "ScreeningReport" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "opportunityId" TEXT,
  "companyId" TEXT,
  "difficulty" INTEGER NOT NULL,
  "durationBucket" TEXT NOT NULL,
  "passed" BOOLEAN,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScreeningReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ScreeningReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ScreeningReport_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ScreeningReport_companyId_createdAt_idx" ON "ScreeningReport"("companyId", "createdAt");
CREATE INDEX "ScreeningReport_opportunityId_createdAt_idx" ON "ScreeningReport"("opportunityId", "createdAt");
