import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  getContributorProfile,
  updateVisibility,
  confirmExperience,
  visibilitySchema,
  confirmExperienceSchema,
} from "../services/profile.service.js";
import { trackEvent } from "../services/analytics.service.js";
import { z } from "zod";

const eventSchema = z.object({
  name: z.string().min(1).max(80),
  properties: z.unknown().optional(),
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  res.json(new ApiResponse(200, await getContributorProfile(req.user.id)));
});

export const visibility = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const parsed = visibilitySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  res.json(new ApiResponse(200, await updateVisibility(req.user.id, parsed.data)));
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const parsed = confirmExperienceSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  const result = await confirmExperience(
    req.user.id,
    req.params.id as string,
    parsed.data,
  );
  res.json(new ApiResponse(200, result));
});

export const event = asyncHandler(async (req: Request, res: Response) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation failed", parsed.error.issues);
  await trackEvent(parsed.data.name, {
    userId: req.user?.id,
    properties: parsed.data.properties as never,
  });
  res.status(201).json(new ApiResponse(201, { ok: true }));
});
