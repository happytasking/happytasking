"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api, qs } from "@/lib/api";
import { useSoftQuery } from "@/lib/useSoftQuery";
import { useAuth } from "@/lib/auth";
import type {
  Company,
  CompanyTrends,
  ContributorProfile,
  Discussion,
  Pagination,
} from "@/lib/types";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { QuickPulse } from "@/components/QuickPulse";
import { ClaimBadge } from "@/components/ClaimBadge";
import { CompanyClaimPanel } from "@/components/CompanyClaimPanel";
import { CompanyLogo } from "@/components/CompanyLogo";
import { ContributorConfidence } from "@/components/ContributorConfidence";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton, SkeletonCards } from "@/components/Skeleton";
import { ScoreBar } from "@/components/ScoreBar";
import { TaskScoreBadge } from "@/components/TaskScoreBadge";
import { CompanyReviewList } from "@/components/CompanyReviewList";
import { Trend } from "@/components/Trend";
import {
  DIMENSION_LABELS,
  RADAR_DIMENSION_LABELS,
  formatMoney,
  humanize,
} from "@/lib/format";
import {
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  DonutChart,
  RadarChart,
  SERIES_PALETTE,
} from "@/components/charts";
import {
  AvailabilityTrendCard,
  PayGapCard,
  ReputationTrendCard,
  ReviewVolumeCard,
} from "@/components/TrendPanels";
import { CompanyMatches } from "@/components/taskmatch/CompanyMatches";

