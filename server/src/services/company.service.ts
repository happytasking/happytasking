import { z } from "zod";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import {
  computeTaskScore,
  hasMinimumPublicSample,
  periodStartDate,
  TASK_SCORE_REVIEW_SELECT,
} from "./taskScore.service.js";
import { getCompanySparklines } from "./trends.service.js";
import { companySEOEligibility } from "./companySeo.eligibility.js";
import type { ComplaintStatus } from "@prisma/client";

const PUBLIC_ISSUE_STATUSES: ComplaintStatus[] = [
  "PUBLISHED",
  "COMPANY_RESPONDED",
  "RESOLUTION_PENDING",
  "UNRESOLVED",
];

export const createCompanySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(5000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  headquarters: z.string().max(120).optional(),
  country: z.string().max(80).optional(),
});

export async function createCompany(input: z.infer<typeof createCompanySchema>) {
  const base = slugify(input.name, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return prisma.company.create({
    data: {
      name: input.name,
      slug,
      description: input.description || "",
      website: input.website || null,
      logoUrl: input.logoUrl || null,
      headquarters: input.headquarters || null,
      country: input.country || null,
    },
  });
}

export const claimCompanySchema = z.object({
  title: z.string().min(2).max(120).optional(),
  workEmail: z.string().email().optional(),
  note: z.string().max(1000).optional(),
});

/**
 * Registers a claim request. The company only flips to CLAIMED once a moderator
 * approves it, so the "Verified profile" badge always reflects a human check.
 */
export async function requestCompanyClaim(
  slug: string,
  userId: string,
  input: z.infer<typeof claimCompanySchema>,
) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) throw new ApiError(404, "Company not found");
  if (company.claimStatus === "CLAIMED") {
    const existing = await prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: company.id } },
    });
    if (existing?.approved) {
      throw new ApiError(409, "You already manage this profile");
    }
  }

  const member = await prisma.companyMember.upsert({
    where: { userId_companyId: { userId, companyId: company.id } },
    create: { userId, companyId: company.id, title: input.title ?? null },
    update: { title: input.title ?? undefined },
  });

  if (company.claimStatus === "UNCLAIMED") {
    await prisma.company.update({
      where: { id: company.id },
      data: { claimStatus: "PENDING" },
    });
  }

  return {
    company: { slug: company.slug, name: company.name, claimStatus: "PENDING" },
    membership: { approved: member.approved, title: member.title },
  };
}

/** Moderator/admin action: grants the requesting user official voice for the company. */
export async function approveCompanyClaim(slug: string, memberUserId: string) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) throw new ApiError(404, "Company not found");

  const member = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: memberUserId, companyId: company.id } },
    include: { user: { select: { role: true } } },
  });
  if (!member) throw new ApiError(404, "No claim request from that user");

  await prisma.$transaction([
    prisma.companyMember.update({
      where: { id: member.id },
      data: { approved: true },
    }),
    prisma.company.update({
      where: { id: company.id },
      data: { claimStatus: "CLAIMED", claimedAt: new Date() },
    }),
    // Don't demote staff who happen to also represent a company.
    ...(member.user.role === "USER"
      ? [
          prisma.user.update({
            where: { id: memberUserId },
            data: { role: "COMPANY" as const },
          }),
        ]
      : []),
  ]);

  return { slug: company.slug, claimStatus: "CLAIMED" };
}

