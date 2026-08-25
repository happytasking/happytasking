import ReviewCardSkeleton from "./ReviewCardSkeleton";

const CompanyDetailsSkeleton = () => (
  <div className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
    <div className="flex items-start justify-between p-1">
      <div className="flex items-start gap-5">
        <div className="h-24 w-24 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="space-y-3 pt-1">
          <div className="h-5 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="h-3 w-7 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-7">
        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>

    {/* Divider */}
    <div className="my-5 border-b border-border" />

    {/* Result count */}
    <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mx-5 mb-5" />

    {/* Review skeletons */}
    <div className="flex flex-col gap-4 px-1">
      <ReviewCardSkeleton />
      <ReviewCardSkeleton />
      <ReviewCardSkeleton />
    </div>
  </div>
);

export default CompanyDetailsSkeleton;
