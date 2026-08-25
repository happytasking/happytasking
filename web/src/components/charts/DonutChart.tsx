"use client";

import { useState } from "react";
import { rem } from "@/lib/scale";

export type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  ariaLabel?: string;
};

function arc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };
  const end = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M${start.x.toFixed(2)},${start.y.toFixed(2)} A${radius},${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)},${end.y.toFixed(2)}`;
}

export default function DonutChart({
  slices,
  size = 168,
  thickness = 18,
  centerLabel,
  centerValue,
  ariaLabel,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((a, s) => a + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - thickness) / 2;
  const gap = total > 0 && slices.length > 1 ? 0.03 : 0;

  let angle = -Math.PI / 2;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          ariaLabel ??
          `Donut chart: ${slices.map((s) => `${s.label} ${s.value}`).join(", ")}`
        }
        // The viewBox carries the geometry, so rem dimensions scale the whole
        // drawing with the UI scale.
        style={{ flex: "none", width: rem(size), height: rem(size) }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--chart-grid)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          slices.map((slice, i) => {
            if (slice.value <= 0) return null;
            const sweep = (slice.value / total) * Math.PI * 2;
            const start = angle;
            const end = angle + Math.max(sweep - gap, 0.01);
            angle += sweep;
            return (
              <path
                key={slice.label}
                className="chart-fade"
                d={arc(cx, cy, radius, start, end)}
                stroke={slice.color}
                strokeWidth={hover === i ? thickness + 4 : thickness}
                strokeLinecap="round"
                fill="none"
                opacity={hover != null && hover !== i ? 0.4 : 1}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: "stroke-width 0.15s ease, opacity 0.15s ease" }}
              />
            );
          })}
        {(centerValue || centerLabel) && (
          <>
            <text
              x={cx}
              y={cy + (centerLabel ? 0 : 5)}
              textAnchor="middle"
              style={{
                fill: "var(--foreground)",
                fontSize: 22,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {centerValue}
            </text>
            {centerLabel && (
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                style={{ fill: "var(--subtle)", fontSize: 10.5, fontWeight: 600 }}
              >
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>

      <ul className="min-w-[8.75rem] flex-1 space-y-1.5">
        {slices.map((slice, i) => (
          <li
            key={slice.label}
            className="flex items-center gap-2 text-[0.8125rem]"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ opacity: hover != null && hover !== i ? 0.5 : 1 }}
          >
            <span className="chart-swatch" style={{ background: slice.color }} />
            <span className="truncate">{slice.label}</span>
            <span className="ml-auto num font-semibold">{slice.value}</span>
            <span className="num w-9 text-right text-[0.71875rem] muted">
              {total ? `${Math.round((slice.value / total) * 100)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
