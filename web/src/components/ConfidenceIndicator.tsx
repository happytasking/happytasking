type Props = {
  score?: number;
  tier?: "LOW" | "MEDIUM" | "HIGH";
  sampleSize?: number;
  insufficient?: boolean;
  className?: string;
};

const tone = {
  HIGH: "bg-good-bg text-good",
  MEDIUM: "bg-mid-bg text-mid",
  LOW: "bg-low-bg text-low",
} as const;

export function ConfidenceIndicator({
  score,
  tier,
  sampleSize,
  insufficient,
  className = "",
}: Props) {
  if (insufficient || (sampleSize != null && sampleSize < 5)) {
    return (
      <span
        className={`badge bg-demo-bg text-demo ${className}`}
        title="Fewer than 5 public reports in this window"
      >
        Insufficient data
      </span>
    );
  }
  if (!tier) return null;
  return (
    <span
      className={`badge ${tone[tier]} ${className}`}
      title={`Confidence ${score ?? "—"}/100`}
    >
      {tier === "HIGH" ? "High" : tier === "MEDIUM" ? "Medium" : "Low"} confidence
    </span>
  );
}
