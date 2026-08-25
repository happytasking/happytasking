import { Trend } from "./Trend";

type Props = {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat" | null;
  tone?: "good" | "mid" | "low" | "none";
  loading?: boolean;
};

const toneText = {
  good: "text-good",
  mid: "text-mid",
  low: "text-low",
  none: "text-foreground",
} as const;

export function StatCard({
  label,
  value,
  hint,
  trend,
  tone = "none",
  loading = false,
}: Props) {
  return (
    <div className="panel panel-pad">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        {loading ? (
          <span className="skeleton h-7 w-16" />
        ) : (
          <span className={`num text-[1.5rem] font-semibold ${toneText[tone]}`}>
            {value}
          </span>
        )}
        {trend && <Trend direction={trend} />}
      </div>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
