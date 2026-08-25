"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, qs } from "@/lib/api";
import { useSoftQuery } from "@/lib/useSoftQuery";
import type { Company, Domain, Pagination } from "@/lib/types";
import type { CompanyDirectory } from "@/lib/publicCompanies";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { ClaimBadge } from "@/components/ClaimBadge";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton, SkeletonCards, SkeletonRows } from "@/components/Skeleton";
import { StarRating } from "@/components/StarRating";
import { TaskScoreBadge } from "@/components/TaskScoreBadge";
import { Sparkline, trendColor } from "@/components/charts";
import { CompanyLogo } from "@/components/CompanyLogo";

function CompaniesContent({ initial }: { initial: CompanyDirectory }) {
  const { searchParams, setQuery } = useSoftQuery();
  const [items, setItems] = useState<Company[]>(initial.items);
  const [pagination, setPagination] = useState<Pagination | null>(
    initial.pagination,
  );
  const [domains, setDomains] = useState<Domain[]>(initial.domains);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(initial.items.length > 0);
  const requestIdRef = useRef(0);
  const skipFirstLoad = useRef(true);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      sort: searchParams.get("sort") || "score",
      period: searchParams.get("period") || "90d",
      domain: searchParams.get("domain") || "",
      page: Number(searchParams.get("page") || "1"),
    }),
    [searchParams],
  );

  useEffect(() => {
    if (initial.domains.length > 0) return;
    void api<Domain[]>("/companies/meta/domains")
      .then(setDomains)
      .catch(() => undefined);
  }, [initial.domains.length]);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isRefresh = hasDataRef.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api<{ items: Company[]; pagination: Pagination }>(
        `/companies${qs({
          search: filters.search,
          sort: filters.sort,
          period: filters.period,
          domain: filters.domain,
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
      setError(e instanceof Error ? e.message : "Failed to load companies");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    void load();
  }, [load]);

  function update(next: Record<string, string>, opts?: { push?: boolean }) {
    setQuery(next, {
      push: opts?.push,
      resetPage: !("page" in next),
    });
  }

  const resultLabel = error && items.length === 0
    ? null
    : pagination
      ? `${pagination.total} compan${pagination.total === 1 ? "y" : "ies"}`
      : null;

  return (
    <div className="container-page space-y-6">
      <div>
        <p className="eyebrow">Directory</p>
        <h1 className="page-title mt-1">AI Work Companies</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Compare companies offering AI training, evaluation, coding, annotation
          and expert task work. Explore community-reported pay, task availability,
          stability and contributor experiences.
        </p>
      </div>

      <div className="panel panel-pad grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            className="input"
            defaultValue={filters.search}
            placeholder="Company name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update({ search: (e.target as HTMLInputElement).value });
              }
            }}
            onBlur={(e) => update({ search: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            className="select"
            value={filters.sort}
            disabled={refreshing}
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="score">TaskScore</option>
            <option value="name">Name</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="period">
            Period
          </label>
          <select
            id="period"
            className="select"
            value={filters.period}
            disabled={refreshing}
            onChange={(e) => update({ period: e.target.value })}
          >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="domain">
            Domain
          </label>
          <select
            id="domain"
            className="select"
            value={filters.domain}
            disabled={refreshing}
            onChange={(e) => update({ domain: e.target.value })}
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {loading && !hasDataRef.current ? (
            <Skeleton as="span" className="inline-block h-4 w-28" />
          ) : (
            <span className="num font-semibold text-foreground">
              {resultLabel ?? (error ? "Directory unavailable" : "")}
              {refreshing ? " · updating…" : ""}
            </span>
          )}
          {!(loading && !hasDataRef.current) && filters.search && (
            <span className="text-subtle"> matching “{filters.search}”</span>
          )}
        </p>
      </div>

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      <div
        className={`space-y-6 transition-opacity ${
          refreshing ? "opacity-60" : "opacity-100"
        }`}
        aria-busy={refreshing}
      >
      {/* Desktop table */}
      <div className="panel table-wrap hidden md:block">
        {loading && items.length === 0 ? (
          <SkeletonRows rows={8} />
        ) : error && items.length === 0 ? null : items.length === 0 ? (
          <div className="p-2">
            <EmptyState
              title="No companies matched"
              description="Try clearing filters or searching a different name."
            />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Country</th>
                <th>TaskScore</th>
                <th>Tasks</th>
                <th>Pay</th>
                <th>Sample</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/companies/${c.slug}`}
                      className="group inline-flex items-center gap-3"
                    >
                      <CompanyLogo name={c.name} logoUrl={c.logoUrl} size="md" />
                      <span className="inline-flex items-center gap-2 font-semibold group-hover:text-accent">
                        {c.name}
                        <ClaimBadge status={c.claimStatus} hideUnclaimed />
                        <DemoBadge show={!!c.isDemo} />
                      </span>
                    </Link>
                  </td>
                  <td className="text-muted">{c.country || "—"}</td>
                  <td>
                    <TaskScoreBadge score={c.score?.taskScore} size="sm" />
                  </td>
                  <td>
                    <AvailabilityPill
                      status={c.pulse?.availability}
                      trend={c.pulse?.trend}
                    />
                  </td>
                  <td>
                    <StarRating
                      value={
                        c.score?.dimensions.pay != null
                          ? Math.round(c.score.dimensions.pay / 20)
                          : null
                      }
                    />
                  </td>
                  <td className="num text-muted">{c.score?.sampleSize ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 md:hidden">
        {loading && items.length === 0 ? (
          <SkeletonCards count={5} className="h-28" />
        ) : error && items.length === 0 ? null : items.length === 0 ? (
          <EmptyState
            title="No companies matched"
            description="Try clearing filters or searching a different name."
          />
        ) : (
          items.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.slug}`}
              className="panel panel-hover panel-pad block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <CompanyLogo name={c.name} logoUrl={c.logoUrl} size="sm" fit="auto" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{c.name}</h2>
                      <ClaimBadge status={c.claimStatus} hideUnclaimed />
                      <DemoBadge show={!!c.isDemo} />
                    </div>
                    <p className="mt-0.5 text-xs text-subtle">
                      {c.country || "—"}
                      {c.score?.sampleSize != null
                        ? ` · ${c.score.sampleSize} reports`
                        : ""}
                    </p>
                  </div>
                </div>
                <TaskScoreBadge score={c.score?.taskScore} size="sm" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">
                    Pay
                  </p>
                  <StarRating
                    value={
                      c.score?.dimensions.pay != null
                        ? Math.round(c.score.dimensions.pay / 20)
                        : null
                    }
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">
                    Tasks
                  </p>
                  <AvailabilityPill
                    status={c.pulse?.availability}
                    trend={c.pulse?.trend}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-subtle">
                  {c.score?.sampleSize ?? 0} reports
                </span>
                <Sparkline
                  points={c.scoreTrend ?? []}
                  color={trendColor(c.scoreTrend)}
                  ariaLabel={`${c.name} sentiment trend`}
                />
              </div>
            </Link>
          ))
        )}
      </div>

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

export function CompaniesDirectory({ initial }: { initial: CompanyDirectory }) {
  return (
    <Suspense
      fallback={
        <div className="container-page space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <SkeletonRows rows={6} />
        </div>
      }
    >
      <CompaniesContent initial={initial} />
    </Suspense>
  );
}
