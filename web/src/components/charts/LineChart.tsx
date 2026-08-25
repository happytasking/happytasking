"use client";

import { useId, useMemo, useState } from "react";
import {
  areaPath,
  formatTick,
  labelStride,
  linePath,
  seriesBounds,
  type Series,
} from "./chartUtils";
import { useChartWidth } from "./useChartWidth";
import { useUiScale } from "./useUiScale";

type Props = {
  series: Series[];
  height?: number;
  /** Force the y axis to start at zero — better for counts than for indices. */
  zeroBased?: boolean;
  /** Clamp the axis to a known domain, e.g. [0, 100] for index scores. */
  domain?: [number, number];
  valueSuffix?: string;
  valuePrefix?: string;
  ariaLabel?: string;
  sampleLabel?: string;
};

export default function LineChart({
  series,
  height: baseHeight = 240,
  zeroBased = false,
  domain,
  valueSuffix = "",
  valuePrefix = "",
  ariaLabel,
  sampleLabel,
}: Props) {
  const gradientId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const { ref, width } = useChartWidth();
  const s = useUiScale();

  const height = Math.round(baseHeight * s);
  const pad = { top: 14 * s, right: 14 * s, bottom: 26 * s, left: 36 * s };
  const plotW = Math.max(40, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;
  const count = series.length ? Math.max(...series.map((s) => s.points.length)) : 0;

  const scale = useMemo(() => {
    if (domain) {
      const [min, max] = domain;
      const step = (max - min) / 4;
      return { min, max, step, ticks: [0, 1, 2, 3, 4].map((i) => min + step * i) };
    }
    return seriesBounds(series, { zeroBased });
  }, [series, zeroBased, domain]);

  const x = (i: number) =>
    pad.left + (count <= 1 ? plotW / 2 : (plotW * i) / (count - 1));
  const y = (v: number) =>
    pad.top + plotH - ((v - scale.min) / (scale.max - scale.min || 1)) * plotH;

  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const stride = labelStride(count, width < 420 ? 3 : width < 640 ? 5 : 7);

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const index = Math.round(((localX - pad.left) / (plotW || 1)) * (count - 1));
    setHover(Math.min(count - 1, Math.max(0, index)));
  };

  const hoverPoints =
    hover == null
      ? []
      : series
          .map((s) => ({ series: s, point: s.points[hover] }))
          .filter((entry) => entry.point && entry.point.value != null);

  return (
    <div className="relative" ref={ref}>
      {count > 0 && (
        <svg
          className="chart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={
            ariaLabel ??
            `Trend chart of ${series.map((s) => s.name).join(", ")} from ${labels[0]} to ${labels[labels.length - 1]}`
          }
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            {series.map((s, i) => (
              <linearGradient
                key={s.name}
                id={`${gradientId}-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {scale.ticks.map((tick) => (
            <g key={tick}>
              <line
                className="chart-grid-line"
                x1={pad.left}
                x2={width - pad.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className="chart-label"
                x={pad.left - 8}
                y={y(tick) + 3.5}
                textAnchor="end"
              >
                {formatTick(tick)}
              </text>
            </g>
          ))}

          {labels.map((label, i) =>
            // Keep the final label, and drop any strided label that would collide with it.
            i === count - 1 ||
            (i % stride === 0 && i <= count - 1 - Math.ceil(stride / 2)) ? (
              <text
                key={`${label}-${i}`}
                className="chart-label"
                x={x(i)}
                y={height - 8}
                textAnchor={i === 0 ? "start" : i === count - 1 ? "end" : "middle"}
              >
                {label}
              </text>
            ) : null,
          )}

          {hover != null && hoverPoints.length > 0 && (
            <line
              className="chart-crosshair"
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.top}
              y2={pad.top + plotH}
            />
          )}

          {series.map((s, i) => {
            const d = linePath(s.points, x, y);
            if (!d) return null;
            return (
              <g key={s.name}>
                {s.area && (
                  <path
                    className="chart-fade"
                    d={areaPath(s.points, x, y, pad.top + plotH)}
                    fill={`url(#${gradientId}-${i})`}
                  />
                )}
                <path
                  className="chart-line"
                  d={d}
                  stroke={s.color}
                  strokeDasharray={s.dashed ? "5 4" : undefined}
                />
                {s.points.map((p, pi) =>
                  p.value == null || hover !== pi ? null : (
                    <circle
                      key={`${s.name}-${pi}`}
                      cx={x(pi)}
                      cy={y(p.value)}
                      r={4}
                      fill="var(--surface)"
                      stroke={s.color}
                      strokeWidth={2.25}
                    />
                  ),
                )}
              </g>
            );
          })}
        </svg>
      )}

      {hover != null && hoverPoints.length > 0 && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.min(Math.max(x(hover), 60), width - 60),
            top: Math.min(...hoverPoints.map((h) => y(h.point.value as number))) - 10,
          }}
        >
          <div className="font-semibold">{labels[hover]}</div>
          {hoverPoints.map(({ series: s, point }) => (
            <div key={s.name} className="chart-tooltip-row">
              <span className="chart-tooltip-dot" style={{ background: s.color }} />
              <span className="opacity-75">{s.name}</span>
              <span className="ml-auto font-semibold">
                {valuePrefix}
                {point.value}
                {valueSuffix}
              </span>
            </div>
          ))}
          {sampleLabel && hoverPoints[0].point.sampleSize != null && (
            <div className="mt-0.5 text-[0.6875rem] opacity-70">
              {hoverPoints[0].point.sampleSize} {sampleLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