/** Companies the user is an approved (or pending) representative for. */
export async function listUserCompanies(userId: string) {
  const members = await prisma.companyMember.findMany({
    where: { userId },
    include: {
      company: {
        select: { name: true, slug: true, logoUrl: true, claimStatus: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return members.map((m) => ({
    slug: m.company.slug,
    name: m.company.name,
    logoUrl: m.company.logoUrl,
    claimStatus: m.company.claimStatus,
    title: m.title,
    approved: m.approved,
  }));
}

export async function listCompanies(params: {
  search?: string;
  country?: string;
  domain?: string;
  sort?: string;
  period?: string;
  minScore?: number;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const period = params.period || "90d";

  const where = {
    companyStatus: "ACTIVE" as const,
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            {
              description: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(params.country
      ? { country: { equals: params.country, mode: "insensitive" as const } }
      : {}),
  };

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const withScores = await Promise.all(
    companies.map(async (company) => {
      const score = await getCompanyTaskScore(company.id, period, params.domain);
      return { ...company, score };
    }),
  );

  let filtered = withScores;
  if (params.minScore != null) {
    filtered = filtered.filter(
      (c) => c.score.taskScore != null && c.score.taskScore >= params.minScore!,
    );
  }

  if (params.sort === "score") {
    filtered.sort(
      (a, b) => (b.score.taskScore ?? -1) - (a.score.taskScore ?? -1),
    );
  } else if (params.sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (params.sort === "newest") {
    filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } else {
    filtered.sort(
      (a, b) => (b.score.taskScore ?? -1) - (a.score.taskScore ?? -1),
    );
  }

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  const sparklines = await getCompanySparklines(pageItems.map((c) => c.id));
  const items = await Promise.all(
    pageItems.map(async (company) => ({
      ...company,
      scoreTrend: sparklines.get(company.id) ?? [],
      pulse: await getTaskPulse(company.id),
    })),
  );

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getCompanyBySlug(slug: string, period = "90d") {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) throw new ApiError(404, "Company not found");

  const realOnly = !company.isDemo;
  const [score, topIssues, pulse, payByDomain, workDomains, seoEvidence] =
    await Promise.all([
      getCompanyTaskScore(company.id, period),
      prisma.complaint.groupBy({
        by: ["category"],
        where: {
          companyId: company.id,
          ...(realOnly ? { isDemo: false } : {}),
          status: { in: PUBLIC_ISSUE_STATUSES },
        },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
        take: 5,
      }),
      getTaskPulse(company.id),
      getPayByDomain(company.id, { realOnly }),
      getCompanyWorkDomains(company.id),
      getCompanySeoEvidence(company.id),
    ]);

  const [resolution, similarCompanies] = await Promise.all([
    getCompanyResolutionStats(company.id, company.isDemo),
    getSimilarCompanies(company.id, company.isDemo, workDomains),
  ]);

  const seo = companySEOEligibility({
    name: company.name,
    slug: company.slug,
    status: company.companyStatus,
    isDemo: company.isDemo,
    description: company.description,
    website: company.website,
    ...seoEvidence,
  });

  return {
    ...company,
    score,
    pulse,
    payByDomain,
    workDomains,
    similarCompanies,
    resolution,
    seoEvidence,
    seo,
    topIssues: topIssues.map((i) => ({
      category: i.category,
      count: i._count.category,
    })),
  };
}

export async function getCompanyTaskScore(
  companyId: string,
  period = "90d",
  domainSlug?: string,
) {
  const since = periodStartDate(period);
  const domain = domainSlug
    ? await prisma.domain.findUnique({ where: { slug: domainSlug } })
    : null;

  const reviews = await prisma.review.findMany({
    where: {
      companyId,
      ...(since ? { createdAt: { gte: since } } : {}),
      ...(domain ? { domainId: domain.id } : {}),
    },
    select: TASK_SCORE_REVIEW_SELECT,
  });

  const result = computeTaskScore(reviews, period);
  if (!hasMinimumPublicSample(result.sampleSize)) {
    return { ...result, taskScore: null };
  }
  return result;
}

export async function getTaskPulse(
  companyId: string,
  opts: { domainId?: string; windowDays?: number } = {},
) {
  const windowDays = opts.windowDays ?? 7;
  const now = new Date();
  const last7 = new Date(now);
  last7.setDate(last7.getDate() - windowDays);
  const prev7 = new Date(now);
  prev7.setDate(prev7.getDate() - windowDays * 2);

  const scope = {
    companyId,
    ...(opts.domainId ? { domainId: opts.domainId } : {}),
  };

  const recent = await prisma.taskAvailabilityReport.findMany({
    where: { ...scope, reportDate: { gte: last7 } },
  });
  const previous = await prisma.taskAvailabilityReport.findMany({
    where: { ...scope, reportDate: { gte: prev7, lt: last7 } },
  });

  const scoreMap = { HIGH: 4, MODERATE: 3, LOW: 2, NO_TASKS: 1 } as const;

  const avgStatus = (
    reports: { availabilityStatus: keyof typeof scoreMap }[],
  ) => {
    if (!reports.length) return null;
    const mean =
      reports.reduce((s, r) => s + scoreMap[r.availabilityStatus], 0) /
      reports.length;
    if (mean >= 3.5) return "HIGH" as const;
    if (mean >= 2.5) return "MODERATE" as const;
    if (mean >= 1.5) return "LOW" as const;
    return "NO_TASKS" as const;
  };

  const current = avgStatus(recent);
  const previousLevel = avgStatus(previous);
  let trend: "up" | "down" | "flat" = "flat";
  if (current && previousLevel) {
    if (scoreMap[current] > scoreMap[previousLevel]) trend = "up";
    if (scoreMap[current] < scoreMap[previousLevel]) trend = "down";
  }

  return {
    availability: current,
    trend,
    sampleSize: recent.length,
    last7Pct: recent.length
      ? Math.round(
          (recent.filter((r) =>
            ["HIGH", "MODERATE"].includes(r.availabilityStatus),
          ).length /
            recent.length) *
            100,
        )
      : null,
    previous7Pct: previous.length
      ? Math.round(
          (previous.filter((r) =>
            ["HIGH", "MODERATE"].includes(r.availabilityStatus),
          ).length /
            previous.length) *
            100,
        )
      : null,
    period: `${windowDays}d`,
    windowDays,
  };
}

async function getPayByDomain(
  companyId: string,
  opts: { realOnly?: boolean } = {},
) {
  const reports = await prisma.payReport.findMany({
    where: { companyId, ...(opts.realOnly ? { isDemo: false } : {}) },
    include: { domain: true },
    orderBy: { createdAt: "desc" },
  });

  const byDomain = new Map<
    string,
    { domain: string; advertised: number[]; effective: number[] }
  >();

  for (const r of reports) {
    const key = r.domain?.name || "General";
    if (!byDomain.has(key)) {
      byDomain.set(key, { domain: key, advertised: [], effective: [] });
    }
    const bucket = byDomain.get(key)!;
    if (r.advertisedRate != null) bucket.advertised.push(r.advertisedRate);
    if (r.effectiveRate != null) bucket.effective.push(r.effectiveRate);
  }

  return [...byDomain.values()].map((b) => ({
    domain: b.domain,
    advertisedRate: b.advertised.length
      ? Math.round(
          (b.advertised.reduce((a, c) => a + c, 0) / b.advertised.length) * 100,
        ) / 100
      : null,
    effectiveRate: b.effective.length
      ? Math.round(
          (b.effective.reduce((a, c) => a + c, 0) / b.effective.length) * 100,
        ) / 100
      : null,
    sampleSize: Math.max(b.advertised.length, b.effective.length),
  }));
}

async function getCompanySeoEvidence(companyId: string) {
  const [reviews, payReports, availabilityReports, opportunities, complaints] =
    await Promise.all([
      prisma.review.count({ where: { companyId, isDemo: false } }),
      prisma.payReport.count({ where: { companyId, isDemo: false } }),
      prisma.taskAvailabilityReport.count({
        where: { companyId, isDemo: false },
      }),
      prisma.opportunity.count({
        where: { companyId, status: "ACTIVE", isDemo: false },
      }),
      prisma.complaint.count({
        where: {
          companyId,
          isDemo: false,
          status: { in: PUBLIC_ISSUE_STATUSES },
        },
      }),
    ]);
  return {
    reviews,
    payReports,
    availabilityReports,
    opportunities,
    complaints,
  };
}

async function getCompanyWorkDomains(companyId: string): Promise<string[]> {
  const [fromPay, fromReviews, fromOpps] = await Promise.all([
    prisma.payReport.findMany({
      where: { companyId, domainId: { not: null } },
      select: { domain: { select: { name: true } } },
      distinct: ["domainId"],
    }),
    prisma.review.findMany({
      where: { companyId, domainId: { not: null } },
      select: { domain: { select: { name: true } } },
      distinct: ["domainId"],
    }),
    prisma.opportunityDomain.findMany({
      where: { opportunity: { companyId, status: "ACTIVE" } },
      select: { domain: { select: { name: true } } },
    }),
  ]);
  return [
    ...new Set(
      [...fromPay, ...fromReviews, ...fromOpps]
        .map((row) => row.domain?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  ].slice(0, 12);
}

async function getSimilarCompanies(
  companyId: string,
  isDemo: boolean,
  domains: string[],
) {
  if (domains.length === 0) return [];
  const rows = await prisma.company.findMany({
    where: {
      id: { not: companyId },
      companyStatus: "ACTIVE",
      ...(isDemo ? {} : { isDemo: false }),
      OR: [
        {
          payReports: {
            some: { domain: { name: { in: domains } } },
          },
        },
        {
          reviews: {
            some: { domain: { name: { in: domains } } },
          },
        },
        {
          opportunities: {
            some: {
              status: "ACTIVE",
              domains: { some: { domain: { name: { in: domains } } } },
            },
          },
        },
      ],
    },
    select: { name: true, slug: true, isDemo: true },
    orderBy: { name: "asc" },
    take: 6,
  });
  return rows;
}

async function getCompanyResolutionStats(companyId: string, isDemo: boolean) {
  if (isDemo) return null;

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
    select: {
      status: true,
      submittedAt: true,
      resolvedAt: true,
      resolutionSatisfaction: true,
      replies: {
        where: { authorRole: "COMPANY", isDemo: false },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  if (issues.length === 0) return null;

  const responded = issues.filter(
    (issue) =>
      issue.replies.length > 0 ||
      [
        "COMPANY_RESPONDED",
        "RESOLUTION_PENDING",
        "RESOLVED",
        "PARTIALLY_RESOLVED",
      ].includes(issue.status),
  ).length;
  const resolved = issues.filter((issue) =>
    ["RESOLVED", "PARTIALLY_RESOLVED"].includes(issue.status),
  ).length;

  const responseHours = issues
    .map((issue) => {
      const first = issue.replies[0]?.createdAt;
      if (!first) return null;
      return (first.getTime() - issue.submittedAt.getTime()) / 36e5;
    })
    .filter((hours): hours is number => hours != null && hours >= 0)
    .sort((a, b) => a - b);

  const medianResponseHours = responseHours.length
    ? responseHours[Math.floor((responseHours.length - 1) / 2)]
    : null;

  let resolutionScore: number | null = null;
  if (issues.length >= 3) {
    const resolvePct = (resolved / issues.length) * 100;
    const satisfaction = issues
      .map((issue) => issue.resolutionSatisfaction)
      .filter((n): n is number => n != null);
    if (!satisfaction.length) {
      resolutionScore = Math.round(resolvePct);
    } else {
      const sat =
        (satisfaction.reduce((a, b) => a + b, 0) / satisfaction.length / 5) *
        100;
      resolutionScore = Math.round(resolvePct * 0.6 + sat * 0.4);
    }
  }

  return {
    sampleSize: issues.length,
    responseRate: Math.round((responded / issues.length) * 100),
    resolutionRate: Math.round((resolved / issues.length) * 100),
    resolutionScore,
    medianResponseHours:
      medianResponseHours == null
        ? null
        : Math.round(medianResponseHours * 10) / 10,
  };
}

export async function listDomains() {
  return prisma.domain.findMany({
    include: { skills: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function listSkills() {
  return prisma.skill.findMany({
    include: { domain: true },
    orderBy: { name: "asc" },
  });
}
