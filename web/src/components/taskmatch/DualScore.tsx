import { scoreTone } from "@/lib/format";

type Props = {
  match: number | null | undefined;
  quality: number | null | undefined;
  size?: "sm" | "md";
  showMatch?: boolean;
  showQuality?: boolean;
};

const toneClass = {
  good: "text-good",
  mid: "text-mid",
  low: "text-low",
  none: "text-subtle",
} as const;

export function DualScore({
  match,
  quality,
  size = "md",
  showMatch = true,
  showQuality = true,
}: Props) {
  const showM = showMatch && match != null;
  const showQ = showQuality && quality != null;
  if (!showM && !showQ) return null;

  const num = size === "sm" ? "text-xl" : "text-3xl";
  const cols = showM && showQ ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid gap-3 ${cols}`}>
      {showM && (
        <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-3 py-3">
          <p className="eyebrow">You → role</p>
          <p
            className={`num mt-1 font-semibold ${num} ${toneClass[scoreTone(match)]}`}
            aria-label={`Estimated fit ${match} percent`}
          >
            {match}
            <span className="text-sm font-medium text-muted">%</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">Estimated fit</p>
        </div>
      )}
      {showQ && (
        <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-3 py-3">
          <p className="eyebrow">Role → you</p>
          <p
            className={`num mt-1 font-semibold ${num} ${toneClass[scoreTone(quality)]}`}
            aria-label={`Opportunity quality ${quality} percent`}
          >
            {quality}
            <span className="text-sm font-medium text-muted">%</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">Company intelligence</p>
        </div>
      )}
    </div>
  );
}
