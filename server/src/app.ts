import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import errorHandler from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import communityRoutes from "./routes/community.routes.js";
import marketRoutes from "./routes/market.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import taskmatchRoutes from "./routes/taskmatch.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// Requests normally arrive through the Next.js proxy, so the client IP and
// protocol come from forwarding headers.
app.set("trust proxy", 1);

const allowedOrigins = new Set([env.CLIENT_URL, ...env.ALLOWED_ORIGINS]);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/proxied requests arrive without an Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin) || env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  // Reads are cheap and the proxy collapses many visitors onto one IP.
  skip: (req) => req.method === "GET",
});
app.use("/api/", limiter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Happy Tasking API",
    version: "1.0.0",
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, message: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/community", communityRoutes);
app.use("/api/v1/market", marketRoutes);
app.use("/api/v1/issues", complaintRoutes);
app.use("/api/v1/onboarding", onboardingRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/taskmatch", taskmatchRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(errorHandler);

export default app;
