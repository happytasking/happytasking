import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/latest", reviewController.latest);
router.get("/company/:slug", reviewController.listForCompany);
router.post("/", optionalAuth, reviewController.create);

export default router;
