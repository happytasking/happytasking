const CompanyCardSkeleton = () => (
  <article className="rounded-xl bg-white px-8 py-6 shadow-sm animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-5">
        <div className="h-24 w-24 rounded-lg bg-gray-200" />
        <div className="space-y-3 pt-1">
          <div className="h-4 w-44 rounded bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-200" />
            <div className="h-3 w-28 rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-3 mt-5">
            <div className="h-3 w-7 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="flex min-h-24 flex-col items-end justify-between">
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="h-9 w-28 rounded-md bg-gray-200" />
      </div>
    </div>
  </article>
);

export default CompanyCardSkeleton;
