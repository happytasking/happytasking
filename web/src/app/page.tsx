"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import type {
  Company,
  LiveMarket,
  MarketDashboard,
  MarketTrends,
  Pagination,
  Review,
  Skill,
} from "@/lib/types";
import { LiveMarketTable } from "@/components/LiveMarketTable";
import { CompanyLogo } from "@/components/CompanyLogo";
import { LinkableRow } from "@/components/LinkableRow";
import { CompanySearch } from "@/components/CompanySearch";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { BrandTagline } from "@/components/Logo";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton, SkeletonCards, SkeletonRows } from "@/components/Skeleton";
import { StatCard } from "@/components/StatCard";
import { TaskScoreBadge } from "@/components/TaskScoreBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate, formatMoney, humanize, scoreTone } from "@/lib/format";
import {
  BarChart,
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  ChartLegend,
  LineChart,
  Sparkline,
  trendColor,
} from "@/components/charts";

const meterFill = {
  good: "var(--good)",
  mid: "var(--mid)",
  low: "var(--low)",
  none: "var(--border-strong)",
} as const;

function MiniMeter({ value }: { value: number | null | undefined }) {
  const pct = value == null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="meter w-14">
        <span style={{ width: `${pct}%`, background: meterFill[scoreTone(value)] }} />
      </div>
      <span className="num w-6 text-[0.8125rem] text-muted">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [liveMarket, setLiveMarket] = useState<LiveMarket | null>(null);
  const [market, setMarket] = useState<MarketDashboard | null>(null);
  const [trends, setTrends] = useState<MarketTrends | null>(null);
  const [companyTotal, setCompanyTotal] = useState<number | null>(null);
  const [domainCount, setDomainCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [companyRes, latest, skillRes, liveRes, marketRes, trendRes] =
        await Promise.all([
          api<{ items: Company[]; pagination: Pagination }>(
            `/companies${qs({ sort: "score", period: "90d", limit: 10 })}`,
          ),
          api<Review[]>("/reviews/latest"),
          api<Skill[]>("/companies/meta/skills"),
          api<LiveMarket>("/market/live"),
          api<MarketDashboard>("/market"),
          api<MarketTrends>("/market/trends").catch(() => null),
        ]);
      setLiveMarket(liveRes);
      setCompanies(companyRes.items);
      setCompanyTotal(companyRes.pagination.total);
      setReviews(latest.slice(0, 4));
      setSkills(skillRes.slice(0, 12));
      setMarket(marketRes);
      setTrends(trendRes);
      setDomainCount(marketRes.medianEffectiveByDomain.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-14">
      {/* Hero — a single centered composition so the leaderboard lands above the fold.
          No overflow clipping here: the search typeahead drops out of this section. */}
      <section className="relative -mt-6 md:-mt-8">
        <div className="dot-field pointer-events-none absolute inset-0 opacity-30" />
        <div className="container-page relative pb-7 pt-12 text-center md:pb-9 md:pt-16">
          <div className="animate-rise mx-auto max-w-3xl">
            <BrandTagline height={13} className="mx-auto" />
            <h1 className="page-title mx-auto mt-6">AI work right now</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
              Updated from contributor reports · Last 7 days.
            </p>
          </div>

          <div className="animate-rise mx-auto mt-8 max-w-3xl">
            <div className="panel table-wrap text-left">
              {loading ? (
                <SkeletonRows rows={5} />
              ) : !liveMarket || liveMarket.items.length === 0 ? (
                <div className="p-2">
                  <EmptyState
                    title="No live reports yet"
                    description="Share availability and pay so this board can update every week."
                  />
                </div>
              ) : (
                <LiveMarketTable items={liveMarket.items.slice(0, 6)} />
              )}
            </div>
            {liveMarket?.updatedAt && (
              <p className="mt-2.5 text-center text-xs text-subtle">
                Snapshot · {formatDate(liveMarket.updatedAt)} · Last 7 days
              </p>
            )}
          </div>

          <div className="animate-fade mx-auto mt-8 max-w-xl">
            <CompanySearch />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.8125rem] text-subtle">
              <span>
                <strong className="num font-semibold text-foreground">
                  {loading ? "—" : (companyTotal ?? 0)}
                </strong>{" "}
                companies tracked
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="num font-semibold text-foreground">
                  {loading ? "—" : (domainCount ?? 0)}
                </strong>{" "}
                work domains
              </span>
              <span aria-hidden="true">·</span>
              <Link href="/reviews/new" className="font-semibold text-accent hover:underline">
                Share your experience →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page space-y-14">
        {error && <ErrorNote message={error} onRetry={() => void load()} />}

        <section>
          <SectionHeader
            title="Top AI work companies"
            description="Ranked by TaskScore over the last 90 days"
            actionHref="/companies"
            actionLabel="Full directory"
          />
          <div className="panel table-wrap">
            {loading ? (
              <SkeletonRows rows={8} />
            ) : companies.length === 0 ? (
              <div className="p-2">
                <EmptyState
                  title="No companies yet"
                  description="Seed demo data or add the first company to get started."
                />
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "2.5rem" }}>#</th>
                    <th>Company</th>
                    <th>TaskScore</th>
                    <th>12-week trend</th>
                    <th>Pay</th>
                    <th>Stability</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c, i) => (
                    <LinkableRow key={c.id} href={`/companies/${c.slug}`}>
                      <td className="num text-subtle">{i + 1}</td>
                      <td>
                        <Link
                          href={`/companies/${c.slug}`}
                          className="group flex items-center gap-3"
                        >
                          <CompanyLogo
                            name={c.name}
                            logoUrl={c.logoUrl}
                            size="md"
                          />
                          <span className="min-w-0">
                            <span className="inline-flex items-center gap-2 font-semibold group-hover:text-accent">
                              {c.name}
                              <DemoBadge show={!!c.isDemo} />
                            </span>
                            {c.country && (
                              <span className="block text-xs text-subtle">
                                {c.country}
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <TaskScoreBadge
                          score={c.score?.taskScore}
                          size="md"
                          mood
                        />
                      </td>
                      <td>
                        <Sparkline
                          points={c.scoreTrend ?? []}
                          color={trendColor(c.scoreTrend)}
                          ariaLabel={`${c.name} sentiment trend`}
                        />
                      </td>
                      <td>
                        <MiniMeter value={c.score?.dimensions.pay} />
                      </td>
                      <td>
                        <MiniMeter value={c.score?.dimensions.projectStability} />
                      </td>
                      <td className="num text-muted">
                        {c.score?.sampleSize ?? 0}
                      </td>
                    </LinkableRow>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Pulse */}
        <section>
          <SectionHeader
            title="AI Work Pulse"
            description="Current market conditions across tracked companies"
            right={market?.isDemo ? <DemoBadge /> : undefined}
            actionHref="/market"
            actionLabel="Market dashboard"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <SkeletonCards count={4} className="h-[5.75rem]" />
            ) : (
              <>
                <StatCard
                  label="Task availability"
                  value={
                    market?.pulse.taskAvailability
                      ? market.pulse.taskAvailability === "NO_TASKS"
                        ? "No tasks"
                        : humanize(market.pulse.taskAvailability)
                      : "—"
                  }
                  hint="Last 7 days of reports"
                  tone={
                    market?.pulse.taskAvailability === "HIGH"
                      ? "good"
                      : market?.pulse.taskAvailability === "MODERATE"
                        ? "mid"
                        : market?.pulse.taskAvailability
                          ? "low"
                          : "none"
                  }
                />
                <StatCard
                  label="Median effective rate"
                  value={formatMoney(market?.pulse.medianEffectiveRate ?? null)}
                  hint="Across all domains, per hour"
                />
                <StatCard
                  label="Worker sentiment"
                  value={
                    market?.pulse.workerSentiment != null
                      ? `${market.pulse.workerSentiment}`
                      : "—"
                  }
                  hint="0–100 from recent experiences"
                  tone={
                    market?.pulse.workerSentiment == null
                      ? "none"
                      : market.pulse.workerSentiment >= 70
                        ? "good"
                        : market.pulse.workerSentiment >= 50
                          ? "mid"
                          : "low"
                  }
                />
                <StatCard
                  label="Market stability"
                  value={market?.pulse.marketStability ?? "—"}
                  hint="Project stability spread"
                />
              </>
            )}
          </div>
          {market?.label && (
            <p className="mt-2.5 text-xs text-subtle">{market.label}</p>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Reputation and sentiment"
              subtitle="Rolling 30-day windows, last 12 weeks"
              legend={
                <ChartLegend
                  items={[
                    { name: "TaskScore", color: CHART_COLORS.emerald },
                    { name: "Sentiment", color: CHART_COLORS.blue, dashed: true },
                  ]}
                />
              }
            >
              {loading ? (
                <Skeleton className="h-[13.125rem] w-full" />
              ) : trends ? (
                <LineChart
                  series={[
                    {
                      name: "TaskScore",
                      color: CHART_COLORS.emerald,
                      points: trends.reputation,
                      area: true,
                    },
                    {
                      name: "Sentiment",
                      color: CHART_COLORS.blue,
                      points: trends.sentiment,
                      dashed: true,
                    },
                  ]}
                  domain={[0, 100]}
                  height={210}
                  sampleLabel="reviews in window"
                />
              ) : (
                <ChartEmpty />
              )}
            </ChartCard>

            <ChartCard
              title="Effective pay by domain"
              subtitle="Median hourly rate contributors actually earn"
              action={
                <Link
                  href="/market"
                  className="text-[0.8125rem] font-semibold text-accent hover:underline"
                >
                  Details
                </Link>
              }
            >
              {loading ? (
                <Skeleton className="h-[13.125rem] w-full" />
              ) : market && market.medianEffectiveByDomain.length > 0 ? (
                <BarChart
                  data={market.medianEffectiveByDomain
                    .slice()
                    .sort(
                      (x, y) =>
                        (y.medianEffectiveRate ?? 0) -
                        (x.medianEffectiveRate ?? 0),
                    )
                    .slice(0, 7)
                    .map((row) => ({
                      label: row.domain,
                      value: row.medianEffectiveRate,
                      meta: `${row.sampleSize} reports`,
                    }))}
                  valuePrefix="$"
                  labelWidth={100}
                  barHeight={20}
                  gap={8}
                  formatValue={(v) => v.toFixed(0)}
                />
              ) : (
                <ChartEmpty message="No pay reports yet" />
              )}
            </ChartCard>
          </div>
        </section>

        {/* Latest experiences */}
        <section>
          <SectionHeader
            title="Latest verified experiences"
            description="Structured reports from contributors — no confidential work"
            actionHref="/reviews/new"
            actionLabel="Share yours"
          />
          <div className="grid gap-3 md:grid-cols-2">
            {loading ? (
              <SkeletonCards count={4} className="h-32" />
            ) : reviews.length === 0 ? (
              <EmptyState title="No experiences yet" />
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="panel panel-hover panel-pad">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <CompanyLogo
                        name={r.company?.name ?? "Company"}
                        logoUrl={r.company?.logoUrl}
                        size="sm"
                        fit="mark"
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                      <Link
                        href={
                          r.company ? `/companies/${r.company.slug}` : "/companies"
                        }
                        className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline"
                      >
                        {r.company?.name ?? "Company"}
                      </Link>
                      <h3 className="mt-1 text-[0.9375rem] font-semibold leading-snug">
                        {r.title}
                      </h3>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <DemoBadge show={!!r.isDemo} />
                      <span className="badge bg-demo-bg text-demo">
                        {r.overallExperience}/5
                      </span>
                    </div>
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">
                    {r.body}
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
                    <span className="inline-flex items-center gap-1.5">
                      <UserAvatar
                        name={
                          r.authorLabel === "Anonymous contributor"
                            ? null
                            : r.authorLabel
                        }
                        anonymous={r.authorLabel === "Anonymous contributor"}
                        size="xs"
                      />
                      <span className="font-medium text-muted">{r.authorLabel}</span>
                    </span>
                    <span>·</span>
                    <span>{formatDate(r.createdAt)}</span>
                    {r.domain?.name && (
                      <>
                        <span>·</span>
                        <span>{r.domain.name}</span>
                      </>
                    )}
                    {r.wouldWorkAgain && (
                      <span className="badge ml-auto bg-good-bg text-good">
                        Would work again
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Skills — a light strip rather than a rail, so the page stays scannable */}
        <section>
          <SectionHeader
            title="Top skills"
            description="Where contributors are reporting work"
            actionHref="/companies"
            actionLabel="Browse by skill"
          />
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-24" />
              </>
            ) : skills.length === 0 ? (
              <p className="text-sm text-muted">No skills loaded.</p>
            ) : (
              skills.map((s) => (
                <span key={s.id} className="chip">
                  {s.name}
                </span>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
