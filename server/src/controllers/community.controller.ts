import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  createDiscussionSchema,
  createCommentSchema,
  createDiscussion,
  listDiscussions,
  getDiscussion,
  addComment,
  voteOnTarget,
} from "../services/community.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createDiscussionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const discussion = await createDiscussion(parsed.data, req.user?.id);
  res.status(201).json(new ApiResponse(201, discussion, "Discussion created"));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listDiscussions({
    companySlug: req.query.company as string | undefined,
    topic: req.query.topic as string | undefined,
    sort: (req.query.sort as string) || "trending",
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  });
  res.json(new ApiResponse(200, result));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(new ApiResponse(200, await getDiscussion(req.params.id as string)));
});

export const comment = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const created = await addComment(
    req.params.id as string,
    parsed.data,
    req.user?.id,
  );
  res.status(201).json(new ApiResponse(201, created, "Comment added"));
});

export const vote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const value = Number(req.body.value);
  if (![1, -1, 0].includes(value)) {
    throw new ApiError(400, "value must be 1, -1, or 0");
  }
  const targetType = String(req.body.targetType || "DISCUSSION").toUpperCase();
  if (!["DISCUSSION", "COMMENT", "REVIEW"].includes(targetType)) {
    throw new ApiError(400, "Invalid targetType");
  }
  const result = await voteOnTarget(
    req.user.id,
    targetType as "DISCUSSION" | "COMMENT" | "REVIEW",
    req.params.id as string,
    value as 1 | -1 | 0,
  );
  res.json(new ApiResponse(200, result, "Vote recorded"));
});
