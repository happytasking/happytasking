import { formatScore, scoreTone } from "@/lib/format";

type Props = {
  label: string;
  value: number | null | undefined;
  /** 5 for raw review scores, 100 for aggregated 0–100 dimensions */
  max?: 5 | 100;
  suffix?: string;
};

const fillVar = {
  good: "var(--good)",
  mid: "var(--mid)",
  low: "var(--low)",
  none: "var(--border-strong)",
} as const;

export function ScoreBar({ label, value, max = 100, suffix }: Props) {
  const tone =
    max === 100
      ? scoreTone(value)
      : value == null
        ? "none"
        : value >= 4
          ? "good"
          : value >= 3
            ? "mid"
            : "low";

  const pct =
    value == null
      ? 0
      : max === 100
        ? Math.min(100, Math.max(0, value))
        : Math.min(100, Math.max(0, ((value - 1) / 4) * 100));

  const display =
    value == null
      ? "—"
      : `${formatScore(value, max === 5 ? 1 : 0)}${suffix ?? ""}`;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
      <span className="text-[0.8125rem] text-muted">{label}</span>
      <span className="num text-[0.8125rem] font-semibold">{display}</span>
      <div className="meter col-span-2">
        <span style={{ width: `${pct}%`, background: fillVar[tone] }} />
      </div>
    </div>
  );
}
