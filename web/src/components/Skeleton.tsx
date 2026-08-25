type Props = {
  className?: string;
  /** Use "span" when the placeholder sits inside a paragraph or other inline flow. */
  as?: "div" | "span";
};

export function Skeleton({ className = "h-4 w-full", as = "div" }: Props) {
  const Tag = as;
  return <Tag className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-rows" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-6 w-12" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({
  count = 4,
  className = "h-24",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </>
  );
}
