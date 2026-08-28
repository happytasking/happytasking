import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

const LOCK_ID = "opportunity-sync-global";

export type SyncLock = {
  token: string;
  acquired: boolean;
};

export async function acquireOpportunitySyncLock(
  holder = "sync",
  lockId = LOCK_ID,
): Promise<SyncLock> {
  const token = randomUUID();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + env.OPPORTUNITY_SYNC_LOCK_TTL_MINUTES * 60_000,
  );

  const stolen = await prisma.$queryRaw<Array<{ token: string }>>`
    INSERT INTO "OpportunitySyncLock" ("id", "token", "holder", "lockedAt", "expiresAt")
    VALUES (${lockId}, ${token}, ${holder}, ${now}, ${expiresAt})
    ON CONFLICT ("id") DO UPDATE
      SET "token" = EXCLUDED."token",
          "holder" = EXCLUDED."holder",
          "lockedAt" = EXCLUDED."lockedAt",
          "expiresAt" = EXCLUDED."expiresAt"
      WHERE "OpportunitySyncLock"."expiresAt" < ${now}
    RETURNING "token"
  `;

  if (stolen[0]?.token === token) {
    return { token, acquired: true };
  }
  return { token, acquired: false };
}

export async function releaseOpportunitySyncLock(token: string, lockId = LOCK_ID) {
  await prisma.opportunitySyncLock.deleteMany({
    where: { id: lockId, token },
  });
}

export async function withOpportunitySyncLock<T>(
  holder: string,
  fn: () => Promise<T>,
  lockId = LOCK_ID,
): Promise<{ skipped: true; result?: undefined } | { skipped: false; result: T }> {
  const lock = await acquireOpportunitySyncLock(holder, lockId);
  if (!lock.acquired) {
    return { skipped: true };
  }
  try {
    const result = await fn();
    return { skipped: false, result };
  } finally {
    await releaseOpportunitySyncLock(lock.token, lockId);
  }
}
