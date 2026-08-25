import { humanize } from "@/lib/format";

type Props = {
  status?: string | null;
  trend?: "up" | "down" | "flat" | null;
  className?: string;
};

const tone: Record<string, string> = {
  HIGH: "bg-good-bg text-good",
  MODERATE: "bg-mid-bg text-mid",
  LOW: "bg-low-bg text-low",
  NO_TASKS: "bg-low-bg text-low",
};

const trendGlyph = {
  up: "↑",
  down: "↓",
  flat: "",
} as const;

export function AvailabilityPill({ status, trend, className = "" }: Props) {
  if (!status) {
    return <span className={`badge bg-demo-bg text-demo ${className}`}>No data</span>;
  }
  const label = status === "NO_TASKS" ? "No tasks" : humanize(status);
  const glyph = trend && trend !== "flat" ? trendGlyph[trend] : "";
  return (
    <span
      className={`badge ${tone[status] ?? "bg-demo-bg text-demo"} ${className}`}
      title={
        trend === "up"
          ? `${label}, rising vs previous week`
          : trend === "down"
            ? `${label}, falling vs previous week`
            : label
      }
    >
      {label}
      {glyph ? ` ${glyph}` : ""}
    </span>
  );
}
