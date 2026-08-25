"use client";

import {
  AVAILABILITY_COLORS,
  AVAILABILITY_LABELS,
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  ChartLegend,
  GroupedBarChart,
  LineChart,
  StackedBarChart,
  type StackedColumn,
} from "@/components/charts";
import type {
  AvailabilityDayPoint,
  PayTrendPoint,
  TrendPoint,
} from "@/lib/types";

const AVAILABILITY_KEYS = ["HIGH", "MODERATE", "LOW", "NO_TASKS"] as const;

function hasValues(points: { value: number | null }[]) {
  return points.some((p) => p.value != null);
}

export function ReputationTrendCard({
  taskScore,
  sentiment,
  title = "Reputation over time",
  subtitle = "Rolling 30-day windows, updated weekly",
}: {
  taskScore: TrendPoint[];
  sentiment: TrendPoint[];
  title?: string;
  subtitle?: string;
}) {
  const series = [
    {
      name: "TaskScore",
      color: CHART_COLORS.emerald,
      points: taskScore,
      area: true,
    },
    {
      name: "Worker sentiment",
      color: CHART_COLORS.blue,
      points: sentiment,
      dashed: true,
    },
  ];

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      legend={<ChartLegend items={series.map((s) => ({ name: s.name, color: s.color, dashed: s.dashed }))} />}
      footnote="Each point is the score as it would have been shown on that date, so a quiet week does not distort the line."
    >
      {hasValues(taskScore) || hasValues(sentiment) ? (
        <LineChart
          series={series}
          domain={[0, 100]}
          height={230}
          sampleLabel="reviews in window"
        />
      ) : (
        <ChartEmpty message="No reviews in the last 12 weeks" />
      )}
    </ChartCard>
  );
}

export function AvailabilityTrendCard({
  availability,
  title = "Task availability, last 14 days",
  subtitle = "What contributors reported each day",
}: {
  availability: AvailabilityDayPoint[];
  title?: string;
  subtitle?: string;
}) {
  const columns: StackedColumn[] = availability.map((day) => ({
    label: day.label,
    segments: AVAILABILITY_KEYS.map((key) => ({
      key,
      value: day.counts[key],
      color: AVAILABILITY_COLORS[key],
      label: AVAILABILITY_LABELS[key],
    })),
  }));

  const total = availability.reduce((sum, d) => sum + d.sampleSize, 0);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      legend={
        <ChartLegend
          items={AVAILABILITY_KEYS.map((key) => ({
            name: AVAILABILITY_LABELS[key],
            color: AVAILABILITY_COLORS[key],
          }))}
        />
      }
      footnote={`${total} availability reports in this window.`}
    >
      {total > 0 ? (
        <StackedBarChart columns={columns} height={190} />
      ) : (
        <ChartEmpty message="No availability reports yet" />
      )}
    </ChartCard>
  );
}

export function PayGapCard({
  pay,
  title = "Advertised vs effective pay",
  subtitle = "Monthly average across reported domains",
}: {
  pay: PayTrendPoint[];
  title?: string;
  subtitle?: string;
}) {
  const seriesNames = ["Advertised", "Effective"];
  const colors = [CHART_COLORS.slate, CHART_COLORS.emerald];
  const hasData = pay.some((p) => p.advertised != null || p.effective != null);

  const latest = [...pay].reverse().find((p) => p.advertised && p.effective);
  const gapPct =
    latest && latest.advertised && latest.effective
      ? Math.round((1 - latest.effective / latest.advertised) * 100)
      : null;

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      legend={
        <ChartLegend items={seriesNames.map((name, i) => ({ name, color: colors[i] }))} />
      }
      footnote={
        gapPct != null
          ? `Latest reported gap: effective pay runs about ${gapPct}% below advertised once unpaid time is counted.`
          : "Effective pay counts unpaid onboarding, waiting and rework time."
      }
    >
      {hasData ? (
        <GroupedBarChart
          data={pay.map((p) => ({
            label: p.label,
            values: [p.advertised, p.effective],
            meta: `${p.sampleSize} pay reports`,
          }))}
          seriesNames={seriesNames}
          colors={colors}
          height={215}
          valuePrefix="$"
          valueSuffix="/hr"
        />
      ) : (
        <ChartEmpty message="No pay reports yet" />
      )}
    </ChartCard>
  );
}

export function ReviewVolumeCard({ volume }: { volume: TrendPoint[] }) {
  const total = volume.reduce((sum, p) => sum + (p.value ?? 0), 0);

  return (
    <ChartCard
      title="Report volume"
      subtitle="Reviews submitted per week"
      footnote={`${total} reviews in the last 12 weeks.`}
    >
      {hasValues(volume) ? (
        <GroupedBarChart
          data={volume.map((p) => ({ label: p.label, values: [p.value] }))}
          seriesNames={["Reviews"]}
          colors={[CHART_COLORS.violet]}
          height={180}
        />
      ) : (
        <ChartEmpty message="No reviews yet" />
      )}
    </ChartCard>
  );
}
