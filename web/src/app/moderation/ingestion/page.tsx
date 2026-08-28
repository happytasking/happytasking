"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { ModeratorNav } from "@/components/ModeratorNav";
import { SkeletonRows } from "@/components/Skeleton";
import { formatDateTime } from "@/lib/format";

type IngestionStatus = {
  latestRun: {
    id: string;
    status: string;
    trigger: string;
    startedAt: string;
    completedAt: string | null;
    durationMs: number | null;
    error: string | null;
    metrics: Record<string, { fetched?: number; created?: number; updated?: number; rejected?: number; error?: string }> | null;
  } | null;
  sources: Array<{
    key: string;
    name: string;
    enabled: boolean;
    health: string;
    lastSuccessAt: string | null;
    lastError: string | null;
  }>;
  nextExpectedSync: string | null;
  commercialIndependence: string;
};

export default function IngestionPage() {
  const { user, loading } = useAuth();
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";
  const [data, setData] = useState<IngestionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setData(await api<IngestionStatus>("/taskmatch/admin/ingestion"));
  }, []);

  useEffect(() => {
    if (isModerator) {
      void load().catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load"),
      );
    }
  }, [isModerator, load]);

  async function syncNow() {
    setBusy(true);
    try {
      await api("/taskmatch/admin/ingestion/sync", { method: "POST" });
      toast.success("Sync finished");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <SkeletonRows rows={4} />;
  if (!isModerator) {
    return (
      <EmptyState
        title="Moderator access only"
        description="Opportunity ingestion is limited to Happy Tasking moderators."
      />
    );
  }

  const run = data?.latestRun;

  return (
    <div className="container-page space-y-6">
      <div>
        <Link href="/moderation" className="text-sm font-semibold text-accent">
          ← Triage
        </Link>
        <p className="eyebrow mt-3">Moderation</p>
        <h1 className="page-title mt-1">Opportunity ingestion</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Same pipeline as the hourly job. {data?.commercialIndependence}
        </p>
      </div>
      <ModeratorNav current="/moderation/ingestion" />
      {error && <ErrorNote message={error} onRetry={() => void load()} />}
      <section className="panel panel-pad space-y-3">
        <p className="text-sm">
          Last full sync: {run ? formatDateTime(run.startedAt) : "Never"} ·{" "}
          {run?.status || "—"}
        </p>
        <p className="text-sm">
          Next expected: {data?.nextExpectedSync ? formatDateTime(data.nextExpectedSync) : "—"}
        </p>
        <button
          type="button"
          className="btn btn-accent min-h-11"
          disabled={busy}
          onClick={() => void syncNow()}
        >
          {busy ? "Syncing…" : "Sync now"}
        </button>
      </section>
      <section className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Health</th>
              <th>Last success</th>
              <th>Fetched</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Rejected</th>
            </tr>
          </thead>
          <tbody>
            {(data?.sources || []).map((source) => {
              const metrics = run?.metrics?.[source.key];
              return (
                <tr key={source.key}>
                  <td>{source.name}</td>
                  <td>{source.health}</td>
                  <td>{source.lastSuccessAt ? formatDateTime(source.lastSuccessAt) : "—"}</td>
                  <td className="num">{metrics?.fetched ?? "—"}</td>
                  <td className="num">{metrics?.created ?? "—"}</td>
                  <td className="num">{metrics?.updated ?? "—"}</td>
                  <td className="num">{metrics?.rejected ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
