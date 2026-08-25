export type Point = { label: string; value: number | null; sampleSize?: number };

export type Series = {
  name: string;
  color: string;
  points: Point[];
  /** Draw a soft gradient under the line. */
  area?: boolean;
  dashed?: boolean;
};

export const CHART_COLORS = {
  emerald: "var(--chart-1)",
  blue: "var(--chart-2)",
  amber: "var(--chart-3)",
  violet: "var(--chart-4)",
  rose: "var(--chart-5)",
  slate: "var(--chart-6)",
} as const;

export const SERIES_PALETTE = [
  CHART_COLORS.emerald,
  CHART_COLORS.blue,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.rose,
  CHART_COLORS.slate,
];

export const AVAILABILITY_COLORS: Record<string, string> = {
  HIGH: "var(--chart-1)",
  MODERATE: "var(--chart-3)",
  LOW: "var(--chart-7)",
  NO_TASKS: "var(--chart-6)",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  HIGH: "High",
  MODERATE: "Moderate",
  LOW: "Low",
  NO_TASKS: "No tasks",
};

/** Nice rounded axis bounds so gridlines land on readable numbers. */
export function niceScale(min: number, max: number, ticks = 4) {
  if (min === max) {
    const pad = Math.abs(min) > 1 ? Math.abs(min) * 0.1 : 1;
    min -= pad;
    max += pad;
  }
  const range = max - min;
  const rawStep = range / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const stepMultiple = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = stepMultiple * magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const values: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    values.push(Math.round(v * 1e6) / 1e6);
  }
  return { min: niceMin, max: niceMax, step, ticks: values };
}

export function seriesBounds(series: Series[], opts?: { zeroBased?: boolean }) {
  const values = series
    .flatMap((s) => s.points.map((p) => p.value))
    .filter((v): v is number => v != null);
  if (!values.length) return niceScale(0, 100);
  const min = opts?.zeroBased ? 0 : Math.min(...values);
  const max = Math.max(...values);
  return niceScale(min, max);
}

/**
 * Builds a path across points, breaking the line wherever a value is missing so
 * gaps read as "no data" instead of an invented straight segment.
 */
export function linePath(
  points: Point[],
  x: (i: number) => number,
  y: (v: number) => number,
) {
  let d = "";
  let open = false;
  points.forEach((p, i) => {
    if (p.value == null) {
      open = false;
      return;
    }
    const cmd = open ? "L" : "M";
    d += `${cmd}${x(i).toFixed(2)},${y(p.value).toFixed(2)} `;
    open = true;
  });
  return d.trim();
}

export function areaPath(
  points: Point[],
  x: (i: number) => number,
  y: (v: number) => number,
  baseline: number,
) {
  const segments: string[] = [];
  let current: { i: number; value: number }[] = [];

  const flush = () => {
    if (current.length < 2) {
      current = [];
      return;
    }
    const head = current[0];
    const tail = current[current.length - 1];
    const line = current
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${x(p.i).toFixed(2)},${y(p.value).toFixed(2)}`)
      .join(" ");
    segments.push(
      `${line} L${x(tail.i).toFixed(2)},${baseline.toFixed(2)} L${x(head.i).toFixed(2)},${baseline.toFixed(2)} Z`,
    );
    current = [];
  };

  points.forEach((p, i) => {
    if (p.value == null) flush();
    else current.push({ i, value: p.value });
  });
  flush();

  return segments.join(" ");
}

/** Reduces label clutter on dense axes by keeping roughly `max` labels. */
export function labelStride(count: number, max = 6) {
  if (count <= max) return 1;
  return Math.ceil(count / max);
}

export function formatTick(value: number) {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 100) / 10}k`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Colours a sparkline by its own direction: green rising, red falling. */
export function trendColor(points?: (number | null)[] | null) {
  const values = (points ?? []).filter((v): v is number => v != null);
  if (values.length < 2) return CHART_COLORS.slate;
  const delta = values[values.length - 1] - values[0];
  if (delta > 1.5) return CHART_COLORS.emerald;
  if (delta < -1.5) return CHART_COLORS.rose;
  return CHART_COLORS.slate;
}

export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number,
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}
