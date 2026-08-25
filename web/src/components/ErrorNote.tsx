type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorNote({ message, onRetry }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[--radius-sm] border border-low/25 bg-low-bg px-4 py-3">
      <p className="text-sm text-low">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
