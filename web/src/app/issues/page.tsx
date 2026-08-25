"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSoftQuery } from "@/lib/useSoftQuery";
import type { Issue, Pagination } from "@/lib/types";
import { ClaimBadge } from "@/components/ClaimBadge";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton, SkeletonCards } from "@/components/Skeleton";
import { authorName, UserAvatar } from "@/components/UserAvatar";
import { formatDate, humanize } from "@/lib/format";

function statusTone(status: string) {
  if (status === "RESOLVED" || status === "PARTIALLY_RESOLVED") {
    return "bg-good-bg text-good";
  }
  if (status === "UNRESOLVED") return "bg-low-bg text-low";
  if (status === "COMPANY_RESPONDED" || status === "PUBLISHED") {
    return "bg-accent-soft text-accent";
  }
  return "bg-demo-bg text-demo";
}

function IssuesContent() {
  const { searchParams, setQuery } = useSoftQuery();
  const { user } = useAuth();
  const [items, setItems] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(false);
  const requestIdRef = useRef(0);

  const filters = useMemo(
    () => ({
      company: searchParams.get("company") || "",
      page: Number(searchParams.get("page") || "1"),
    }),
    [searchParams],
  );

  const managedCompany = user?.companies?.find(
    (c) => c.slug === filters.company && c.approved,
  );

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isRefresh = hasDataRef.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api<{ items: Issue[]; pagination: Pagination }>(
        `/issues${qs({
          company: filters.company,
          page: filters.page,
          limit: 20,
        })}`,
      );
      if (requestId !== requestIdRef.current) return;
      setItems(data.items);
      setPagination(data.pagination);
      hasDataRef.current = true;
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to load issues");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [filters]);

  // Company reps see their own triage queue, so refetch once the session resolves.
  useEffect(() => {
    void load();
  }, [load, user?.id]);

  function update(next: Record<string, string>, opts?: { push?: boolean }) {
    setQuery(next, {
      push: opts?.push,
      resetPage: !("page" in next),
    });
  }

  return (
    <div className="container-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Resolution</p>
          <h1 className="page-title mt-1">Issues</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Structured resolution reports separate from ordinary reviews.
          </p>
        </div>
        <Link href="/issues/new" className="btn btn-accent min-h-11">
          Report an issue
        </Link>
      </div>

      {filters.company && (
        <>
          {managedCompany && (
            <div className="panel px-4 py-3">
              <p className="text-sm font-semibold">
                {managedCompany.name} inbox
              </p>
              <p className="mt-1 text-sm text-muted">
                You are viewing this company as a verified representative, so
                reports still in triage are included. Open an issue to post an
                official reply.
              </p>
            </div>
          )}
          <p className="text-sm text-muted">
            Filtered by company slug{" "}
            <span className="font-semibold text-foreground">
              {filters.company}
            </span>
            {" · "}
            <button
              type="button"
              className="font-semibold text-accent hover:underline"
              onClick={() => update({ company: "" })}
            >
              Clear
            </button>
          </p>
        </>
      )}

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      <div
        className={`transition-opacity ${refreshing ? "opacity-60" : "opacity-100"}`}
        aria-busy={refreshing}
      >
      {loading && items.length === 0 ? (
        <div className="space-y-2.5" role="status" aria-label="Loading">
          <SkeletonCards count={5} className="h-24" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No published issues"
          description="When contributors report payment or support problems, they appear here."
          action={
            <Link href="/issues/new" className="btn btn-secondary">
              Report an issue
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((issue) => {
            const anonymous = issue.identityProtected ?? !issue.author;
            const name = anonymous ? null : authorName(issue.author) || issue.identity;
            return (
              <Link
                key={issue.publicId}
                href={`/issues/${issue.publicId}`}
                className="panel panel-hover flex gap-3 panel-pad"
              >
                <UserAvatar
                  name={name}
                  anonymous={anonymous}
                  size="md"
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num text-xs font-semibold text-subtle">
                      {issue.publicId}
                    </span>
                    <DemoBadge show={issue.isDemo} />
                    <span className={`badge ${statusTone(issue.status)}`}>
                      {humanize(issue.status)}
                    </span>
                    {issue.companyReplied && (
                      <span className="badge bg-good-bg text-good">
                        Company replied
                      </span>
                    )}
                    {issue.isPublic === false && (
                      <span className="badge bg-mid-bg text-mid">In triage</span>
                    )}
                    <span className="chip shrink-0">{issue.identity}</span>
                  </div>
                  <h2 className="mt-1.5 text-[0.9375rem] font-semibold leading-snug">
                    {issue.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                    {issue.body}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-subtle">
                    <span>{humanize(issue.category)}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-muted">
                      <CompanyLogo
                        name={issue.company.name}
                        logoUrl={issue.company.logoUrl}
                        size="xs"
                        fit="mark"
                      />
                      {issue.company.name}
                    </span>
                    <ClaimBadge status={issue.company.claimStatus} hideUnclaimed />
                    <span>· {formatDate(issue.submittedAt)}</span>
                    {!!issue.replyCount && (
                      <span>
                        · {issue.replyCount}{" "}
                        {issue.replyCount === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            Page <span className="num">{pagination.page}</span> of{" "}
            <span className="num">{pagination.pages}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary min-h-11"
              disabled={pagination.page <= 1 || refreshing}
              onClick={() =>
                update({ page: String(pagination.page - 1) }, { push: true })
              }
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary min-h-11"
              disabled={pagination.page >= pagination.pages || refreshing}
              onClick={() =>
                update({ page: String(pagination.page + 1) }, { push: true })
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-40" />
          <SkeletonCards count={4} className="h-24" />
        </div>
      }
    >
      <IssuesContent />
    </Suspense>
  );
}