function CompanyDetailContent() {
  const params = useParams<{ slug: string }>();
  const { searchParams, setQuery } = useSoftQuery();
  const period = searchParams.get("period") || "90d";
  const tab = searchParams.get("tab") === "reviews" ? "reviews" : "overview";
  const slug = params.slug;
  const { user } = useAuth();
  const [profile, setProfile] = useState<ContributorProfile | null>(null);

  const [company, setCompany] = useState<Company | null>(null);
  const [trends, setTrends] = useState<CompanyTrends | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Distinguishes first paint from filter refreshes without putting `company`
  // into the fetch dependency list (which would re-fire after every setState).
  const hasDataRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    void api<ContributorProfile>("/profile")
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [user]);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isRefresh = hasDataRef.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [c, community, t] = await Promise.all([
        api<Company>(`/companies/${slug}${qs({ period })}`),
        api<{ items: Discussion[]; pagination: Pagination }>(
          `/community${qs({ company: slug, sort: "trending", limit: 5 })}`,
        ),
        api<CompanyTrends>(`/companies/${slug}/trends`).catch(() => null),
      ]);
      if (requestId !== requestIdRef.current) return;
      setCompany(c);
      setDiscussions(community.items);
      setTrends(t);
      hasDataRef.current = true;
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to load company");
      if (!hasDataRef.current) setCompany(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [slug, period]);

  useEffect(() => {
    hasDataRef.current = false;
    setCompany(null);
    setTrends(null);
    setDiscussions([]);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !company) {
    return (
      <div className="container-page space-y-6" role="status" aria-label="Loading">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr]">
          <Skeleton className="h-56" />
          <SkeletonCards count={4} className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container-page space-y-4">
        {error && <ErrorNote message={error} onRetry={() => void load()} />}
        <EmptyState
          title="Company not found"
          description={error || "This company may have been removed."}
          action={
            <Link href="/companies" className="btn btn-secondary">
              Back to directory
            </Link>
          }
        />
      </div>
    );
  }

  const dims = company.score?.dimensions;

  return (
    <div
      className={`container-page space-y-6 transition-opacity ${
        refreshing ? "opacity-60" : "opacity-100"
      }`}
      aria-busy={refreshing}
    >      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-5">
          <CompanyLogo
            name={company.name}
            logoUrl={company.logoUrl}
            size="xl"
            fit="auto"
            className="sm:mt-1"
          />
          <div className="min-w-0">
          <p className="eyebrow">Company overview</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="page-title">{company.name}</h1>
            <DemoBadge show={!!company.isDemo} />
            <ClaimBadge status={company.claimStatus} />
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {company.description || "No description yet."}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {company.country && <span>{company.country}</span>}
            {company.headquarters && <span>{company.headquarters}</span>}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                Website
              </a>
            )}
          </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/reviews/new?company=${company.slug}`}
            className="btn btn-accent min-h-11"
          >
            Share experience
          </Link>
          <Link
            href={`/issues/new?company=${company.slug}`}
            className="btn btn-secondary min-h-11"
          >
            Report issue
          </Link>
        </div>
      </div>

      <CompanyClaimPanel
        slug={company.slug}
        name={company.name}
        claimStatus={company.claimStatus}
        defaultOpen={searchParams.get("claim") === "1"}
      />

      <CompanyMatches slug={company.slug} name={company.name} />

      <div className="tabs" role="tablist" aria-label="Company sections">
        <button
          type="button"
          role="tab"
          className="tab"
          data-active={tab === "overview"}
          aria-selected={tab === "overview"}
          onClick={() => setQuery({ tab: null }, { push: true })}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          data-active={tab === "reviews"}
          aria-selected={tab === "reviews"}
          onClick={() => setQuery({ tab: "reviews" }, { push: true })}
        >
          Reviews
        </button>
      </div>

      {tab === "reviews" ? (
        <CompanyReviewList slug={slug} />
      ) : (
      <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr]">
        <div className="panel panel-pad space-y-4">
          <TaskScoreBadge
            score={company.score?.taskScore}
            size="lg"
            showMeta
            sampleSize={company.score?.sampleSize}
            period={company.score?.period || period}
          />
          <div className="border-t border-border pt-4">
            <ContributorConfidence
              confidence={company.score?.confidence}
              sampleSize={company.score?.sampleSize}
              period={company.score?.period || period}
            />
          </div>
          <div>
            <label className="label" htmlFor="period">
              Period
            </label>
            <select
              id="period"
              className="select"
              value={period}
              disabled={refreshing}
              onChange={(e) => setQuery({ period: e.target.value })}
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel panel-pad">
            <SectionHeader
              title="Score dimensions"
              description="Aggregated 0–100 from structured reports"
              actionHref={`/compare?a=${company.slug}`}
              actionLabel="Compare"
            />
            {dims ? (
              <div className="mt-1 grid gap-6 lg:grid-cols-[minmax(0,21.25rem)_1fr] lg:items-center">
                <RadarChart
                  axes={Object.values(RADAR_DIMENSION_LABELS)}
                  series={[
                    {
                      name: company.name,
                      color: CHART_COLORS.emerald,
                      values: Object.keys(RADAR_DIMENSION_LABELS).map(
                        (key) => dims[key as keyof typeof dims],
                      ),
                    },
                  ]}
                  height={300}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                    <ScoreBar
                      key={key}
                      label={label}
                      value={dims[key as keyof typeof dims]}
                      max={100}
                      suffix={key === "wouldWorkAgainRate" ? "%" : undefined}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <ChartEmpty message="No dimension scores yet" />
              </div>
            )}
          </section>

          {trends && (
            <ReputationTrendCard
              taskScore={trends.taskScore}
              sentiment={trends.sentiment}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
            {trends ? (
              <AvailabilityTrendCard availability={trends.availability} />
            ) : (
              <div />
            )}

            <section className="panel panel-pad">
              <SectionHeader
                title="TaskPulse"
                description="Last 7 days"
              />
              <dl className="mt-1 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Availability</dt>
                  <dd>
                    <AvailabilityPill status={company.pulse?.availability} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Trend</dt>
                  <dd>
                    {company.pulse?.trend ? (
                      <Trend direction={company.pulse.trend} />
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Reports</dt>
                  <dd className="num font-semibold">
                    {company.pulse?.sampleSize ?? 0}
                  </dd>
                </div>
              </dl>
              {(() => {
                const match = profile?.experiences.find(
                  (e) => e.company.slug === company.slug && e.currentlyActive,
                );
                if (!match) return null;
                return (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-sm font-medium">
                      You currently work with {company.name}. How is task
                      availability today?
                    </p>
                    <QuickPulse
                      companySlug={company.slug}
                      companyName={company.name}
                      domainId={match.domain?.id}
                      domainName={match.domain?.name}
                    />
                  </div>
                );
              })()}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {trends && <PayGapCard pay={trends.pay} />}

            <section className="panel panel-pad">
              <SectionHeader
                title="Pay by domain"
                description="Advertised vs effective hourly"
              />
              {(company.payByDomain || []).length === 0 ? (
                <p className="text-sm text-muted">No pay reports yet.</p>
              ) : (
                <div className="table-wrap -mx-1">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Advertised</th>
                        <th>Effective</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.payByDomain!.map((p) => (
                        <tr key={p.domain}>
                          <td className="font-medium">{p.domain}</td>
                          <td className="num text-muted">
                            {formatMoney(p.advertisedRate)}
                          </td>
                          <td className="num font-semibold">
                            {formatMoney(p.effectiveRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {trends && <ReviewVolumeCard volume={trends.reviewVolume} />}

            <ChartCard
              title="Issue mix"
              subtitle="Published issues by category"
              action={
                <Link
                  href={`/issues?company=${company.slug}`}
                  className="text-[0.8125rem] font-semibold text-accent hover:underline"
                >
                  View issues
                </Link>
              }
            >
              {(company.topIssues || []).length === 0 ? (
                <ChartEmpty message="No published issues" />
              ) : (
                <DonutChart
                  slices={company.topIssues!.map((issue, i) => ({
                    label: humanize(issue.category),
                    value: issue.count,
                    color: SERIES_PALETTE[i % SERIES_PALETTE.length],
                  }))}
                  centerValue={String(
                    company.topIssues!.reduce((sum, i) => sum + i.count, 0),
                  )}
                  centerLabel="issues"
                />
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6">
            <section className="panel panel-pad">
              <SectionHeader
                title="Community"
                actionHref={`/community?company=${company.slug}`}
                actionLabel="All"
              />
              {discussions.length === 0 ? (
                <p className="text-sm text-muted">No discussions yet.</p>
              ) : (
                <div className="space-y-2">
                  {discussions.map((d) => (
                    <Link
                      key={d.id}
                      href={`/community/${d.id}`}
                      className="block rounded-[--radius-sm] border border-border px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-[rgba(12,14,18,0.045)]"
                    >
                      <p className="text-sm font-medium leading-snug">{d.title}</p>
                      <p className="mt-0.5 text-xs text-subtle">
                        {d._count?.comments ?? 0} comments
                        {d.voteScore != null ? ` · ${d.voteScore} votes` : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <CompanyDetailContent />
    </Suspense>
  );
}
