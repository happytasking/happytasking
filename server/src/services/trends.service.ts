import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import {
  computeTaskScore,
  TASK_SCORE_REVIEW_SELECT,
  type ReviewDimensions,
} from "./taskScore.service.js";

const AVAILABILITY_WEIGHT = {
  HIGH: 4,
  MODERATE: 3,
  LOW: 2,
  NO_TASKS: 1,
} as const;

type AvailabilityStatus = keyof typeof AVAILABILITY_WEIGHT;

export type TimePoint = {
  /** ISO date marking the end of the window this point summarizes. */
  date: string;
  label: string;
  value: number | null;
  sampleSize: number;
};

export type AvailabilityDay = {
  date: string;
  label: string;
  counts: Record<AvailabilityStatus, number>;
  index: number | null;
  sampleSize: number;
};

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dayLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short" });
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Rolling windows are used instead of disjoint buckets so a sparse week does not
 * make the line collapse to zero — each point is "the score as it would have
 * been displayed on that date".
 */
function rollingPoints<T extends { createdAt: Date }>(
  records: T[],
  options: {
    now: Date;
    points: number;
    stepDays: number;
    windowDays: number;
    compute: (subset: T[]) => number | null;
  },
): TimePoint[] {
  const { now, points, stepDays, windowDays, compute } = options;
  const result: TimePoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const end = addDays(startOfDay(now), -i * stepDays + 1);
    const start = addDays(end, -windowDays);
    const subset = records.filter(
      (r) => r.createdAt >= start && r.createdAt < end,
    );
    const pointDate = addDays(end, -1);
    result.push({
      date: pointDate.toISOString(),
      label: dayLabel(pointDate),
      value: compute(subset),
      sampleSize: subset.length,
    });
  }

  return result;
}

