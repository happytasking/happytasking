import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  createCompanySchema,
  claimCompanySchema,
  createCompany,
  listCompanies,
  getCompanyBySlug,
  requestCompanyClaim,
  approveCompanyClaim,
  listDomains,
  listSkills,
} from "../services/company.service.js";
import { getCompanyTrends } from "../services/trends.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const company = await createCompany(parsed.data);
  res.status(201).json(new ApiResponse(201, company, "Company created"));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listCompanies({
    search: req.query.search as string | undefined,
    country: req.query.country as string | undefined,
    domain: req.query.domain as string | undefined,
    sort: req.query.sort as string | undefined,
    period: (req.query.period as string) || "90d",
    minScore: req.query.minScore ? Number(req.query.minScore) : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  });
  res.json(new ApiResponse(200, result));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const company = await getCompanyBySlug(
    req.params.slug as string,
    (req.query.period as string) || "90d",
  );
  res.json(new ApiResponse(200, company));
});

export const trends = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCompanyTrends(req.params.slug as string);
  res.json(new ApiResponse(200, data));
});

export const claim = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const parsed = claimCompanySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const result = await requestCompanyClaim(
    req.params.slug as string,
    req.user.id,
    parsed.data,
  );
  res.status(201).json(new ApiResponse(201, result, "Claim request received"));
});

export const approveClaim = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  if (req.user.role !== "ADMIN" && req.user.role !== "MODERATOR") {
    throw new ApiError(403, "Moderator access required");
  }
  const userId = (req.body?.userId as string | undefined) || req.user.id;
  const result = await approveCompanyClaim(req.params.slug as string, userId);
  res.json(new ApiResponse(200, result, "Claim approved"));
});

export const domains = asyncHandler(async (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, await listDomains()));
});

export const skills = asyncHandler(async (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, await listSkills()));
});
