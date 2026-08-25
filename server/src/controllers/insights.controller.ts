import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { pageviewSchema, recordPageview } from "../services/visit.service.js";
import { getInsights, insightsQuerySchema } from "../services/insights.service.js";
import { requestMeta } from "../lib/requestMeta.js";

export const pageview = asyncHandler(async (req: Request, res: Response) => {
  const parsed = pageviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const result = await recordPageview(
    parsed.data,
    requestMeta(req),
    req.user?.id,
  );
  res.status(201).json(new ApiResponse(201, result));
});

export const insights = asyncHandler(async (req: Request, res: Response) => {
  const parsed = insightsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  res.json(new ApiResponse(200, await getInsights(parsed.data)));
});
