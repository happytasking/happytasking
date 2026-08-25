import { areaPath, linePath, type Point } from "./chartUtils";
import { rem } from "@/lib/scale";

type Props = {
  points: (number | null)[];
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
  ariaLabel?: string;
};

/**
 * Inline trend glyph for table rows and cards — no axes, no interaction.
 */
export default function Sparkline({
  points,
  width = 84,
  height = 26,
  color = "var(--chart-1)",
  area = true,
  ariaLabel,
}: Props) {
  // The viewBox carries the geometry, so rem dimensions scale the glyph with the
  // UI scale and keep it in proportion with the text it sits beside.
  const box = { width: rem(width), height: rem(height) };

  const values = points.filter((v): v is number => v != null);
  if (values.length < 2) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={box}
        aria-hidden="true"
      >
        <line
          x1={2}
          x2={width - 2}
          y1={height / 2}
          y2={height / 2}
          stroke="var(--chart-grid)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 3;
  const data: Point[] = points.map((v, i) => ({ label: String(i), value: v }));

  const x = (i: number) => pad + ((width - pad * 2) * i) / (points.length - 1);
  const y = (v: number) =>
    height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);

  const last = values[values.length - 1];
  const first = values[0];
  const lastIndex = points.reduce<number>((acc, v, i) => (v != null ? i : acc), 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        ariaLabel ??
        `Sparkline trending ${last > first ? "up" : last < first ? "down" : "flat"}`
      }
      style={{ ...box, overflow: "visible" }}
    >
      {area && (
        <path d={areaPath(data, x, y, height - pad)} fill={color} fillOpacity={0.12} />
      )}
      <path
        d={linePath(data, x, y)}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x(lastIndex)} cy={y(last)} r={2.25} fill={color} />
    </svg>
  );
}
