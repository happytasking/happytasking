import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  registerSchema,
  loginSchema,
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.service.js";
import { requestMeta } from "../lib/requestMeta.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const result = await registerUser(parsed.data, requestMeta(req));
  res
    .cookie("token", result.token, cookieOptions())
    .status(201)
    .json(new ApiResponse(201, result, "Registered"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const result = await loginUser(parsed.data, requestMeta(req));
  res
    .cookie("token", result.token, cookieOptions())
    .status(200)
    .json(new ApiResponse(200, result, "Logged in"));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const user = await getUserById(req.user.id);
  res.json(new ApiResponse(200, user));
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token").json(new ApiResponse(200, null, "Logged out"));
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
