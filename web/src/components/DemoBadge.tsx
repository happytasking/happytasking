type Props = {
  show?: boolean;
  className?: string;
};

export function DemoBadge({ show = true, className = "" }: Props) {
  if (!show) return null;
  return (
    <span
      className={`badge bg-demo-bg text-demo ${className}`}
      title="Illustrative demo data — not production metrics"
    >
      DEMO
    </span>
  );
}
