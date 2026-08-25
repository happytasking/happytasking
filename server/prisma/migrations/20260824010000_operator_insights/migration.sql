-- Operator insights: visits, geo cache, last login/seen on users.

ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastLoginIp" TEXT;
ALTER TABLE "User" ADD COLUMN "lastLoginCountry" TEXT;

CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

CREATE TABLE "Visit" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "path" TEXT NOT NULL,
  "referrer" TEXT,
  "ip" TEXT NOT NULL,
  "country" TEXT,
  "countryCode" TEXT,
  "region" TEXT,
  "city" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Visit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt");
CREATE INDEX "Visit_sessionId_createdAt_idx" ON "Visit"("sessionId", "createdAt");
CREATE INDEX "Visit_ip_createdAt_idx" ON "Visit"("ip", "createdAt");
CREATE INDEX "Visit_path_createdAt_idx" ON "Visit"("path", "createdAt");
CREATE INDEX "Visit_countryCode_idx" ON "Visit"("countryCode");
CREATE INDEX "Visit_userId_createdAt_idx" ON "Visit"("userId", "createdAt");

CREATE TABLE "GeoCache" (
  "ip" TEXT NOT NULL,
  "country" TEXT,
  "countryCode" TEXT,
  "region" TEXT,
  "city" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeoCache_pkey" PRIMARY KEY ("ip")
);
