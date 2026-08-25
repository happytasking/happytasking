import { scoreTone } from "@/lib/format";

type Props = {
  match: number | null | undefined;
  quality: number | null | undefined;
  size?: "sm" | "md";
};

const toneClass = {
  good: "text-good",
  mid: "text-mid",
  low: "text-low",
  none: "text-subtle",
} as const;

export function DualScore({ match, quality, size = "md" }: Props) {
  const num = size === "sm" ? "text-xl" : "text-3xl";
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-3 py-3">
        <p className="eyebrow">You → role</p>
        <p className={`num mt-1 font-semibold ${num} ${toneClass[scoreTone(match)]}`}>
          {match ?? "—"}
          {match != null && <span className="text-sm font-medium text-muted">%</span>}
        </p>
        <p className="mt-0.5 text-xs text-muted">Estimated fit</p>
      </div>
      <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-3 py-3">
        <p className="eyebrow">Role → you</p>
        <p className={`num mt-1 font-semibold ${num} ${toneClass[scoreTone(quality)]}`}>
          {quality ?? "—"}
          {quality != null && <span className="text-sm font-medium text-muted">%</span>}
        </p>
        <p className="mt-0.5 text-xs text-muted">Opportunity quality</p>
      </div>
    </div>
  );
}
