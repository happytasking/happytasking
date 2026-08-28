import { z } from "zod";
import { scoreToStars } from "../lib/stars.js";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { getCompanyTaskScore, getTaskPulse } from "./company.service.js";
import {
  computeTaskScore,
  hasMinimumPublicSample,
  periodStartDate,
  TASK_SCORE_REVIEW_SELECT,
} from "./taskScore.service.js";
import { recordActivationIfNeeded, trackEvent } from "./analytics.service.js";
import { maybeAwardFoundingTasker } from "./badge.service.js";
import { hiringActivityByCompany } from "../opportunities/lifecycle.js";

export const payReportSchema = z.object({
  companySlug: z.string(),
  domainId: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  country: z.string().optional(),
  advertisedRate: z.number().positive().optional(),
  advertisedRateUnit: z.enum(["HOURLY", "PER_TASK", "MILESTONE"]).optional(),
  effectiveRate: z.number().positive().optional(),
  currency: z.string().default("USD"),
  paymentModel: z
    .enum(["HOURLY", "PER_TASK", "MILESTONE", "MIXED"])
    .default("HOURLY"),
});

export const availabilityReportSchema = z.object({
  companySlug: z.string(),
  domainId: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  country: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  availabilityStatus: z.enum(["HIGH", "MODERATE", "LOW", "NO_TASKS"]),
  source: z.enum(["onboarding", "quick_pulse", "form"]).optional(),
});

export async function createPayReport(
  input: z.infer<typeof payReportSchema>,
  userId?: string,
) {
  const company = await prisma.company.findUnique({
    where: { slug: input.companySlug },
  });
  if (!company) throw new ApiError(404, "Company not found");

  const report = await prisma.payReport.create({
    data: {
      companyId: company.id,
      userId: userId || null,
      domainId: input.domainId || null,
      country: input.country,
      advertisedRate: input.advertisedRate,
      advertisedRateUnit: input.advertisedRateUnit,
      effectiveRate: input.effectiveRate,
      currency: input.currency,
      paymentModel: input.paymentModel,
      skills: input.skillIds?.length
        ? { create: input.skillIds.map((skillId) => ({ skillId })) }
        : undefined,
    },
    include: {
      domain: true,
      company: { select: { name: true, slug: true, logoUrl: true } },
    },
  });

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { contributionScore: { increment: 3 } },
    });
    await recordActivationIfNeeded(userId);
    await maybeAwardFoundingTasker(userId);
  }

  return report;
}

export async function createAvailabilityReport(
  input: z.infer<typeof availabilityReportSchema>,
  userId?: string,
) {
  const company = await prisma.company.findUnique({
    where: { slug: input.companySlug },
  });
  if (!company) throw new ApiError(404, "Company not found");

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { country: true, countryCode: true },
      })
    : null;

  const report = await prisma.taskAvailabilityReport.create({
    data: {
      companyId: company.id,
      userId: userId || null,
      domainId: input.domainId || null,
      country: input.country || user?.country || null,
      countryCode: input.countryCode || user?.countryCode || null,
      availabilityStatus: input.availabilityStatus,
      skills: input.skillIds?.length
        ? { create: input.skillIds.map((skillId) => ({ skillId })) }
        : undefined,
    },
    include: {
      domain: true,
      company: { select: { name: true, slug: true, logoUrl: true } },
    },
  });

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { contributionScore: { increment: 4 } },
    });
    if (input.source === "onboarding") {
      await trackEvent("onboarding_taskpulse_submitted", {
        userId,
        properties: {
          companySlug: company.slug,
          availabilityStatus: input.availabilityStatus,
        },
      });
    }
    await recordActivationIfNeeded(userId);
    await maybeAwardFoundingTasker(userId);
  }

  const pulse = await getTaskPulse(company.id, {
    domainId: input.domainId,
    realOnly: !company.isDemo,
  });
  return { report, pulse };
}

