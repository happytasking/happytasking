import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { createAITrainingJobsAdapter, SourceDegradedError } from "./adapters/aitrainingJobs.js";
import { withOpportunitySyncLock } from "./lock.js";
import { reconcileLifecycle, shouldReconcileLifecycle } from "./lifecycle.js";
import { ensureSourceRegistry } from "./registry.js";
import {
  AITRAINING_JOBS_SOURCE_KEY,
  EMPTY_SOURCE_METRICS,
  type SourceMetrics,
} from "./types.js";
import { seenExternalIds, upsertNormalizedOpportunities } from "./upsert.js";
import { withTimeout } from "./timeout.js";

export type SyncOptions = {
  trigger?: string;
  maxRecords?: number;
  holder?: string;
};

export type SyncOutcome = {
  skippedLocked: boolean;
  runId: string | null;
  status: string;
  durationMs: number;
  sources: Record<string, SourceMetrics & { error?: string }>;
};

async function runPipeline(opts: SyncOptions): Promise<SyncOutcome> {
  const started = Date.now();
  const run = await prisma.opportunitySyncRun.create({
    data: {
      status: "RUNNING",
      trigger: opts.trigger || "manual",
    },
  });

  const sources: Record<string, SourceMetrics & { error?: string }> = {};
  let sourceFailures = 0;

  try {
    await ensureSourceRegistry();
    const adapter = createAITrainingJobsAdapter();
    const sourceStarted = Date.now();
    try {
      await prisma.opportunitySource.update({
        where: { key: AITRAINING_JOBS_SOURCE_KEY },
        data: { lastAttemptAt: new Date() },
      });
      const fetched = await withTimeout(
        adapter.fetch({ maxRecords: opts.maxRecords }),
        env.OPPORTUNITY_SYNC_SOURCE_TIMEOUT_MS,
        "AITraining.jobs adapter timeout",
      );
      const upserted = await upsertNormalizedOpportunities(fetched.records);
      const lifecycle = shouldReconcileLifecycle({
        truncated: fetched.truncated,
        recordCount: fetched.records.length,
        fetched: fetched.fetched,
      })
        ? await reconcileLifecycle({
            sourceKey: AITRAINING_JOBS_SOURCE_KEY,
            seenExternalIds: seenExternalIds(fetched.records),
          })
        : { stale: 0, closed: 0 };
      const metrics: SourceMetrics = {
        ...EMPTY_SOURCE_METRICS,
        ...upserted,
        fetched: fetched.fetched,
        parsed: fetched.parsed,
        stale: lifecycle.stale,
        closed: lifecycle.closed,
        durationMs: Date.now() - sourceStarted,
      };
      sources[AITRAINING_JOBS_SOURCE_KEY] = metrics;
      await prisma.opportunitySyncSourceResult.create({
        data: {
          runId: run.id,
          sourceKey: AITRAINING_JOBS_SOURCE_KEY,
          status: "SUCCESS",
          ...metrics,
        },
      });
      await prisma.opportunitySource.update({
        where: { key: AITRAINING_JOBS_SOURCE_KEY },
        data: {
          lastSuccessAt: new Date(),
          lastError: null,
          failureCount: 0,
          health: "OK",
        },
      });
    } catch (error) {
      sourceFailures += 1;
      const message = error instanceof Error ? error.message : String(error);
      const degraded = error instanceof SourceDegradedError;
      sources[AITRAINING_JOBS_SOURCE_KEY] = {
        ...EMPTY_SOURCE_METRICS,
        errors: 1,
        durationMs: Date.now() - sourceStarted,
        error: message,
      };
      await prisma.opportunitySyncSourceResult.create({
        data: {
          runId: run.id,
          sourceKey: AITRAINING_JOBS_SOURCE_KEY,
          status: degraded ? "DEGRADED" : "FAILED",
          errors: 1,
          durationMs: Date.now() - sourceStarted,
          error: message,
        },
      });
      await prisma.opportunitySource.update({
        where: { key: AITRAINING_JOBS_SOURCE_KEY },
        data: {
          lastError: message.slice(0, 500),
          failureCount: { increment: 1 },
          health: degraded ? "DEGRADED" : "ERROR",
        },
      });
    }

    const durationMs = Date.now() - started;
    const status =
      sourceFailures === 0
        ? "SUCCESS"
        : Object.keys(sources).length > sourceFailures
          ? "PARTIAL_SUCCESS"
          : "FAILED";
    await prisma.opportunitySyncRun.update({
      where: { id: run.id },
      data: {
        status,
        completedAt: new Date(),
        durationMs,
        metrics: sources,
      },
    });
    return {
      skippedLocked: false,
      runId: run.id,
      status,
      durationMs,
      sources,
    };
  } catch (error) {
    const durationMs = Date.now() - started;
    const message = error instanceof Error ? error.message : String(error);
    await prisma.opportunitySyncRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        durationMs,
        error: message.slice(0, 1000),
      },
    });
    throw error;
  }
}

export async function syncOpportunities(opts: SyncOptions = {}): Promise<SyncOutcome> {
  if (!env.OPPORTUNITY_SYNC_ENABLED) {
    return {
      skippedLocked: false,
      runId: null,
      status: "FAILED",
      durationMs: 0,
      sources: {},
    };
  }

  const locked = await withOpportunitySyncLock(opts.holder || opts.trigger || "sync", async () => {
    return withTimeout(
      runPipeline(opts),
      env.OPPORTUNITY_SYNC_RUN_TIMEOUT_MS,
      "Opportunity sync exceeded run timeout",
    );
  });

  if (locked.skipped) {
    await prisma.opportunitySyncRun.create({
      data: {
        status: "SKIPPED_LOCKED",
        trigger: opts.trigger || "manual",
        completedAt: new Date(),
        durationMs: 0,
        error: "sync already running",
      },
    });
    return {
      skippedLocked: true,
      runId: null,
      status: "SKIPPED_LOCKED",
      durationMs: 0,
      sources: {},
    };
  }
  return locked.result;
}

export async function getIngestionStatus() {
  const [latest, sources, counts] = await Promise.all([
    prisma.opportunitySyncRun.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.opportunitySource.findMany({ orderBy: { priority: "asc" } }),
    prisma.opportunity.groupBy({
      by: ["status", "isDemo"],
      _count: { _all: true },
    }),
  ]);
  return {
    latestRun: latest,
    sources,
    opportunityCounts: counts,
    nextExpectedSync: latest?.startedAt
      ? new Date(latest.startedAt.getTime() + env.AITRAINING_JOBS_SYNC_INTERVAL * 60_000)
      : null,
    commercialIndependence:
      "Commercial relationships do not influence Happy Tasking's independent company intelligence.",
  };
}
