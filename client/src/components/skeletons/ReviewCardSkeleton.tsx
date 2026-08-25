export default function ReviewCardSkeleton() {
  return (
    <div className="border border-border rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-3/5 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
