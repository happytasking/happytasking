import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import * as profileController from "../controllers/profile.controller.js";

const router = Router();

router.post("/events", optionalAuth, profileController.event);
router.get("/", requireAuth, profileController.me);
router.patch("/visibility", requireAuth, profileController.visibility);
router.post("/experiences/:id/confirm", requireAuth, profileController.confirm);

export default router;