export async function getMarketDashboard() {
  const domains = await prisma.domain.findMany({ orderBy: { name: "asc" } });
  const payReports = await prisma.payReport.findMany({
    include: { domain: true },
  });

  const medianEffectiveByDomain = domains.map((domain) => {
    const rates = payReports
      .filter((r) => r.domainId === domain.id && r.effectiveRate != null)
      .map((r) => r.effectiveRate!)
      .sort((a, b) => a - b);
    return {
      domain: domain.name,
      slug: domain.slug,
      medianEffectiveRate: median(rates),
      sampleSize: rates.length,
    };
  });

  const companies = await prisma.company.findMany({
    where: { companyStatus: "ACTIVE" },
  });

  const stability = await Promise.all(
    companies.slice(0, 12).map(async (c) => {
      const score = await computeCompanyPeriodScore(c.id, "90d");
      const pulse = await getTaskPulse(c.id, { realOnly: !c.isDemo });
      return {
        company: c.name,
        slug: c.slug,
        logoUrl: c.logoUrl,
        stability: score.dimensions.projectStability,
        taskScore: score.taskScore,
        availability: pulse.availability,
        trend: pulse.trend,
      };
    }),
  );

  const since7 = periodStartDate("7d")!;
  const recentReviews = await prisma.review.findMany({
    where: { createdAt: { gte: since7 } },
  });
  const sentiment =
    recentReviews.length === 0
      ? null
      : Math.round(
          (recentReviews.reduce((s, r) => s + r.overallExperience, 0) /
            recentReviews.length /
            5) *
            100,
        );

  const demand = medianEffectiveByDomain.map((d) => {
    const recent = payReports.filter(
      (r) =>
        r.domain?.slug === d.slug &&
        r.createdAt >= since7 &&
        r.effectiveRate != null,
    ).length;
    return {
      domain: d.domain,
      slug: d.slug,
      signal: recent >= 3 ? "up" : recent === 0 ? "down" : "flat",
      recentReports: recent,
    };
  });

  const allAvailability = await prisma.taskAvailabilityReport.findMany({
    where: { reportDate: { gte: since7 } },
  });
  const availScore =
    allAvailability.length === 0
      ? null
      : allAvailability.reduce((s, r) => {
          const map = { HIGH: 4, MODERATE: 3, LOW: 2, NO_TASKS: 1 };
          return s + map[r.availabilityStatus];
        }, 0) / allAvailability.length;

  let marketAvailability: string | null = null;
  if (availScore != null) {
    if (availScore >= 3.5) marketAvailability = "HIGH";
    else if (availScore >= 2.5) marketAvailability = "MODERATE";
    else if (availScore >= 1.5) marketAvailability = "LOW";
    else marketAvailability = "NO_TASKS";
  }

  const overallMedian = median(
    payReports
      .filter((r) => r.effectiveRate != null)
      .map((r) => r.effectiveRate!),
  );

  const hiringActivity = (await hiringActivityByCompany()).slice(0, 12).map((row) => ({
    name: row.company!.name,
    slug: row.company!.slug,
    logoUrl: row.company!.logoUrl,
    activeOpportunities: row.activeOpportunities,
  }));

  return {
    isDemo: true,
    label: "DEMO DATA — illustrative market signals",
    pulse: {
      taskAvailability: marketAvailability,
      medianEffectiveRate: overallMedian,
      workerSentiment: sentiment,
      marketStability:
        stability.filter((s) => (s.stability ?? 0) >= 60).length /
          Math.max(stability.length, 1) >=
        0.5
          ? "Stable"
          : "Mixed",
    },
    medianEffectiveByDomain,
    demand,
    stability: stability.sort(
      (a, b) => (b.stability ?? -1) - (a.stability ?? -1),
    ),
    workerSentiment: sentiment,
    hiringActivity,
  };
}

async function computeCompanyPeriodScore(companyId: string, period: string) {
  const since = periodStartDate(period);
  const reviews = await prisma.review.findMany({
    where: {
      companyId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: TASK_SCORE_REVIEW_SELECT,
  });
  return computeTaskScore(reviews, period);
}

export async function getLiveMarket(limit = 12) {
  const companies = await prisma.company.findMany({
    where: { companyStatus: "ACTIVE" },
  });
  const since7 = periodStartDate("7d")!;
  const updatedAt = new Date();

  const items = await Promise.all(
    companies.map(async (company) => {
      const [score7d, score90d, pulse, payReports] = await Promise.all([
        getCompanyTaskScore(company.id, "7d", undefined, { realOnly: !company.isDemo }),
        getCompanyTaskScore(company.id, "90d", undefined, { realOnly: !company.isDemo }),
        getTaskPulse(company.id, { realOnly: !company.isDemo }),
        prisma.payReport.findMany({
          where: {
            companyId: company.id,
            createdAt: { gte: since7 },
            effectiveRate: { not: null },
          },
          select: { effectiveRate: true },
        }),
      ]);

      const publicSample = hasMinimumPublicSample(score7d.sampleSize);
      const payScore = score7d.dimensions.pay ?? score90d.dimensions.pay;
      const stabilityScore =
        score7d.dimensions.projectStability ??
        score90d.dimensions.projectStability;

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        country: company.country,
        isDemo: company.isDemo,
        taskScore: publicSample ? score7d.taskScore : null,
        sampleSize: score7d.sampleSize,
        insufficientData: !publicSample,
        confidence: score7d.confidence,
        pulse,
        payStars: scoreToStars(payScore),
        stabilityStars: scoreToStars(stabilityScore),
        medianEffectiveRate: median(
          payReports.map((report) => report.effectiveRate!),
        ),
      };
    }),
  );

  const availabilityRank = {
    HIGH: 4,
    MODERATE: 3,
    LOW: 2,
    NO_TASKS: 1,
  } as const;

  items.sort((a, b) => {
    const scoreDelta = (b.taskScore ?? -1) - (a.taskScore ?? -1);
    if (scoreDelta !== 0) return scoreDelta;
    const aAvail = a.pulse.availability
      ? availabilityRank[a.pulse.availability]
      : 0;
    const bAvail = b.pulse.availability
      ? availabilityRank[b.pulse.availability]
      : 0;
    return bAvail - aAvail;
  });

  return {
    period: "7d",
    source: "contributor reports",
    updatedAt: updatedAt.toISOString(),
    items: items.slice(0, limit),
  };
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  return Math.round(value * 100) / 100;
}
