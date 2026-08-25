import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  closeOpportunity,
  companyMatches,
  createOpportunity,
  getOpportunityMatch,
  getTaskmatchProfile,
  journeySchema,
  listAdminOpportunities,
  listMatches,
  listSaved,
  matchQuerySchema,
  opportunityAdminSchema,
  opportunityAdminUpdateSchema,
  saveOpportunity,
  setJourney,
  skillGaps,
  taskmatchProfileSchema,
  updateOpportunity,
  updateTaskmatchProfile,
  verifyOpportunity,
} from "../services/taskmatch.service.js";

function requireUser(req: Request) {
  if (!req.user) throw new ApiError(401, "Authentication required");
  return req.user;
}

function requireModerator(req: Request) {
  const user = requireUser(req);
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    throw new ApiError(403, "Moderator access required");
  }
  return user;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const parsed = matchQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  const data = await listMatches(req.user?.id, parsed.data);
  res.json(new ApiResponse(200, data));
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const data = await getOpportunityMatch(req.params.slug as string, req.user?.id);
  res.json(new ApiResponse(200, data));
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  res.json(new ApiResponse(200, await getTaskmatchProfile(user.id)));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = taskmatchProfileSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await updateTaskmatchProfile(user.id, parsed.data)));
});

export const save = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const data = await saveOpportunity(user.id, req.params.opportunityId as string, true);
  res.status(201).json(new ApiResponse(201, data, "Saved"));
});

export const unsave = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const data = await saveOpportunity(user.id, req.params.opportunityId as string, false);
  res.json(new ApiResponse(200, data));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = journeySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await setJourney(user.id, req.params.opportunityId as string, parsed.data)));
});

export const gaps = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  res.json(new ApiResponse(200, await skillGaps(user.id)));
});

export const saved = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  res.json(new ApiResponse(200, { items: await listSaved(user.id) }));
});

export const forCompany = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  res.json(
    new ApiResponse(200, await companyMatches(user.id, req.params.slug as string)),
  );
});

export const adminList = asyncHandler(async (req: Request, res: Response) => {
  requireModerator(req);
  res.json(new ApiResponse(200, { items: await listAdminOpportunities() }));
});

export const adminCreate = asyncHandler(async (req: Request, res: Response) => {
  requireModerator(req);
  const parsed = opportunityAdminSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  const row = await createOpportunity(parsed.data);
  res.status(201).json(new ApiResponse(201, row, "Opportunity created"));
});

export const adminUpdate = asyncHandler(async (req: Request, res: Response) => {
  requireModerator(req);
  const parsed = opportunityAdminUpdateSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  const row = await updateOpportunity(req.params.id as string, parsed.data);
  res.json(new ApiResponse(200, row));
});

export const adminVerify = asyncHandler(async (req: Request, res: Response) => {
  requireModerator(req);
  res.json(new ApiResponse(200, await verifyOpportunity(req.params.id as string)));
});

export const adminClose = asyncHandler(async (req: Request, res: Response) => {
  requireModerator(req);
  res.json(new ApiResponse(200, await closeOpportunity(req.params.id as string)));
});
