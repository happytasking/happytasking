import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  createComplaintSchema,
  createReplySchema,
  moderateStatusSchema,
  resolveComplaintSchema,
  createComplaint,
  createComplaintReply,
  moderateComplaintStatus,
  resolveComplaint,
  listComplaints,
  getComplaint,
} from "../services/complaint.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createComplaintSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const complaint = await createComplaint(parsed.data, req.user?.id);
  res.status(201).json(new ApiResponse(201, complaint, "Complaint submitted"));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listComplaints(
    {
      companySlug: req.query.company as string | undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    },
    req.user,
  );
  res.json(new ApiResponse(200, result));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(
    new ApiResponse(
      200,
      await getComplaint(req.params.publicId as string, req.user),
    ),
  );
});

export const reply = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const parsed = createReplySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const issue = await createComplaintReply(
    req.params.publicId as string,
    req.user,
    parsed.data,
  );
  res.status(201).json(new ApiResponse(201, issue, "Reply posted"));
});

export const moderate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const parsed = moderateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const issue = await moderateComplaintStatus(
    req.params.publicId as string,
    req.user,
    parsed.data,
  );
  res.json(new ApiResponse(200, issue, "Issue status updated"));
});

export const resolve = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const parsed = resolveComplaintSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }
  const issue = await resolveComplaint(
    req.params.publicId as string,
    req.user,
    parsed.data,
  );
  res.json(new ApiResponse(200, issue, "Resolution recorded"));
});
