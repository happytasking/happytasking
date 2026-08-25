import { Router } from "express";
import * as complaintController from "../controllers/complaint.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, complaintController.list);
// Reporters and company reps can see issues that are not public yet, so the
// viewer has to be resolved before the visibility check.
router.get("/:publicId", optionalAuth, complaintController.getOne);
router.post("/", optionalAuth, complaintController.create);
router.post("/:publicId/replies", requireAuth, complaintController.reply);
// Workflow transitions: moderators verify and publish, the company can ask for the
// reporter's verdict, and the reporter closes the issue out.
router.patch("/:publicId/status", requireAuth, complaintController.moderate);
router.post("/:publicId/resolution", requireAuth, complaintController.resolve);

export default router;
