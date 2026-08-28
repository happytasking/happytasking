-- Sprint 4.7: additive TaskMatch filter indexes.
-- Non-destructive: no DROP TABLE/COLUMN, no TRUNCATE, no reseed.

CREATE INDEX IF NOT EXISTS "Opportunity_countryEligibility_status_isDemo_idx"
  ON "Opportunity" ("countryEligibility", "status", "isDemo");

CREATE INDEX IF NOT EXISTS "Opportunity_status_isDemo_publishedAt_idx"
  ON "Opportunity" ("status", "isDemo", "publishedAt");

CREATE INDEX IF NOT EXISTS "Opportunity_status_isDemo_maxRate_idx"
  ON "Opportunity" ("status", "isDemo", "maxRate");

CREATE INDEX IF NOT EXISTS "Opportunity_countryRestrictions_gin_idx"
  ON "Opportunity" USING GIN ("countryRestrictions");
