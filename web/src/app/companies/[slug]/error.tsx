"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CompanyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page max-w-xl space-y-4">
      <h1 className="page-title">This company page is temporarily unavailable</h1>
      <p className="text-sm leading-relaxed text-muted">
        Public company information could not be loaded. This is a data-fetch
        failure, not a missing company.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary min-h-11" onClick={reset}>
          Try again
        </button>
        <Link href="/companies" className="btn btn-secondary min-h-11">
          Back to directory
        </Link>
      </div>
    </div>
  );
}
