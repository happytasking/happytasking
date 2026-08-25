"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CompaniesError({
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
      <p className="eyebrow">Directory</p>
      <h1 className="page-title">Company directory is temporarily unavailable</h1>
      <p className="text-sm leading-relaxed text-muted">
        We could not load public company data. This is a data-fetch failure, not
        an empty directory.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary min-h-11" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-secondary min-h-11">
          Back home
        </Link>
      </div>
    </div>
  );
}
