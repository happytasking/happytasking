import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { publicEvidenceWhere } from "../lib/taskmatchPublic.js";
import { recordActivationIfNeeded } from "./analytics.service.js";
import { maybeAwardFoundingTasker } from "./badge.service.js";

export const createDiscussionSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(10000),
  category: z
    .enum([
      "GENERAL",
      "PAY",
      "TASK_AVAILABILITY",
      "ONBOARDING",
      "REVIEWERS",
      "SUPPORT",
      "SKILLS",
      "PLATFORM",
    ])
    .default("GENERAL"),
  companySlug: z.string().optional(),
  domainId: z.string().optional(),
  skillId: z.string().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export async function createDiscussion(
  input: z.infer<typeof createDiscussionSchema>,
  authorId?: string,
) {
  let companyId: string | undefined;
  if (input.companySlug) {
    const company = await prisma.company.findUnique({
      where: { slug: input.companySlug },
    });
    if (!company) throw new ApiError(404, "Company not found");
    companyId = company.id;
  }

  const discussion = await prisma.discussion.create({
    data: {
      title: input.title,
      body: input.body,
      category: input.category,
      authorId: authorId || null,
      companyId: companyId || null,
      domainId: input.domainId || null,
      skillId: input.skillId || null,
    },
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
      domain: true,
      skill: true,
      author: { select: { username: true, displayName: true } },
      _count: { select: { comments: true } },
    },
  });

  if (authorId) {
    await prisma.user.update({
      where: { id: authorId },
      data: { contributionScore: { increment: 5 } },
    });
    await recordActivationIfNeeded(authorId);
    await maybeAwardFoundingTasker(authorId);
  }

  return withVoteCount(discussion);
}

export async function listDiscussions(params: {
  companySlug?: string;
  topic?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));

  let companyId: string | undefined;
  let companyIsDemo = false;
  if (params.companySlug) {
    const company = await prisma.company.findUnique({
      where: { slug: params.companySlug },
    });
    if (!company) throw new ApiError(404, "Company not found");
    companyId = company.id;
    companyIsDemo = company.isDemo;
  }

  const topicMap: Record<string, string> = {
    pay: "PAY",
    "task-availability": "TASK_AVAILABILITY",
    onboarding: "ONBOARDING",
    coding: "SKILLS",
  };

  const where = {
    status: "published",
    ...publicEvidenceWhere(companyIsDemo),
    ...(companyId ? { companyId } : {}),
    ...(params.topic && topicMap[params.topic]
      ? { category: topicMap[params.topic] as never }
      : {}),
    ...(params.topic === "coding"
      ? {
          OR: [
            { category: "SKILLS" as const },
            { skill: { slug: "coding" } },
            { domain: { slug: "coding" } },
          ],
        }
      : {}),
  };

  const discussions = await prisma.discussion.findMany({
    where,
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
      domain: true,
      skill: true,
      author: { select: { username: true, displayName: true } },
      _count: { select: { comments: true } },
    },
    orderBy:
      params.sort === "newest" ? { createdAt: "desc" } : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.discussion.count({ where });
  const withVotes = await Promise.all(discussions.map(withVoteCount));

  if (params.sort === "trending" || params.sort === "most-discussed") {
    withVotes.sort((a, b) => {
      if (params.sort === "most-discussed") {
        return b._count.comments - a._count.comments;
      }
      return b.voteScore + b._count.comments - (a.voteScore + a._count.comments);
    });
  }

  return {
    items: withVotes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getDiscussion(id: string) {
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      company: { select: { name: true, slug: true, logoUrl: true, isDemo: true } },
      domain: true,
      skill: true,
      author: { select: { username: true, displayName: true } },
      comments: {
        where: { parentId: null },
        include: {
          author: { select: { username: true, displayName: true } },
          replies: {
            include: {
              author: { select: { username: true, displayName: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { comments: true } },
    },
  });
  if (!discussion) throw new ApiError(404, "Discussion not found");
  if (discussion.isDemo && discussion.company && !discussion.company.isDemo) {
    throw new ApiError(404, "Discussion not found");
  }
  return withVoteCount(discussion);
}

export async function addComment(
  discussionId: string,
  input: z.infer<typeof createCommentSchema>,
  authorId?: string,
) {
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
  });
  if (!discussion) throw new ApiError(404, "Discussion not found");

  const comment = await prisma.comment.create({
    data: {
      discussionId,
      body: input.body,
      parentId: input.parentId || null,
      authorId: authorId || null,
    },
    include: {
      author: { select: { username: true, displayName: true } },
    },
  });

  if (authorId) {
    await prisma.user.update({
      where: { id: authorId },
      data: { contributionScore: { increment: 2 } },
    });
    await recordActivationIfNeeded(authorId);
    await maybeAwardFoundingTasker(authorId);
  }

  return comment;
}

export async function voteOnTarget(
  userId: string,
  targetType: "DISCUSSION" | "COMMENT" | "REVIEW",
  targetId: string,
  value: 1 | -1 | 0,
) {
  if (value === 0) {
    await prisma.vote.deleteMany({
      where: { userId, targetType, targetId },
    });
    return { value: 0 };
  }

  const vote = await prisma.vote.upsert({
    where: {
      userId_targetType_targetId: { userId, targetType, targetId },
    },
    create: { userId, targetType, targetId, value },
    update: { value },
  });

  return vote;
}

async function withVoteCount<T extends { id: string }>(item: T) {
  const votes = await prisma.vote.findMany({
    where: { targetType: "DISCUSSION", targetId: item.id },
  });
  const voteScore = votes.reduce((s, v) => s + v.value, 0);
  return { ...item, voteScore };
}
