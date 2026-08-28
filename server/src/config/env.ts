import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  HOST: process.env.HOST || "127.0.0.1",
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  /** Extra browser origins allowed to call the API directly, comma separated. */
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
  AITRAINING_JOBS_ENABLED: process.env.AITRAINING_JOBS_ENABLED !== "false",
  AITRAINING_JOBS_SOURCE_MODE: process.env.AITRAINING_JOBS_SOURCE_MODE || "live",
  AITRAINING_JOBS_SYNC_INTERVAL: Number(
    process.env.AITRAINING_JOBS_SYNC_INTERVAL || 60,
  ),
  AITRAINING_JOBS_BASE_URL:
    process.env.AITRAINING_JOBS_BASE_URL || "https://aitraining.jobs",
  AITRAINING_JOBS_FETCH_ROLES_ACTION:
    process.env.AITRAINING_JOBS_FETCH_ROLES_ACTION ||
    "4029040649fbd3207c680ae9257a83274a7b265852",
  OPPORTUNITY_SYNC_ENABLED: process.env.OPPORTUNITY_SYNC_ENABLED !== "false",
  OPPORTUNITY_SYNC_STALE_AFTER_HOURS: Number(
    process.env.OPPORTUNITY_SYNC_STALE_AFTER_HOURS || 26,
  ),
  OPPORTUNITY_SYNC_CLOSE_AFTER_HOURS: Number(
    process.env.OPPORTUNITY_SYNC_CLOSE_AFTER_HOURS || 72,
  ),
  OPPORTUNITY_SYNC_LOCK_TTL_MINUTES: Number(
    process.env.OPPORTUNITY_SYNC_LOCK_TTL_MINUTES || 50,
  ),
  OPPORTUNITY_SYNC_REQUEST_TIMEOUT_MS: Number(
    process.env.OPPORTUNITY_SYNC_REQUEST_TIMEOUT_MS || 20_000,
  ),
  OPPORTUNITY_SYNC_SOURCE_TIMEOUT_MS: Number(
    process.env.OPPORTUNITY_SYNC_SOURCE_TIMEOUT_MS || 180_000,
  ),
  OPPORTUNITY_SYNC_RUN_TIMEOUT_MS: Number(
    process.env.OPPORTUNITY_SYNC_RUN_TIMEOUT_MS || 2_400_000,
  ),
  OPPORTUNITY_SYNC_USER_AGENT:
    process.env.OPPORTUNITY_SYNC_USER_AGENT ||
    "HappyTaskingOpportunitySync/1.0 (+https://happytasking.com)",
};
