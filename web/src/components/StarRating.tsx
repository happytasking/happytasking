type Props = {
  value: number | null | undefined;
  size?: "sm" | "md";
  label?: string;
};

export function StarRating({ value, size = "md", label = "Pay" }: Props) {
  if (value == null) {
    return <span className="text-sm text-subtle">—</span>;
  }
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  const cls = size === "sm" ? "text-[0.8125rem]" : "text-base";
  return (
    <span
      className={`inline-flex items-center gap-0.5 tracking-tight ${cls}`}
      title={`${label}: ${filled} of 5`}
      aria-label={`${label}: ${filled} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < filled ? "text-mid" : "text-subtle"}
        >
          {i < filled ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
