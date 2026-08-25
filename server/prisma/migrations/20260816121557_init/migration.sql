-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('UNCLAIMED', 'PENDING', 'CLAIMED');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('HIGH', 'MODERATE', 'LOW', 'NO_TASKS');

-- CreateEnum
CREATE TYPE "PaymentModel" AS ENUM ('HOURLY', 'PER_TASK', 'MILESTONE', 'MIXED');

-- CreateEnum
CREATE TYPE "RateUnit" AS ENUM ('HOURLY', 'PER_TASK', 'MILESTONE');

-- CreateEnum
CREATE TYPE "DiscussionCategory" AS ENUM ('GENERAL', 'PAY', 'TASK_AVAILABILITY', 'ONBOARDING', 'REVIEWERS', 'SUPPORT', 'SKILLS', 'PLATFORM');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('PAYMENT', 'REVIEWER_DISPUTE', 'PROJECT_REMOVAL', 'ACCOUNT_SUSPENSION', 'SUPPORT', 'RATE_CHANGE', 'UNPAID_ONBOARDING', 'GUIDELINES', 'TASK_AVAILABILITY', 'REIMBURSEMENT', 'THROTTLE_TASK_LIMIT', 'PLATFORM_ERROR', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'VERIFIED', 'PUBLISHED', 'COMPANY_RESPONDED', 'RESOLUTION_PENDING', 'RESOLVED', 'PARTIALLY_RESOLVED', 'UNRESOLVED');

-- CreateEnum
CREATE TYPE "VoteTargetType" AS ENUM ('DISCUSSION', 'COMMENT', 'REVIEW');

-- CreateEnum
CREATE TYPE "IdentityMode" AS ENUM ('ANONYMOUS', 'USERNAME');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT NOT NULL,
    "country" TEXT,
    "timezone" TEXT,
    "publicProfileEnabled" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "contributionScore" INTEGER NOT NULL DEFAULT 0,
    "trustLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "website" TEXT,
    "logoUrl" TEXT,
    "headquarters" TEXT,
    "country" TEXT,
    "companyStatus" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "claimStatus" "ClaimStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "claimedAt" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "domainId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerExperience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "domainId" TEXT,
    "country" TEXT,
    "startMonth" TIMESTAMP(3),
    "endMonth" TIMESTAMP(3),
    "currentlyActive" BOOLEAN NOT NULL DEFAULT false,
    "workModel" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceSkill" (
    "experienceId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ExperienceSkill_pkey" PRIMARY KEY ("experienceId","skillId")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "experienceId" TEXT,
    "domainId" TEXT,
    "country" TEXT,
    "currentlyActive" BOOLEAN,
    "startMonth" TIMESTAMP(3),
    "endMonth" TIMESTAMP(3),
    "overallExperience" INTEGER NOT NULL,
    "paySatisfaction" INTEGER NOT NULL,
    "paymentReliability" INTEGER NOT NULL,
    "taskAvailability" INTEGER NOT NULL,
    "projectStability" INTEGER NOT NULL,
    "reviewerFairness" INTEGER NOT NULL,
    "guidelineClarity" INTEGER NOT NULL,
    "supportQuality" INTEGER NOT NULL,
    "transparency" INTEGER NOT NULL,
    "flexibility" INTEGER,
    "wouldWorkAgain" BOOLEAN NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "identityMode" "IdentityMode" NOT NULL DEFAULT 'ANONYMOUS',
    "displayName" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSkill" (
    "reviewId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ReviewSkill_pkey" PRIMARY KEY ("reviewId","skillId")
);

-- CreateTable
CREATE TABLE "CompanyScoreSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "taskScore" DOUBLE PRECISION NOT NULL,
    "pay" DOUBLE PRECISION,
    "paymentReliability" DOUBLE PRECISION,
    "taskAvailability" DOUBLE PRECISION,
    "projectStability" DOUBLE PRECISION,
    "reviewerFairness" DOUBLE PRECISION,
    "guidelineClarity" DOUBLE PRECISION,
    "supportQuality" DOUBLE PRECISION,
    "transparency" DOUBLE PRECISION,
    "wouldWorkAgainRate" DOUBLE PRECISION,
    "sampleSize" INTEGER NOT NULL,
    "verifiedPct" DOUBLE PRECISION NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "DiscussionCategory" NOT NULL DEFAULT 'GENERAL',
    "authorId" TEXT,
    "companyId" TEXT,
    "domainId" TEXT,
    "skillId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "VoteTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "domainId" TEXT,
    "country" TEXT,
    "advertisedRate" DOUBLE PRECISION,
    "advertisedRateUnit" "RateUnit",
    "effectiveRate" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentModel" "PaymentModel" NOT NULL DEFAULT 'HOURLY',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayReportSkill" (
    "payReportId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "PayReportSkill_pkey" PRIMARY KEY ("payReportId","skillId")
);

