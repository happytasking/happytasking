"use client";

import { PublicDataError } from "@/components/PublicDataError";

export default function IssuesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title="Issues are temporarily unavailable"
      description="Public issue reports could not be loaded. This is a data-fetch failure, not an empty issues list."
      error={error}
      reset={reset}
    />
  );
}
