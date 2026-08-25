"use client";

import { useState } from "react";
import { useChartWidth } from "./useChartWidth";
import { useUiScale } from "./useUiScale";

export type BarDatum = {
  label: string;
  value: number | null;
  color?: string;
  meta?: string;
  href?: string;
  highlight?: boolean;
};

type Props = {
  data: BarDatum[];
  valuePrefix?: string;
  valueSuffix?: string;
  /** Width reserved for the category labels on the left. */
  labelWidth?: number;
  barHeight?: number;
  gap?: number;
  max?: number;
  ariaLabel?: string;
  formatValue?: (value: number) => string;
};

export default function BarChart({
  data,
  valuePrefix = "",
  valueSuffix = "",
  labelWidth: baseLabelWidth = 120,
  barHeight: baseBarHeight = 22,
  gap: baseGap = 10,
  max,
  ariaLabel,
  formatValue,
}: Props) {
  const { ref, width } = useChartWidth();
  const [hover, setHover] = useState<number | null>(null);
  const s = useUiScale();

  const labelWidth = baseLabelWidth * s;
  const barHeight = baseBarHeight * s;
  const gap = baseGap * s;
  const labelSize = 11.5 * s;
  const baseline = 4 * s;

  const rows = data.filter((d) => d.value != null);
  const valueWidth = 56 * s;
  const trackLeft = labelWidth + 8 * s;
  const trackWidth = Math.max(40, width - trackLeft - valueWidth);
  const height = data.length * (barHeight + gap);
  const upper = max ?? Math.max(...rows.map((d) => d.value as number), 1);

  const show = (value: number) =>
    `${valuePrefix}${formatValue ? formatValue(value) : value}${valueSuffix}`;

  // Roughly 6.2px per character at the 11.5px label size. Both scale together, so
  // the character budget is computed from the authored width.
  const maxChars = Math.max(8, Math.floor(baseLabelWidth / 6.2));

  return (
    <div ref={ref}>
      <svg
        className="chart-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          ariaLabel ??
          `Bar chart: ${rows.map((d) => `${d.label} ${show(d.value as number)}`).join(", ")}`
        }
      >
        {data.map((d, i) => {
          const y = i * (barHeight + gap);
          const value = d.value;
          const barW = value == null ? 0 : Math.max(2, (value / upper) * trackWidth);
          const color = d.color ?? (d.highlight ? "var(--chart-2)" : "var(--chart-1)");
          const dim = hover != null && hover !== i;

          return (
            <g
              key={d.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <text
                x={labelWidth}
                y={y + barHeight / 2 + baseline}
                textAnchor="end"
                className="chart-label"
                style={{
                  fill: dim ? "var(--chart-axis)" : "var(--foreground)",
                  fontSize: labelSize,
                  fontWeight: d.highlight ? 700 : 600,
                }}
              >
                {d.label.length > maxChars
                  ? `${d.label.slice(0, maxChars - 1)}…`
                  : d.label}
                <title>{d.label}</title>
              </text>

              <rect
                x={trackLeft}
                y={y + 2 * s}
                width={trackWidth}
                height={barHeight - 4 * s}
                rx={4}
                fill="var(--chart-grid)"
              />

              {value == null ? (
                <text
                  x={trackLeft + 6 * s}
                  y={y + barHeight / 2 + baseline}
                  className="chart-label"
                >
                  No data
                </text>
              ) : (
                <rect
                  className={`chart-bar${dim ? " chart-bar-dim" : ""}`}
                  x={trackLeft}
                  y={y + 2 * s}
                  width={barW}
                  height={barHeight - 4 * s}
                  rx={4}
                  fill={color}
                />
              )}

              <text
                x={width}
                y={y + barHeight / 2 + baseline}
                textAnchor="end"
                className="chart-value-label"
                style={{ fill: dim ? "var(--subtle)" : "var(--foreground)" }}
              >
                {value == null ? "—" : show(value)}
              </text>

              {d.meta && hover === i && (
                <title>{`${d.label}: ${show(value ?? 0)} — ${d.meta}`}</title>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