function round(value: number | null, digits = 0): number | null {
  if (value == null) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export async function getCompanyTrends(slug: string, now = new Date()) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) throw new ApiError(404, "Company not found");

  const since = addDays(startOfDay(now), -180);

  const [reviews, availability, payReports] = await Promise.all([
    prisma.review.findMany({
      where: { companyId: company.id, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: TASK_SCORE_REVIEW_SELECT,
    }),
    prisma.taskAvailabilityReport.findMany({
      where: { companyId: company.id, reportDate: { gte: addDays(startOfDay(now), -30) } },
      orderBy: { reportDate: "asc" },
    }),
    prisma.payReport.findMany({
      where: { companyId: company.id, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const taskScore = rollingPoints(reviews, {
    now,
    points: 12,
    stepDays: 7,
    windowDays: 30,
    compute: (subset) =>
      subset.length ? computeTaskScore(subset as ReviewDimensions[], "30d").taskScore : null,
  });

  const sentiment = rollingPoints(reviews, {
    now,
    points: 12,
    stepDays: 7,
    windowDays: 30,
    compute: (subset) => {
      const avg = mean(subset.map((r) => r.overallExperience));
      return avg == null ? null : round(((avg - 1) / 4) * 100);
    },
  });

  const reviewVolume = rollingPoints(reviews, {
    now,
    points: 12,
    stepDays: 7,
    windowDays: 7,
    compute: (subset) => subset.length,
  });

  return {
    company: { name: company.name, slug: company.slug, isDemo: company.isDemo },
    taskScore,
    sentiment,
    reviewVolume,
    availability: dailyAvailability(availability, now, 14),
    pay: monthlyPay(payReports, now, 6),
    dimensions: dimensionComparison(reviews),
  };
}

export function dailyAvailability(
  reports: { reportDate: Date; availabilityStatus: AvailabilityStatus }[],
  now: Date,
  days: number,
): AvailabilityDay[] {
  const result: AvailabilityDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = addDays(startOfDay(now), -i);
    const dayEnd = addDays(dayStart, 1);
    const dayReports = reports.filter(
      (r) => r.reportDate >= dayStart && r.reportDate < dayEnd,
    );

    const counts: Record<AvailabilityStatus, number> = {
      HIGH: 0,
      MODERATE: 0,
      LOW: 0,
      NO_TASKS: 0,
    };
    for (const r of dayReports) counts[r.availabilityStatus] += 1;

    const avg = mean(
      dayReports.map((r) => AVAILABILITY_WEIGHT[r.availabilityStatus]),
    );

    result.push({
      date: dayStart.toISOString(),
      label: dayLabel(dayStart),
      counts,
      // Normalize 1–4 onto 0–100 so it can share an axis with other indices.
      index: avg == null ? null : round(((avg - 1) / 3) * 100),
      sampleSize: dayReports.length,
    });
  }

  return result;
}

export function monthlyPay(
  reports: {
    createdAt: Date;
    advertisedRate: number | null;
    effectiveRate: number | null;
  }[],
  now: Date,
  months: number,
) {
  const result: {
    label: string;
    date: string;
    advertised: number | null;
    effective: number | null;
    sampleSize: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const subset = reports.filter(
      (r) => r.createdAt >= monthStart && r.createdAt < monthEnd,
    );

    result.push({
      label: monthLabel(monthStart),
      date: monthStart.toISOString(),
      advertised: round(
        mean(
          subset
            .map((r) => r.advertisedRate)
            .filter((v): v is number => v != null),
        ),
        2,
      ),
      effective: round(
        mean(
          subset
            .map((r) => r.effectiveRate)
            .filter((v): v is number => v != null),
        ),
        2,
      ),
      sampleSize: subset.length,
    });
  }

  return result;
}

function dimensionComparison(reviews: ReviewDimensions[]) {
  const score = computeTaskScore(reviews, "180d");
  return score.dimensions;
}

/**
 * Compact per-company series for list views. One query covers the whole page of
 * companies, so adding sparklines does not add a query per row.
 */
export async function getCompanySparklines(
  companyIds: string[],
  options: { points?: number; stepDays?: number; windowDays?: number; now?: Date } = {},
) {
  const { points = 8, stepDays = 7, windowDays = 30, now = new Date() } = options;
  const result = new Map<string, (number | null)[]>();
  if (!companyIds.length) return result;

  const since = addDays(startOfDay(now), -(points * stepDays + windowDays));
  const reviews = await prisma.review.findMany({
    where: { companyId: { in: companyIds }, createdAt: { gte: since } },
    select: { companyId: true, createdAt: true, overallExperience: true },
  });

  const byCompany = new Map<string, typeof reviews>();
  for (const review of reviews) {
    const bucket = byCompany.get(review.companyId) ?? [];
    bucket.push(review);
    byCompany.set(review.companyId, bucket);
  }

  for (const companyId of companyIds) {
    const records = byCompany.get(companyId) ?? [];
    result.set(
      companyId,
      rollingPoints(records, {
        now,
        points,
        stepDays,
        windowDays,
        compute: (subset) => {
          const avg = mean(subset.map((r) => r.overallExperience));
          return avg == null ? null : round(((avg - 1) / 4) * 100);
        },
      }).map((p) => p.value),
    );
  }

  return result;
}

export async function getMarketTrends(now = new Date()) {
  const since = addDays(startOfDay(now), -180);

  const [reviews, availability, domains, payReports] = await Promise.all([
    prisma.review.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: TASK_SCORE_REVIEW_SELECT,
    }),
    prisma.taskAvailabilityReport.findMany({
      where: { reportDate: { gte: addDays(startOfDay(now), -30) } },
      orderBy: { reportDate: "asc" },
    }),
    prisma.domain.findMany({ orderBy: { name: "asc" } }),
    prisma.payReport.findMany({
      where: { createdAt: { gte: since } },
      include: { domain: true },
    }),
  ]);

  const sentiment = rollingPoints(reviews, {
    now,
    points: 12,
    stepDays: 7,
    windowDays: 30,
    compute: (subset) => {
      const avg = mean(subset.map((r) => r.overallExperience));
      return avg == null ? null : round(((avg - 1) / 4) * 100);
    },
  });

  const reputation = rollingPoints(reviews, {
    now,
    points: 12,
    stepDays: 7,
    windowDays: 30,
    compute: (subset) =>
      subset.length ? computeTaskScore(subset as ReviewDimensions[], "30d").taskScore : null,
  });

  const payByDomainOverTime = domains
    .map((domain) => {
      const reportsForDomain = payReports.filter((r) => r.domainId === domain.id);
      return {
        domain: domain.name,
        slug: domain.slug,
        points: monthlyPay(reportsForDomain, now, 6),
        sampleSize: reportsForDomain.length,
      };
    })
    .filter((d) => d.sampleSize > 0);

  return {
    isDemo: true,
    label: "DEMO DATA — illustrative market trends",
    sentiment,
    reputation,
    availability: dailyAvailability(availability, now, 14),
    payByDomainOverTime,
  };
}
