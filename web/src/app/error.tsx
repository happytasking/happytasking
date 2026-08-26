"use client";

import { PublicDataError } from "@/components/PublicDataError";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title="This page is temporarily unavailable"
      description="Something went wrong while rendering this page. This is a failure, not an empty result."
      error={error}
      reset={reset}
    />
  );
}
