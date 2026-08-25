import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as onboardingController from "../controllers/onboarding.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", onboardingController.get);
router.post("/start", onboardingController.start);
router.post("/country", onboardingController.country);
router.post("/domains", onboardingController.domains);
router.post("/skills", onboardingController.skills);
router.post("/experiences", onboardingController.experiences);
router.post("/complete", onboardingController.complete);
router.get("/companies", onboardingController.companies);

export default router;
