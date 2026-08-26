"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { MarketDashboard, MarketTrends } from "@/lib/types";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton, SkeletonCards, SkeletonRows } from "@/components/Skeleton";
import { StatCard } from "@/components/StatCard";
import { TaskScoreBadge } from "@/components/TaskScoreBadge";
import { Trend } from "@/components/Trend";
import { formatMoney, humanize, scoreTone } from "@/lib/format";
import {
  BarChart,
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  ChartLegend,
  LineChart,
  SERIES_PALETTE,
} from "@/components/charts";
import {
  AvailabilityTrendCard,
  ReputationTrendCard,
} from "@/components/TrendPanels";

const meterFill = {
  good: "var(--good)",
  mid: "var(--mid)",
  low: "var(--low)",
  none: "var(--border-strong)",
} as const;

export default function MarketPage({
  initial,
}: {
  initial: { market: MarketDashboard; trends: MarketTrends | null };
}) {
  const [market, setMarket] = useState<MarketDashboard | null>(initial.market);
  const [trends, setTrends] = useState<MarketTrends | null>(initial.trends);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, t] = await Promise.all([
        api<MarketDashboard>("/market"),
        api<MarketTrends>("/market/trends").catch(() => null),
      ]);
      setMarket(data);
      setTrends(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load market");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading && !market) {
    return (
      <div className="container-page space-y-6" role="status" aria-label="Loading">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCards count={4} className="h-[5.75rem]" />
        </div>
        <SkeletonRows rows={6} />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container-page space-y-4">
        {error && <ErrorNote message={error} onRetry={() => void load()} />}
        <EmptyState
          title="Market unavailable"
          description={error || "Could not load market intelligence."}
        />
      </div>
    );
  }

  const payLines = (trends?.payByDomainOverTime ?? [])
    .slice()
    .sort((a, b) => b.sampleSize - a.sampleSize)
    .slice(0, 4)
    .map((domain, i) => ({
      name: domain.domain,
      color: SERIES_PALETTE[i % SERIES_PALETTE.length],
      points: domain.points.map((p) => ({
        label: p.label,
        value: p.effective,
        sampleSize: p.sampleSize,
      })),
    }));

  return (
    <div className="container-page space-y-8">
      {error && <ErrorNote message={error} onRetry={() => void load()} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Intelligence</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="page-title">AI Work Market</h1>
            <DemoBadge show={market.isDemo} />
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Pay, demand, stability, and sentiment aggregated from structured
            contributor reports across tracked AI work companies.
          </p>
        </div>
        {market.isDemo && (
          <div className="panel panel-pad max-w-xs">
            <p className="eyebrow">Demo data</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {market.label}. Production metrics replace these figures once live
              reports accumulate.
            </p>
          </div>
        )}
      </div>

      <section>
        <SectionHeader
          title="Market pulse"
          description="Current conditions across tracked companies"
          right={market.isDemo ? <DemoBadge /> : undefined}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Task availability"
            value={
              market.pulse.taskAvailability
                ? market.pulse.taskAvailability === "NO_TASKS"
                  ? "No tasks"
                  : humanize(market.pulse.taskAvailability)
                : "—"
            }
            hint="Last 7 days of reports"
            tone={
              market.pulse.taskAvailability === "HIGH"
                ? "good"
                : market.pulse.taskAvailability === "MODERATE"
                  ? "mid"
                  : market.pulse.taskAvailability
                    ? "low"
                    : "none"
            }
          />
          <StatCard
            label="Median effective rate"
            value={formatMoney(market.pulse.medianEffectiveRate)}
            hint="Across all domains, per hour"
          />
          <StatCard
            label="Worker sentiment"
            value={
              market.pulse.workerSentiment != null
                ? String(market.pulse.workerSentiment)
                : "—"
            }
            hint="0–100 from recent experiences"
            tone={
              market.pulse.workerSentiment == null
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
            value={market.pulse.marketStability}
            hint="Project stability spread"
          />
        </div>
      </section>

      {trends && (
        <ReputationTrendCard
          taskScore={trends.reputation}
          sentiment={trends.sentiment}
          title="Market reputation and sentiment"
          subtitle="All tracked companies, rolling 30-day windows"
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Median effective rate by domain"
          subtitle="What contributors actually earn per hour"
          footnote="Effective rate accounts for unpaid onboarding, waiting and rework time."
        >
          {market.medianEffectiveByDomain.length === 0 ? (
            <ChartEmpty message="No domain rates yet" />
          ) : (
            <BarChart
              data={market.medianEffectiveByDomain
                .slice()
                .sort(
                  (a, b) =>
                    (b.medianEffectiveRate ?? 0) - (a.medianEffectiveRate ?? 0),
                )
                .map((row) => ({
                  label: row.domain,
                  value: row.medianEffectiveRate,
                  meta: `${row.sampleSize} reports`,
                }))}
              valuePrefix="$"
              labelWidth={104}
              formatValue={(v) => v.toFixed(0)}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Domain demand"
          subtitle="Recent availability report volume and direction"
        >
          {market.demand.length === 0 ? (
            <ChartEmpty message="No demand signals yet" />
          ) : (
            <div className="space-y-4">
              <BarChart
                data={market.demand
                  .slice()
                  .sort((a, b) => b.recentReports - a.recentReports)
                  .map((d) => ({
                    label: d.domain,
                    value: d.recentReports,
                    color:
                      d.signal === "up"
                        ? CHART_COLORS.emerald
                        : d.signal === "down"
                          ? CHART_COLORS.rose
                          : CHART_COLORS.slate,
                  }))}
                labelWidth={104}
                barHeight={20}
                gap={8}
              />
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {market.demand.slice(0, 6).map((d) => (
                  <li
                    key={d.slug}
                    className="flex items-center gap-1.5 text-xs text-muted"
                  >
                    <span className="font-semibold">{d.domain}</span>
                    <Trend direction={d.signal} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Effective pay over time"
          subtitle="Top domains by report volume, monthly average"
          legend={
            payLines.length ? (
              <ChartLegend
                items={payLines.map((s) => ({ name: s.name, color: s.color }))}
              />
            ) : undefined
          }
        >
          {payLines.length ? (
            <LineChart
              series={payLines}
              height={230}
              valuePrefix="$"
              zeroBased
              sampleLabel="pay reports"
            />
          ) : (
            <ChartEmpty message="No pay reports yet" />
          )}
        </ChartCard>

        {trends ? (
          <AvailabilityTrendCard
            availability={trends.availability}
            title="Market task availability"
            subtitle="Daily reports across all tracked companies"
          />
        ) : (
          <div />
        )}
      </div>

      <ChartCard
        title="TaskScore leaderboard"
        subtitle="Reputation across tracked companies, 0–100"
        action={
          <Link
            href="/compare"
            className="text-[0.8125rem] font-semibold text-accent hover:underline"
          >
            Compare companies
          </Link>
        }
        footnote="Bars are colour-coded by score band: strong 70+, mixed 50–69, weak below 50."
      >
        {market.stability.length === 0 ? (
          <ChartEmpty message="No company scores yet" />
        ) : (
          <BarChart
            data={market.stability
              .slice()
              .sort((a, b) => (b.taskScore ?? 0) - (a.taskScore ?? 0))
              .map((row) => ({
                label: row.company,
                value: row.taskScore,
                color:
                  row.taskScore == null
                    ? CHART_COLORS.slate
                    : row.taskScore >= 70
                      ? CHART_COLORS.emerald
                      : row.taskScore >= 50
                        ? CHART_COLORS.amber
                        : CHART_COLORS.rose,
                meta: `${row.availability ?? "unknown"} availability`,
              }))}
            max={100}
            labelWidth={132}
            barHeight={20}
            gap={8}
          />
        )}
      </ChartCard>

      <section className="panel panel-pad">
        <SectionHeader
          title="Company stability snapshot"
          description="TaskScore, availability, and trend"
        />
        {/* Desktop */}
        <div className="table-wrap hidden md:block">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>TaskScore</th>
                <th>Stability</th>
                <th>Availability</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {market.stability.map((row) => {
                const stab =
                  row.stability != null ? Math.round(row.stability) : null;
                return (
                  <tr key={row.slug}>
                    <td>
                      <Link
                        href={`/companies/${row.slug}`}
                        className="group inline-flex items-center gap-2.5"
                      >
                        <CompanyLogo
                          name={row.company}
                          logoUrl={row.logoUrl}
                          size="sm"
                        />
                        <span className="whitespace-nowrap font-semibold group-hover:text-accent">
                          {row.company}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <TaskScoreBadge score={row.taskScore} size="sm" />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="meter w-16">
                          <span
                            style={{
                              width: `${stab ?? 0}%`,
                              background: meterFill[scoreTone(stab)],
                            }}
                          />
                        </div>
                        <span className="num text-muted">{stab ?? "—"}</span>
                      </div>
                    </td>
                    <td>
                      <AvailabilityPill status={row.availability} />
                    </td>
                    <td>
                      <Trend direction={row.trend} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="space-y-2.5 md:hidden">
          {market.stability.map((row) => {
            const stab =
              row.stability != null ? Math.round(row.stability) : null;
            return (
              <Link
                key={row.slug}
                href={`/companies/${row.slug}`}
                className="panel panel-hover block border-0 shadow-none ring-1 ring-border px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <CompanyLogo
                      name={row.company}
                      logoUrl={row.logoUrl}
                      size="sm"
                      fit="auto"
                    />
                    <span className="truncate font-semibold">{row.company}</span>
                  </span>
                  <TaskScoreBadge score={row.taskScore} size="sm" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AvailabilityPill status={row.availability} />
                  <Trend direction={row.trend} />
                  <span className="text-xs text-subtle">
                    Stability{" "}
                    <span className="num font-semibold text-muted">
                      {stab ?? "—"}
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