-- CreateTable
CREATE TABLE "TaskAvailabilityReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "domainId" TEXT,
    "country" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availabilityStatus" "AvailabilityStatus" NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAvailabilityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySkill" (
    "reportId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "AvailabilitySkill_pkey" PRIMARY KEY ("reportId","skillId")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "category" "ComplaintCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "desiredOutcome" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "publicIdentityMode" "IdentityMode" NOT NULL DEFAULT 'ANONYMOUS',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "companyResponse" TEXT,
    "resolutionStatus" TEXT,
    "resolutionSatisfaction" INTEGER,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchPanelOptIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optedIn" BOOLEAN NOT NULL DEFAULT true,
    "domains" TEXT[],
    "skills" TEXT[],
    "countries" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchPanelOptIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_claimStatus_idx" ON "Company"("claimStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "WorkerExperience_companyId_idx" ON "WorkerExperience"("companyId");

-- CreateIndex
CREATE INDEX "WorkerExperience_userId_idx" ON "WorkerExperience"("userId");

-- CreateIndex
CREATE INDEX "Review_companyId_createdAt_idx" ON "Review"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_domainId_idx" ON "Review"("domainId");

-- CreateIndex
CREATE INDEX "CompanyScoreSnapshot_taskScore_idx" ON "CompanyScoreSnapshot"("taskScore");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyScoreSnapshot_companyId_period_key" ON "CompanyScoreSnapshot"("companyId", "period");

-- CreateIndex
CREATE INDEX "Discussion_companyId_createdAt_idx" ON "Discussion"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Discussion_createdAt_idx" ON "Discussion"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_discussionId_createdAt_idx" ON "Comment"("discussionId", "createdAt");

-- CreateIndex
CREATE INDEX "Vote_targetType_targetId_idx" ON "Vote"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_targetType_targetId_key" ON "Vote"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "PayReport_companyId_createdAt_idx" ON "PayReport"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskAvailabilityReport_companyId_reportDate_idx" ON "TaskAvailabilityReport"("companyId", "reportDate");

-- CreateIndex
CREATE INDEX "TaskAvailabilityReport_reportDate_idx" ON "TaskAvailabilityReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_publicId_key" ON "Complaint"("publicId");

-- CreateIndex
CREATE INDEX "Complaint_companyId_submittedAt_idx" ON "Complaint"("companyId", "submittedAt");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchPanelOptIn_userId_key" ON "ResearchPanelOptIn"("userId");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerExperience" ADD CONSTRAINT "WorkerExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerExperience" ADD CONSTRAINT "WorkerExperience_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerExperience" ADD CONSTRAINT "WorkerExperience_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceSkill" ADD CONSTRAINT "ExperienceSkill_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "WorkerExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceSkill" ADD CONSTRAINT "ExperienceSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "WorkerExperience"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSkill" ADD CONSTRAINT "ReviewSkill_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSkill" ADD CONSTRAINT "ReviewSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyScoreSnapshot" ADD CONSTRAINT "CompanyScoreSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayReport" ADD CONSTRAINT "PayReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayReport" ADD CONSTRAINT "PayReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayReport" ADD CONSTRAINT "PayReport_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayReportSkill" ADD CONSTRAINT "PayReportSkill_payReportId_fkey" FOREIGN KEY ("payReportId") REFERENCES "PayReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayReportSkill" ADD CONSTRAINT "PayReportSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAvailabilityReport" ADD CONSTRAINT "TaskAvailabilityReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAvailabilityReport" ADD CONSTRAINT "TaskAvailabilityReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAvailabilityReport" ADD CONSTRAINT "TaskAvailabilityReport_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySkill" ADD CONSTRAINT "AvailabilitySkill_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "TaskAvailabilityReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySkill" ADD CONSTRAINT "AvailabilitySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchPanelOptIn" ADD CONSTRAINT "ResearchPanelOptIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
