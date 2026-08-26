import { prisma } from "../lib/prisma.js";
import { getCompanyTaskScore, getTaskPulse } from "./company.service.js";
import {
  computeOpportunityQuality,
  type OpportunityQuality,
} from "../lib/taskmatch.js";

async function resolutionScore(companyId: string): Promise<number | null> {
  const issues = await prisma.complaint.findMany({
    where: {
      companyId,
      isDemo: false,
      status: {
        in: [
          "PUBLISHED",
          "COMPANY_RESPONDED",
          "RESOLUTION_PENDING",
          "RESOLVED",
          "PARTIALLY_RESOLVED",
          "UNRESOLVED",
        ],
      },
    },
    select: { status: true, resolutionSatisfaction: true },
  });
  // Missing resolution data is omitted, never treated as zero.
  if (issues.length < 3) return null;
  const resolved = issues.filter((i) =>
    ["RESOLVED", "PARTIALLY_RESOLVED"].includes(i.status),
  ).length;
  const satisfaction = issues
    .map((i) => i.resolutionSatisfaction)
    .filter((n): n is number => n != null);
  const resolvePct = (resolved / issues.length) * 100;
  if (!satisfaction.length) return Math.round(resolvePct);
  const sat =
    (satisfaction.reduce((a, b) => a + b, 0) / satisfaction.length / 5) * 100;
  return Math.round(resolvePct * 0.6 + sat * 0.4);
}

export type CompanyIntelligence = {
  quality: OpportunityQuality;
  taskScore: number | null;
  pulse: Awaited<ReturnType<typeof getTaskPulse>>;
};

export async function getOpportunityQuality(
  companyId: string,
): Promise<CompanyIntelligence> {
  const [score, pulse, resolution] = await Promise.all([
    getCompanyTaskScore(companyId, "90d", undefined, { realOnly: true }),
    getTaskPulse(companyId, { realOnly: true }),
    resolutionScore(companyId),
  ]);
  const quality = computeOpportunityQuality({
    taskScore: score.taskScore,
    taskAvailability: pulse.availability,
    pay: score.dimensions.pay,
    stability: score.dimensions.projectStability,
    paymentReliability: score.dimensions.paymentReliability,
    reviewerFairness: score.dimensions.reviewerFairness,
    sentiment: score.dimensions.overallExperience,
    resolution,
  });
  return {
    quality,
    taskScore: score.taskScore,
    pulse,
  };
}

export async function getOpportunityQualityMap(companyIds: string[]) {
  const unique = [...new Set(companyIds)];
  const entries = await Promise.all(
    unique.map(async (id) => [id, await getOpportunityQuality(id)] as const),
  );
  return new Map(entries);
}
