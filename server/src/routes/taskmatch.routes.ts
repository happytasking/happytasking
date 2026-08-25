import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import * as taskmatch from "../controllers/taskmatch.controller.js";

const router = Router();

router.get("/", optionalAuth, taskmatch.list);
router.get("/saved", requireAuth, taskmatch.saved);
router.get("/gaps", requireAuth, taskmatch.gaps);
router.get("/profile", requireAuth, taskmatch.profile);
router.patch("/profile", requireAuth, taskmatch.updateProfile);
router.get("/company/:slug", requireAuth, taskmatch.forCompany);
router.get("/opportunities/:slug", optionalAuth, taskmatch.detail);
router.post("/save/:opportunityId", requireAuth, taskmatch.save);
router.delete("/save/:opportunityId", requireAuth, taskmatch.unsave);
router.post("/status/:opportunityId", requireAuth, taskmatch.status);

router.get("/admin/opportunities", requireAuth, taskmatch.adminList);
router.post("/admin/opportunities", requireAuth, taskmatch.adminCreate);
router.patch("/admin/opportunities/:id", requireAuth, taskmatch.adminUpdate);
router.post("/admin/opportunities/:id/verify", requireAuth, taskmatch.adminVerify);
router.post("/admin/opportunities/:id/close", requireAuth, taskmatch.adminClose);

export default router;
