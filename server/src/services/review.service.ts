import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { recordActivationIfNeeded, trackEvent } from "./analytics.service.js";
import { maybeAwardFoundingTasker } from "./badge.service.js";
import { publicEvidenceWhere } from "../lib/taskmatchPublic.js";

const score = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  companyId: z.string().min(1).optional(),
  companySlug: z.string().min(1).optional(),
  domainId: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  country: z.string().max(80).optional(),
  currentlyActive: z.boolean().optional(),
  overallExperience: score,
  paySatisfaction: score,
  paymentReliability: score,
  taskAvailability: score,
  projectStability: score,
  reviewerFairness: score,
  guidelineClarity: score,
  supportQuality: score,
  transparency: score,
  flexibility: score.optional(),
  wouldWorkAgain: z.boolean(),
  title: z.string().min(5).max(150),
  body: z.string().min(20).max(5000),
  identityMode: z.enum(["ANONYMOUS", "USERNAME"]).default("ANONYMOUS"),
  displayName: z.string().max(80).optional(),
}).refine((d) => d.companyId || d.companySlug, {
  message: "companyId or companySlug required",
});

export async function createReview(
  input: z.infer<typeof createReviewSchema>,
  userId?: string,
) {
  const company = input.companyId
    ? await prisma.company.findUnique({ where: { id: input.companyId } })
    : await prisma.company.findUnique({ where: { slug: input.companySlug! } });

  if (!company) throw new ApiError(404, "Company not found");

  if (input.domainId) {
    const domain = await prisma.domain.findUnique({
      where: { id: input.domainId },
    });
    if (!domain) throw new ApiError(400, "Invalid domain");
  }

  const review = await prisma.review.create({
    data: {
      companyId: company.id,
      userId: userId || null,
      domainId: input.domainId || null,
      country: input.country,
      currentlyActive: input.currentlyActive,
      overallExperience: input.overallExperience,
      paySatisfaction: input.paySatisfaction,
      paymentReliability: input.paymentReliability,
      taskAvailability: input.taskAvailability,
      projectStability: input.projectStability,
      reviewerFairness: input.reviewerFairness,
      guidelineClarity: input.guidelineClarity,
      supportQuality: input.supportQuality,
      transparency: input.transparency,
      flexibility: input.flexibility,
      wouldWorkAgain: input.wouldWorkAgain,
      title: input.title,
      body: input.body,
      identityMode: input.identityMode,
      displayName:
        input.identityMode === "ANONYMOUS"
          ? input.displayName || "Anonymous contributor"
          : input.displayName,
      skills: input.skillIds?.length
        ? {
            create: input.skillIds.map((skillId) => ({ skillId })),
          }
        : undefined,
    },
    include: {
      domain: true,
      skills: { include: { skill: true } },
      company: { select: { id: true, slug: true, name: true, logoUrl: true } },
    },
  });

  if (userId) {
    const contributor = await prisma.user.update({
      where: { id: userId },
      data: { contributionScore: { increment: 10 } },
    });
    if (contributor.onboardingCompletedAt) {
      await trackEvent("review_completed_after_onboarding", {
        userId,
        properties: { companySlug: company.slug },
      });
    }
    await recordActivationIfNeeded(userId);
    await maybeAwardFoundingTasker(userId);
  }

  return sanitizeReview(review);
}

export async function listCompanyReviews(
  companySlug: string,
  params: { page?: number; limit?: number; domainId?: string },
) {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });
  if (!company) throw new ApiError(404, "Company not found");

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const where = {
    companyId: company.id,
    ...publicEvidenceWhere(company.isDemo),
    ...(params.domainId ? { domainId: params.domainId } : {}),
  };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: {
        domain: true,
        skills: { include: { skill: true } },
        user: { select: { username: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items: reviews.map(sanitizeReview),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function listLatestReviews(limit = 8) {
  const reviews = await prisma.review.findMany({
    take: limit,
    where: publicEvidenceWhere(),
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
      domain: true,
    },
  });
  return reviews.map(sanitizeReview);
}

function sanitizeReview<T extends {
  identityMode: string;
  user?: { username: string; displayName: string | null } | null;
  displayName: string | null;
  userId?: string | null;
}>(review: T) {
  const { userId: _uid, ...rest } = review as T & { userId?: string | null };
  const authorLabel =
    review.identityMode === "USERNAME" && review.user
      ? review.user.displayName || review.user.username
      : review.displayName || "Anonymous contributor";

  return {
    ...rest,
    authorLabel,
    user: undefined,
  };
}
