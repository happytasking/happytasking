"use client";

import { useState } from "react";
import { labelStride } from "./chartUtils";
import { useChartWidth } from "./useChartWidth";
import { useUiScale } from "./useUiScale";

export type StackedColumn = {
  label: string;
  segments: { key: string; value: number; color: string; label: string }[];
};

type Props = {
  columns: StackedColumn[];
  height?: number;
  /** Render each column as a share of its own total instead of raw counts. */
  normalize?: boolean;
  ariaLabel?: string;
  unitLabel?: string;
};

export default function StackedBarChart({
  columns,
  height: baseHeight = 200,
  normalize = false,
  ariaLabel,
  unitLabel = "reports",
}: Props) {
  const { ref, width } = useChartWidth();
  const [hover, setHover] = useState<number | null>(null);
  const s = useUiScale();

  const height = Math.round(baseHeight * s);
  const pad = { top: 10 * s, right: 6 * s, bottom: 24 * s, left: 6 * s };
  const plotH = height - pad.top - pad.bottom;
  const plotW = Math.max(40, width - pad.left - pad.right);
  const slot = plotW / Math.max(1, columns.length);
  const barW = Math.min(34 * s, Math.max(6, slot - 6 * s));

  const totals = columns.map((c) => c.segments.reduce((a, s) => a + s.value, 0));
  const upper = normalize ? 1 : Math.max(...totals, 1);
  const stride = labelStride(columns.length, width < 420 ? 4 : 7);

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.floor((event.clientX - rect.left - pad.left) / (slot || 1));
    setHover(Math.min(columns.length - 1, Math.max(0, index)));
  };

  return (
    <div className="relative" ref={ref}>
      <svg
        className="chart-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel ?? "Stacked bar chart of daily report composition"}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <line
          className="chart-axis-line"
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + plotH}
          y2={pad.top + plotH}
        />

        {columns.map((column, i) => {
          const total = totals[i];
          const cx = pad.left + slot * i + slot / 2;
          let cursor = pad.top + plotH;
          const dim = hover != null && hover !== i;

          return (
            <g key={`${column.label}-${i}`}>
              {hover === i && (
                <rect
                  x={cx - slot / 2}
                  y={pad.top}
                  width={slot}
                  height={plotH}
                  fill="var(--surface-2)"
                />
              )}
              {total === 0 ? (
                <rect
                  x={cx - barW / 2}
                  y={pad.top + plotH - 3}
                  width={barW}
                  height={3}
                  rx={1.5}
                  fill="var(--chart-grid)"
                />
              ) : (
                column.segments.map((segment) => {
                  if (segment.value <= 0) return null;
                  const share = normalize ? segment.value / total : segment.value;
                  const segH = (share / upper) * plotH;
                  cursor -= segH;
                  return (
                    <rect
                      key={segment.key}
                      className={`chart-bar chart-rise${dim ? " chart-bar-dim" : ""}`}
                      x={cx - barW / 2}
                      y={cursor}
                      width={barW}
                      height={Math.max(1, segH)}
                      fill={segment.color}
                      style={{ animationDelay: `${i * 18}ms` }}
                    />
                  );
                })
              )}

              {(i === columns.length - 1 ||
                (i % stride === 0 &&
                  i <= columns.length - 1 - Math.ceil(stride / 2))) && (
                <text
                  className="chart-label"
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                >
                  {column.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hover != null && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.min(
              Math.max(pad.left + slot * hover + slot / 2, 70),
              width - 70,
            ),
            top: pad.top,
          }}
        >
          <div className="font-semibold">{columns[hover].label}</div>
          {columns[hover].segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <div key={s.key} className="chart-tooltip-row">
                <span className="chart-tooltip-dot" style={{ background: s.color }} />
                <span className="opacity-75">{s.label}</span>
                <span className="ml-auto font-semibold">{s.value}</span>
              </div>
            ))}
          <div className="mt-0.5 text-[0.6875rem] opacity-70">
            {totals[hover]} {unitLabel}
          </div>
        </div>
      )}
    </div>
  );
}
