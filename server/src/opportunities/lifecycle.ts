import type { OpportunityStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { publicOpportunityCatalogWhere } from "../lib/taskmatchPublic.js";

export function shouldReconcileLifecycle(input: {
  truncated?: boolean;
  recordCount: number;
  fetched: number;
}) {
  if (input.truncated) return false;
  if (input.fetched <= 0) return false;
  if (input.recordCount <= 0) return false;
  return true;
}

export function lifecycleStatus(input: {
  seenThisRun: boolean;
  lastSeenAt: Date | null;
  now?: Date;
}): OpportunityStatus {
  if (input.seenThisRun) return "ACTIVE";
  if (!input.lastSeenAt) return "ACTIVE";
  const now = input.now ?? new Date();
  const hours = (now.getTime() - input.lastSeenAt.getTime()) / 3_600_000;
  if (hours >= env.OPPORTUNITY_SYNC_CLOSE_AFTER_HOURS) return "CLOSED";
  if (hours >= env.OPPORTUNITY_SYNC_STALE_AFTER_HOURS) return "STALE";
  return "ACTIVE";
}

export async function reconcileLifecycle(opts: {
  sourceKey: string;
  seenExternalIds: Set<string>;
  now?: Date;
}) {
  const now = opts.now ?? new Date();
  const rows = await prisma.opportunity.findMany({
    where: {
      sourceKey: opts.sourceKey,
      isDemo: false,
      status: { in: ["ACTIVE", "STALE", "UNKNOWN", "PAUSED"] },
      externalId: { not: null },
    },
    select: { id: true, externalId: true, lastSeenAt: true, status: true },
  });

  let stale = 0;
  let closed = 0;
  for (const row of rows) {
    if (row.externalId && opts.seenExternalIds.has(row.externalId)) continue;
    const next = lifecycleStatus({
      seenThisRun: false,
      lastSeenAt: row.lastSeenAt,
      now,
    });
    if (next === row.status) continue;
    await prisma.opportunity.update({
      where: { id: row.id },
      data: { status: next },
    });
    if (next === "STALE") stale += 1;
    if (next === "CLOSED") closed += 1;
  }
  return { stale, closed };
}

export async function hiringActivityByCompany() {
  const rows = await prisma.opportunity.groupBy({
    by: ["companyId"],
    where: publicOpportunityCatalogWhere(),
    _count: { _all: true },
  });
  const companies = await prisma.company.findMany({
    where: { id: { in: rows.map((r) => r.companyId) }, isDemo: false },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  const byId = new Map(companies.map((c) => [c.id, c]));
  return rows
    .map((row) => ({
      company: byId.get(row.companyId),
      activeOpportunities: row._count._all,
    }))
    .filter((row) => row.company)
    .sort((a, b) => b.activeOpportunities - a.activeOpportunities);
}
