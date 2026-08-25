import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { getIndexableSitemap } from "../services/sitemap.service.js";

const router = Router();

/** Lean public URL list for the website sitemap. No private fields. */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    try {
      const data = await getIndexableSitemap();
      res.json(new ApiResponse(200, data));
    } catch {
      throw new ApiError(503, "Sitemap data is temporarily unavailable");
    }
  }),
);

export default router;
