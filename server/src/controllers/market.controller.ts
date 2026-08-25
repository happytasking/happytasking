import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  payReportSchema,
  availabilityReportSchema,
  createPayReport,
  createAvailabilityReport,
  getMarketDashboard,
  getLiveMarket,
} from "../services/market.service.js";
import { getMarketTrends } from "../services/trends.service.js";

export const market = asyncHandler(async (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, await getMarketDashboard()));
});

export const live = asyncHandler(async (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, await getLiveMarket()));
});

export const trends = asyncHandler(async (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, await getMarketTrends()));
});

export const createPay = asyncHandler(async (req: Request, res: Response) => {
  const parsed = payReportSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const report = await createPayReport(parsed.data, req.user?.id);
  res.status(201).json(new ApiResponse(201, report, "Pay report created"));
});

export const createAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = availabilityReportSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }
    const report = await createAvailabilityReport(parsed.data, req.user?.id);
    res
      .status(201)
      .json(new ApiResponse(201, report, "Availability report created"));
  },
);
