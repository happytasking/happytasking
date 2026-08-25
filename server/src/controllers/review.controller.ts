import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  createReviewSchema,
  createReview,
  listCompanyReviews,
  listLatestReviews,
} from "../services/review.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const review = await createReview(parsed.data, req.user?.id);
  res.status(201).json(new ApiResponse(201, review, "Review created"));
});

export const listForCompany = asyncHandler(async (req: Request, res: Response) => {
  const result = await listCompanyReviews(req.params.slug as string, {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    domainId: req.query.domainId as string | undefined,
  });
  res.json(new ApiResponse(200, result));
});

export const latest = asyncHandler(async (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, await listLatestReviews()));
});
