import type { TaskScoreResult } from "@/lib/types";
import { formatPeriodLabel, humanize } from "@/lib/format";

type Confidence = TaskScoreResult["confidence"];

type Props = {
  confidence?: Confidence | null;
  sampleSize?: number;
  period?: string | null;
  className?: string;
};

const tone = {
  HIGH: { bar: "var(--good)", text: "text-good" },
  MEDIUM: { bar: "var(--mid)", text: "text-mid" },
  LOW: { bar: "var(--low)", text: "text-low" },
} as const;

/**
 * Statistical certainty behind a TaskScore — not a quality rating.
 * A score of 82 from 3 reports must not look as settled as 82 from 4,836.
 */
export function ContributorConfidence({
  confidence,
  sampleSize = 0,
  period,
  className = "",
}: Props) {
  const tier = confidence?.tier ?? "LOW";
  const score = confidence?.score ?? 0;
  const pct = Math.min(100, Math.max(0, score));
  const reports = sampleSize;
  const verified = confidence?.verifiedCount ?? 0;
  const countries = confidence?.countryCount ?? 0;

  return (
    <section className={className}>
      <p className="eyebrow">Contributor Confidence</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Not another rating. A statistical confidence indicator for this
        TaskScore.
      </p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[0.8125rem] text-muted">Confidence</span>
          <span className={`num text-[0.8125rem] font-semibold ${tone[tier].text}`}>
            {humanize(tier)}
          </span>
        </div>
        <div
          className="meter mt-1.5 h-2"
          role="meter"
          aria-label={`Contributor confidence ${score} out of 100, ${humanize(tier)}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <span style={{ width: `${pct}%`, background: tone[tier].bar }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
        <div>
          <dt className="text-xs text-subtle">Reports</dt>
          <dd className="num mt-0.5 font-semibold">{reports}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Verified</dt>
          <dd className="num mt-0.5 font-semibold">{verified}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Countries</dt>
          <dd className="num mt-0.5 font-semibold">{countries}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Window</dt>
          <dd className="mt-0.5 font-semibold">{formatPeriodLabel(period)}</dd>
        </div>
      </dl>
    </section>
  );
}
