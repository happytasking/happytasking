type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-demo-bg">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.25" stroke="var(--subtle)" strokeWidth="1.5" />
          <path d="M8 5v3.5" stroke="var(--subtle)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.9" fill="var(--subtle)" />
        </svg>
      </div>
      <h3 className="text-[0.9375rem] font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
