import { Router } from "express";
import rateLimit from "express-rate-limit";
import { optionalAuth, requireAuth, requireModerator } from "../middleware/auth.middleware.js";
import * as insights from "../controllers/insights.controller.js";

const pageviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/pageview", pageviewLimiter, optionalAuth, insights.pageview);
router.post("/event", pageviewLimiter, optionalAuth, insights.publicEvent);
router.get("/insights", requireAuth, requireModerator, insights.insights);

export default router;
