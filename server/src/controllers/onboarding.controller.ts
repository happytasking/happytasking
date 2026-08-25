import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  startOnboarding,
  getOnboardingState,
  saveCountry,
  saveDomains,
  saveSkills,
  saveExperiences,
  completeOnboarding,
  searchCompanies,
  countryStepSchema,
  domainsStepSchema,
  skillsStepSchema,
  experiencesStepSchema,
  completeSchema,
} from "../services/onboarding.service.js";

function requireUser(req: Request) {
  if (!req.user) throw new ApiError(401, "Authentication required");
  return req.user;
}

export const get = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  res.json(new ApiResponse(200, await getOnboardingState(user.id)));
});

export const start = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  res.json(new ApiResponse(200, await startOnboarding(user.id), "Started"));
});

export const country = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = countryStepSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await saveCountry(user.id, parsed.data)));
});

export const domains = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = domainsStepSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await saveDomains(user.id, parsed.data)));
});

export const skills = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = skillsStepSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await saveSkills(user.id, parsed.data)));
});

export const experiences = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = experiencesStepSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await saveExperiences(user.id, parsed.data)));
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const parsed = completeSchema.safeParse(req.body ?? {});
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await completeOnboarding(user.id, parsed.data)));
});

export const companies = asyncHandler(async (req: Request, res: Response) => {
  requireUser(req);
  const q = typeof req.query.q === "string" ? req.query.q : "";
  res.json(new ApiResponse(200, await searchCompanies(q)));
});
