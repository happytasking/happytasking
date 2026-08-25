import { Router } from "express";
import * as communityController from "../controllers/community.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", communityController.list);
router.get("/:id", communityController.getOne);
router.post("/", optionalAuth, communityController.create);
router.post("/:id/comments", optionalAuth, communityController.comment);
router.post("/:id/vote", requireAuth, communityController.vote);

export default router;
