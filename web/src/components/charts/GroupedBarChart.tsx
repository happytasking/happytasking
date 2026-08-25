"use client";

import { useState } from "react";
import { formatTick, labelStride, niceScale } from "./chartUtils";
import { useChartWidth } from "./useChartWidth";
import { useUiScale } from "./useUiScale";

export type GroupedDatum = {
  label: string;
  values: (number | null)[];
  meta?: string;
};

type Props = {
  data: GroupedDatum[];
  seriesNames: string[];
  colors: string[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  ariaLabel?: string;
};

export default function GroupedBarChart({
  data,
  seriesNames,
  colors,
  height: baseHeight = 220,
  valuePrefix = "",
  valueSuffix = "",
  ariaLabel,
}: Props) {
  const { ref, width } = useChartWidth();
  const [hover, setHover] = useState<number | null>(null);
  const s = useUiScale();

  const height = Math.round(baseHeight * s);
  const pad = { top: 12 * s, right: 10 * s, bottom: 26 * s, left: 38 * s };
  const plotH = height - pad.top - pad.bottom;
  const plotW = Math.max(40, width - pad.left - pad.right);
  const slot = plotW / Math.max(1, data.length);

  const values = data
    .flatMap((d) => d.values)
    .filter((v): v is number => v != null);
  const scale = niceScale(0, values.length ? Math.max(...values) : 1, 4);

  const y = (v: number) => pad.top + plotH - (v / (scale.max || 1)) * plotH;
  const groupW = Math.min(46 * s, slot - 10 * s);
  const barW = Math.max(4, (groupW - 4) / seriesNames.length);
  const stride = labelStride(data.length, Math.max(3, Math.floor(width / 64)));

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.floor((event.clientX - rect.left - pad.left) / (slot || 1));
    setHover(Math.min(data.length - 1, Math.max(0, index)));
  };

  return (
    <div className="relative" ref={ref}>
      <svg
        className="chart-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel ?? `Grouped bar chart comparing ${seriesNames.join(" and ")}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
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

        {data.map((group, gi) => {
          const cx = pad.left + slot * gi + slot / 2;
          const dim = hover != null && hover !== gi;
          return (
            <g key={`${group.label}-${gi}`}>
              {hover === gi && (
                <rect
                  x={cx - slot / 2}
                  y={pad.top}
                  width={slot}
                  height={plotH}
                  fill="var(--surface-2)"
                />
              )}
              {group.values.map((value, si) => {
                if (value == null) return null;
                const barX = cx - groupW / 2 + 2 + si * barW;
                const barY = y(value);
                return (
                  <rect
                    key={si}
                    className={`chart-bar chart-rise${dim ? " chart-bar-dim" : ""}`}
                    x={barX}
                    y={barY}
                    width={barW - 2}
                    height={Math.max(1, pad.top + plotH - barY)}
                    rx={2}
                    fill={colors[si % colors.length]}
                    style={{ animationDelay: `${gi * 30}ms` }}
                  />
                );
              })}
              {(gi === data.length - 1 ||
                (gi % stride === 0 &&
                  gi <= data.length - 1 - Math.ceil(stride / 2))) && (
                <text
                  className="chart-label"
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                >
                  {group.label}
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
              Math.max(pad.left + slot * hover + slot / 2, 72),
              width - 72,
            ),
            top: pad.top,
          }}
        >
          <div className="font-semibold">{data[hover].label}</div>
          {seriesNames.map((name, si) => (
            <div key={name} className="chart-tooltip-row">
              <span
                className="chart-tooltip-dot"
                style={{ background: colors[si % colors.length] }}
              />
              <span className="opacity-75">{name}</span>
              <span className="ml-auto font-semibold">
                {data[hover].values[si] == null
                  ? "—"
                  : `${valuePrefix}${data[hover].values[si]}${valueSuffix}`}
              </span>
            </div>
          ))}
          {data[hover].meta && (
            <div className="mt-0.5 text-[0.6875rem] opacity-70">{data[hover].meta}</div>
          )}
        </div>
      )}
    </div>
  );
}
