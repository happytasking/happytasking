import { Router } from "express";
import * as companyController from "../controllers/company.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/meta/domains", companyController.domains);
router.get("/meta/skills", companyController.skills);
router.get("/", companyController.list);
router.get("/:slug/trends", companyController.trends);
router.get("/:slug", companyController.getBySlug);
router.post("/", requireAuth, companyController.create);
router.post("/:slug/claim", requireAuth, companyController.claim);
router.post("/:slug/claim/approve", requireAuth, companyController.approveClaim);

export default router;
