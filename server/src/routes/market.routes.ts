import { Router } from "express";
import * as marketController from "../controllers/market.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", marketController.market);
router.get("/live", marketController.live);
router.get("/trends", marketController.trends);
router.post("/pay-reports", optionalAuth, marketController.createPay);
router.post(
  "/availability-reports",
  optionalAuth,
  marketController.createAvailability,
);

export default router;
