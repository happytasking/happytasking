import CompanyCardSkeleton from "./CompanyCardSkeleton";

const CompanyListSkeleton = ({ count = 3 }) => (
  <div className="space-y-6 mt-10">
    <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
    <div className="mt-2 flex flex-col gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default CompanyListSkeleton;
