"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, qs } from "@/lib/api";
import { useSoftQuery } from "@/lib/useSoftQuery";
import type {
  Company,
  CompanyTrends,
  TrendPoint,
} from "@/lib/types";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton, SkeletonCards } from "@/components/Skeleton";
import { TaskScoreBadge } from "@/components/TaskScoreBadge";
import {
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  ChartLegend,
  LineChart,
  RadarChart,
} from "@/components/charts";
import {
  DIMENSION_LABELS,
  RADAR_DIMENSION_LABELS,
  formatMoney,
} from "@/lib/format";
import { comparisonPath } from "@/lib/comparisonSeo";
import type { ComparePageData, CompareSide } from "@/lib/publicPages";

type Side = "a" | "b";

const SIDE_COLORS: Record<Side, string> = {
  a: CHART_COLORS.emerald,
  b: CHART_COLORS.blue,
};

type Loaded = CompareSide;

function toPoints(
  points: { label: string; value: number | null; sampleSize?: number }[],
): TrendPoint[] {
  return points.map((p) => ({
    date: "",
    label: p.label,
    value: p.value,
    sampleSize: p.sampleSize ?? 0,
  }));
}

function CompareContent({ initial }: { initial: ComparePageData }) {
  const { searchParams, setQuery } = useSoftQuery();

  const slugA = searchParams.get("a") || "";
  const slugB = searchParams.get("b") || "";

  const options = initial.options;
  const [a, setA] = useState<Loaded | null>(initial.a);
  const [b, setB] = useState<Loaded | null>(initial.b);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipFirstLoad = useRef(true);

  const loadSide = useCallback(async (slug: string): Promise<Loaded | null> => {
    if (!slug) return null;
    const [company, trends] = await Promise.all([
      api<Company>(`/companies/${slug}${qs({ period: "90d" })}`),
      api<CompanyTrends>(`/companies/${slug}/trends`).catch(() => null),
    ]);
    return { company, trends };
  }, []);

  const load = useCallback(async () => {
    if (!slugA && !slugB) {
      setA(null);
      setB(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [left, right] = await Promise.all([loadSide(slugA), loadSide(slugB)]);
      setA(left);
      setB(right);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load comparison");
    } finally {
      setLoading(false);
    }
  }, [slugA, slugB, loadSide]);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    void load();
  }, [load]);

  const setSide = (side: Side, slug: string) => {
    setQuery({ [side]: slug || null });
  };

  const swap = () => {
    if (!slugA && !slugB) return;
    setQuery({ a: slugB || null, b: slugA || null });
  };

  const sides = useMemo(
    () =>
      (
        [
          { key: "a" as Side, data: a },
          { key: "b" as Side, data: b },
        ] as const
      ).filter((s) => s.data),
    [a, b],
  );

  const radarSeries = sides
    .filter((s) => s.data?.trends?.dimensions)
    .map((s) => ({
      name: s.data!.company.name,
      color: SIDE_COLORS[s.key],
      values: Object.keys(RADAR_DIMENSION_LABELS).map((key) => {
        const dims = s.data!.trends!.dimensions;
        return dims[key as keyof typeof dims];
      }),
    }));

  const scoreSeries = sides
    .filter((s) => s.data?.trends)
    .map((s) => ({
      name: s.data!.company.name,
      color: SIDE_COLORS[s.key],
      points: toPoints(s.data!.trends!.taskScore),
      area: sides.length === 1,
    }));

  const availabilitySeries = sides
    .filter((s) => s.data?.trends)
    .map((s) => ({
      name: s.data!.company.name,
      color: SIDE_COLORS[s.key],
      points: toPoints(
        s.data!.trends!.availability.map((day) => ({
          label: day.label,
          value: day.index,
          sampleSize: day.sampleSize,
        })),
      ),
    }));

  const paySeries = sides
    .filter((s) => s.data?.trends)
    .map((s) => ({
      name: s.data!.company.name,
      color: SIDE_COLORS[s.key],
      points: toPoints(
        s.data!.trends!.pay.map((p) => ({
          label: p.label,
          value: p.effective,
          sampleSize: p.sampleSize,
        })),
      ),
    }));

  return (
    <div className="container-page space-y-6">
      <div>
        <p className="eyebrow">Head to head</p>
        <h1 className="page-title mt-1">Compare companies</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Put two platforms side by side on reputation, pay reality, task
          availability and the dimensions contributors actually report on.
        </p>
      </div>

      <section className="panel panel-pad">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          {(["a", "b"] as Side[]).map((side, index) => (
            <div key={side} className={index === 1 ? "sm:order-3" : undefined}>
              <label className="label" htmlFor={`compare-${side}`}>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="chart-swatch"
                    style={{ background: SIDE_COLORS[side] }}
                  />
                  {side === "a" ? "Company A" : "Company B"}
                </span>
              </label>
              <select
                id={`compare-${side}`}
                className="select"
                value={side === "a" ? slugA : slugB}
                onChange={(e) => setSide(side, e.target.value)}
              >
                <option value="">Select a company…</option>
                {options.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={swap}
            className="btn btn-secondary sm:order-2 sm:mb-0"
            disabled={!slugA && !slugB}
          >
            Swap
          </button>
        </div>
      </section>

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading">
          <SkeletonCards count={2} className="h-40" />
          <Skeleton className="h-72 sm:col-span-2" />
        </div>
      )}

      {!loading && sides.length === 0 && (
        <section className="panel panel-pad text-center">
          <h2 className="section-title">Pick two companies to compare</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
            Popular comparisons contributors ask about:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              ["outlier", "mercor"],
              ["dataannotation", "outlier"],
              ["scale-ai", "surge-ai"],
              ["mercor", "turing"],
            ].map(([left, right]) => {
              const href =
                comparisonPath(left, right) || `/compare?a=${left}&b=${right}`;
              return (
                <Link key={`${left}-${right}`} href={href} className="chip">
                  {left.replace(/-/g, " ")} vs {right.replace(/-/g, " ")}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {!loading && sides.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {sides.map(({ key, data }) => (
              <section key={key} className="panel panel-pad">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CompanyLogo
                      name={data!.company.name}
                      logoUrl={data!.company.logoUrl}
                      size="lg"
                      fit="auto"
                      className="mb-2.5"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="chart-swatch"
                        style={{ background: SIDE_COLORS[key] }}
                      />
                      <Link
                        href={`/companies/${data!.company.slug}`}
                        className="section-title hover:text-accent"
                      >
                        {data!.company.name}
                      </Link>
                      <DemoBadge show={!!data!.company.isDemo} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[0.8125rem] text-muted">
                      {data!.company.description}
                    </p>
                  </div>
                  <TaskScoreBadge
                    score={data!.company.score?.taskScore}
                    size="md"
                  />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3 text-sm">
                  <div>
                    <dt className="eyebrow">Reports</dt>
                    <dd className="num mt-1 font-semibold">
                      {data!.company.score?.sampleSize ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Verified</dt>
                    <dd className="num mt-1 font-semibold">
                      {data!.company.score?.verifiedPct ?? 0}%
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Tasks</dt>
                    <dd className="mt-1">
                      <AvailabilityPill status={data!.company.pulse?.availability} />
                    </dd>
                  </div>
                </dl>
              </section>
            ))}
          </div>

          <ChartCard
            title="Dimension profile"
            subtitle="Last 180 days, 0–100 per dimension"
            legend={
              <ChartLegend
                items={radarSeries.map((s) => ({ name: s.name, color: s.color }))}
              />
            }
            footnote="Larger shapes are better. Overlap shows where the two platforms genuinely differ."
          >
            {radarSeries.length ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,26.25rem)_1fr] lg:items-center">
                <RadarChart
                  axes={Object.values(RADAR_DIMENSION_LABELS)}
                  series={radarSeries}
                  height={340}
                />
                <DimensionTable sides={sides} />
              </div>
            ) : (
              <ChartEmpty message="No dimension data for these companies" />
            )}
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="TaskScore over time"
              subtitle="Rolling 30-day windows"
              legend={
                <ChartLegend
                  items={scoreSeries.map((s) => ({ name: s.name, color: s.color }))}
                />
              }
            >
              {scoreSeries.length ? (
                <LineChart series={scoreSeries} domain={[0, 100]} height={220} />
              ) : (
                <ChartEmpty />
              )}
            </ChartCard>

            <ChartCard
              title="Effective pay over time"
              subtitle="Monthly average, all reported domains"
              legend={
                <ChartLegend
                  items={paySeries.map((s) => ({ name: s.name, color: s.color }))}
                />
              }
            >
              {paySeries.length ? (
                <LineChart
                  series={paySeries}
                  height={220}
                  valuePrefix="$"
                  zeroBased
                  sampleLabel="pay reports"
                />
              ) : (
                <ChartEmpty />
              )}
            </ChartCard>
          </div>

          <ChartCard
            title="Task availability index"
            subtitle="Daily reports mapped to 0–100, last 14 days"
            legend={
              <ChartLegend
                items={availabilitySeries.map((s) => ({
                  name: s.name,
                  color: s.color,
                }))}
              />
            }
            footnote="100 means every report that day said tasks were plentiful; 0 means no tasks available."
          >
            {availabilitySeries.length ? (
              <LineChart
                series={availabilitySeries}
                domain={[0, 100]}
                height={200}
                sampleLabel="reports that day"
              />
            ) : (
              <ChartEmpty />
            )}
          </ChartCard>

          <section className="panel panel-pad">
            <h2 className="section-title">Reported pay by domain</h2>
            <div className="table-wrap mt-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    {sides.map(({ key, data }) => (
                      <th key={key}>{data!.company.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    new Set(
                      sides.flatMap(({ data }) =>
                        (data!.company.payByDomain ?? []).map((p) => p.domain),
                      ),
                    ),
                  ).map((domain) => (
                    <tr key={domain}>
                      <td className="font-medium">{domain}</td>
                      {sides.map(({ key, data }) => {
                        const row = (data!.company.payByDomain ?? []).find(
                          (p) => p.domain === domain,
                        );
                        return (
                          <td key={key} className="num">
                            {formatMoney(row?.effectiveRate)}
                            {row?.advertisedRate != null && (
                              <span className="ml-1.5 text-xs text-subtle">
                                of {formatMoney(row.advertisedRate)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[0.71875rem] text-[color:var(--subtle)]">
              Effective rate first, advertised rate second.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function DimensionTable({
  sides,
}: {
  sides: readonly { key: Side; data: Loaded | null }[];
}) {
  const keys = Object.keys(DIMENSION_LABELS);

  return (
    <ul className="divide-rows text-sm">
      {keys.map((key) => {
        const values = sides.map(({ data }) => {
          const dims = data?.trends?.dimensions;
          return dims ? dims[key as keyof typeof dims] : null;
        });
        const best =
          values.filter((v) => v != null).length > 1
            ? values.indexOf(Math.max(...values.filter((v): v is number => v != null)))
            : -1;

        return (
          <li key={key} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-muted">
              {DIMENSION_LABELS[key]}
            </span>
            {values.map((value, i) => (
              <span
                key={i}
                className="num w-12 text-right font-semibold"
                style={{
                  color:
                    best === i ? SIDE_COLORS[sides[i].key] : "var(--foreground)",
                }}
              >
                {value ?? "—"}
              </span>
            ))}
          </li>
        );
      })}
    </ul>
  );
}

export default function ComparePage({ initial }: { initial: ComparePageData }) {
  return (
    <Suspense
      fallback={
        <div className="container-page space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <CompareContent initial={initial} />
    </Suspense>
  );
}
