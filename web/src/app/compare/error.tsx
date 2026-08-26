"use client";

import { PublicDataError } from "@/components/PublicDataError";

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title="Company comparison is temporarily unavailable"
      description="Public company data could not be loaded. This is a data-fetch failure, not an empty comparison."
      error={error}
      reset={reset}
    />
  );
}
