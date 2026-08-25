"use client";

import { useState } from "react";
import { polarPoint } from "./chartUtils";
import { useChartWidth } from "./useChartWidth";
import { useUiScale } from "./useUiScale";

export type RadarSeries = {
  name: string;
  color: string;
  values: (number | null)[];
};

type Props = {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  height?: number;
  ariaLabel?: string;
};

export default function RadarChart({
  axes,
  series,
  max = 100,
  height: baseHeight = 320,
  ariaLabel,
}: Props) {
  const { ref, width } = useChartWidth(420);
  const [hover, setHover] = useState<number | null>(null);
  const s = useUiScale();

  const height = Math.round(baseHeight * s);
  // Average glyph width of the axis labels, which are sized in rem by .chart-label.
  const charW = 5.8 * s;

  // Side labels grow outward from the chart, so the ring has to leave room for the
  // longest one rather than the label being truncated to fit a fixed radius.
  const longestLabel = Math.max(...axes.map((a) => a.length));
  const labelRoom = Math.min(84 * s, longestLabel * charW + 6 * s);
  const radius = Math.max(
    50,
    Math.min(height / 2 - 24 * s, width / 2 - 14 * s - labelRoom),
  );
  const chartHeight = Math.round(radius * 2 + 56 * s);
  const cx = width / 2;
  const cy = chartHeight / 2;
  const rings = [0.25, 0.5, 0.75, 1];

  const sideRoom = width / 2 - (radius + 14 * s);
  const maxChars = Math.max(6, Math.floor(sideRoom / charW));

  const pointFor = (value: number | null, index: number) =>
    polarPoint(cx, cy, ((value ?? 0) / max) * radius, index, axes.length);

  const polygonFor = (values: (number | null)[]) =>
    values
      .map((value, i) => {
        const p = pointFor(value, i);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <div className="relative" ref={ref}>
      <svg
        className="chart-svg"
        width={width}
        height={chartHeight}
        viewBox={`0 0 ${width} ${chartHeight}`}
        role="img"
        aria-label={
          ariaLabel ??
          `Radar chart comparing ${series.map((s) => s.name).join(" and ")} across ${axes.join(", ")}`
        }
      >
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={axes
              .map((_, i) => {
                const p = polarPoint(cx, cy, radius * ring, i, axes.length);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(" ")}
            fill={ring === 1 ? "var(--surface-2)" : "none"}
            className="chart-grid-line"
          />
        ))}

        {axes.map((axis, i) => {
          const outer = polarPoint(cx, cy, radius, i, axes.length);
          const labelPoint = polarPoint(cx, cy, radius + 16 * s, i, axes.length);
          const anchor =
            Math.abs(labelPoint.x - cx) < 12 * s
              ? "middle"
              : labelPoint.x > cx
                ? "start"
                : "end";
          const short =
            anchor !== "middle" && axis.length > maxChars
              ? `${axis.slice(0, maxChars - 1)}…`
              : axis;

          return (
            <g
              key={axis}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <line
                className="chart-grid-line"
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
              />
              <text
                className="chart-label"
                x={labelPoint.x}
                y={labelPoint.y + 3.5 * s}
                textAnchor={anchor}
                style={{
                  fill: hover === i ? "var(--foreground)" : "var(--chart-axis)",
                }}
              >
                {short}
                {short !== axis && <title>{axis}</title>}
              </text>
            </g>
          );
        })}

        {series.map((s) => (
          <g key={s.name} className="chart-fade">
            <polygon
              points={polygonFor(s.values)}
              fill={s.color}
              fillOpacity={series.length > 1 ? 0.12 : 0.16}
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {s.values.map((value, i) => {
              if (value == null) return null;
              const p = pointFor(value, i);
              return (
                <circle
                  key={`${s.name}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={hover === i ? 4 : 2.5}
                  fill="var(--surface)"
                  stroke={s.color}
                  strokeWidth={2}
                />
              );
            })}
          </g>
        ))}

        {/* Invisible hit targets keep hover reachable near each vertex. */}
        {axes.map((axis, i) => {
          const p = polarPoint(cx, cy, radius * 0.8, i, axes.length);
          return (
            <circle
              key={`hit-${axis}`}
              cx={p.x}
              cy={p.y}
              r={22}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {hover != null && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.min(Math.max(cx, 80), width - 80),
            top: 8,
          }}
        >
          <div className="font-semibold">{axes[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="chart-tooltip-row">
              <span className="chart-tooltip-dot" style={{ background: s.color }} />
              <span className="opacity-75">{s.name}</span>
              <span className="ml-auto font-semibold">
                {s.values[hover] == null ? "—" : s.values[hover]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
