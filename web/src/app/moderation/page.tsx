"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Issue, Pagination } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { ModeratorNav } from "@/components/ModeratorNav";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonCards } from "@/components/Skeleton";
import { formatDateTime, formatRelativeTime, humanize } from "@/lib/format";

/** The queue is organised by what the moderator has to do next, not by status name. */
const LANES = [
  {
    status: "SUBMITTED",
    title: "Awaiting verification",
    blurb: "New reports that nobody has reviewed yet.",
  },
  {
    status: "VERIFIED",
    title: "Ready to publish",
    blurb: "Verified reports that are not on the public directory yet.",
  },
  {
    status: "RESOLUTION_PENDING",
    title: "Awaiting reporter confirmation",
    blurb: "A resolution was proposed; the reporter has the final word.",
  },
] as const;

export default function ModerationPage() {
  const { user, loading: authLoading } = useAuth();
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  const [lanes, setLanes] = useState<Record<string, Issue[]>>({});
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        LANES.map((lane) =>
          api<{ items: Issue[]; pagination: Pagination }>(
            `/issues${qs({ status: lane.status, limit: 20 })}`,
          ),
        ),
      );
      const nextLanes: Record<string, Issue[]> = {};
      const nextTotals: Record<string, number> = {};
      LANES.forEach((lane, i) => {
        nextLanes[lane.status] = results[i].items;
        nextTotals[lane.status] = results[i].pagination.total;
      });
      setLanes(nextLanes);
      setTotals(nextTotals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isModerator) void load();
    else setLoading(false);
  }, [isModerator, load]);

  if (authLoading) return <SkeletonCards count={3} />;

  if (!isModerator) {
    return (
      <EmptyState
        title="Moderator access only"
        description="This queue is limited to Happy Tasking moderators. If you represent a company, your issue inbox is on your company profile."
        action={
          <Link href="/issues" className="btn btn-secondary">
            Back to issues
          </Link>
        }
      />
    );
  }

  const backlog = LANES.reduce((sum, lane) => sum + (totals[lane.status] || 0), 0);

  return (
    <div className="container-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Moderation</p>
          <h1 className="page-title mt-1">Triage queue</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Reports are private until a moderator verifies and publishes them.{" "}
          {backlog === 0
            ? "The queue is clear."
            : `${backlog} ${backlog === 1 ? "issue needs" : "issues need"} attention.`}
        </p>
        <Link href="/moderation/opportunities" className="mt-3 inline-flex text-sm font-semibold text-accent">
          Manage TaskMatch opportunities
        </Link>
        </div>
        <ModeratorNav current="/moderation" />
      </div>

      {error && <ErrorNote message={error} onRetry={load} />}

      {loading ? (
        <SkeletonCards count={3} />
      ) : (
        LANES.map((lane) => {
          const items = lanes[lane.status] || [];
          return (
            <section key={lane.status} className="space-y-3">
              <SectionHeader
                title={lane.title}
                description={lane.blurb}
                right={
                  <span className="badge bg-demo-bg text-demo">
                    {totals[lane.status] || 0}
                  </span>
                }
              />
              {items.length === 0 ? (
                <div className="panel panel-pad">
                  <p className="text-sm text-muted">Nothing waiting here.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((issue) => (
                    <li key={issue.publicId}>
                      <Link
                        href={`/issues/${issue.publicId}`}
                        className="panel panel-pad flex items-start gap-3 transition-colors hover:bg-surface-2"
                      >
                        <CompanyLogo
                          name={issue.company.name}
                          logoUrl={issue.company.logoUrl}
                          size="md"
                          fit="mark"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="num text-xs text-subtle">
                              {issue.publicId}
                            </span>
                            <span className="text-sm font-semibold">
                              {issue.company.name}
                            </span>
                            <span className="badge bg-surface-2 text-muted">
                              {humanize(issue.category)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm font-medium">
                            {issue.title}
                          </p>
                          <p className="mt-1 text-xs text-subtle">
                            Submitted {formatDateTime(issue.submittedAt)} ·{" "}
                            {formatRelativeTime(issue.submittedAt)}
                            {issue.replyCount
                              ? ` · ${issue.replyCount} ${
                                  issue.replyCount === 1 ? "reply" : "replies"
                                }`
                              : ""}
                          </p>
                        </div>
                        <span className="btn btn-secondary btn-sm shrink-0">
                          Review
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
