import { formatScore, scoreMood, scoreTone } from "@/lib/format";

const toneText = {
  good: "text-good",
  mid: "text-mid",
  low: "text-low",
  none: "text-subtle",
} as const;

const tonePill = {
  good: "bg-good-bg text-good",
  mid: "bg-mid-bg text-mid",
  low: "bg-low-bg text-low",
  none: "bg-demo-bg text-demo",
} as const;

const toneStroke = {
  good: "var(--good)",
  mid: "var(--mid)",
  low: "var(--low)",
  none: "var(--border-strong)",
} as const;

type Props = {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  sampleSize?: number;
  period?: string;
  showMeta?: boolean;
  /** Shows a mood face beside the number, for scannable at-a-glance sentiment. */
  mood?: boolean;
};

export function TaskScoreBadge({
  score,
  size = "md",
  sampleSize,
  period,
  showMeta = false,
  mood = false,
}: Props) {
  const tone = scoreTone(score);

  if (size === "lg") {
    const pct = score == null ? 0 : Math.min(100, Math.max(0, score));
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    return (
      <div className="flex items-center gap-4">
        <div className="relative h-[6.5rem] w-[6.5rem] shrink-0">
          <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90">
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="none"
              stroke="#eceef2"
              strokeWidth="8"
            />
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="none"
              stroke={toneStroke[tone]}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`num text-[1.75rem] font-semibold ${toneText[tone]}`}>
              {formatScore(score)}
            </span>
            <span className="text-[0.625rem] font-semibold tracking-wide text-subtle">
              / 100
            </span>
          </div>
        </div>
        {showMeta && (
          <div className="text-sm">
            <p className="eyebrow">TaskScore</p>
            <p className="mt-1 text-muted">
              {sampleSize ?? 0} reports
              {period ? ` · last ${period.replace("d", " days")}` : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  const sizeClass =
    size === "sm"
      ? "min-w-[2.5rem] px-1.5 py-0.5 text-[0.8125rem]"
      : "min-w-[3rem] px-2 py-1 text-[0.9375rem]";

  const face = mood ? scoreMood(score) : null;

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`num inline-flex items-center justify-center rounded-md font-semibold ${sizeClass} ${tonePill[tone]}`}
          title="TaskScore 0–100"
        >
          {formatScore(score)}
        </span>
        {face?.emoji && (
          <span
            role="img"
            aria-label={face.label}
            title={`${face.label} · TaskScore ${formatScore(score)}/100`}
            className={size === "sm" ? "text-base" : "text-lg"}
          >
            {face.emoji}
          </span>
        )}
      </span>
      {showMeta && (
        <span className="text-[0.6875rem] text-subtle">
          n={sampleSize ?? 0}
          {period ? ` · ${period}` : ""}
        </span>
      )}
    </span>
  );
}
