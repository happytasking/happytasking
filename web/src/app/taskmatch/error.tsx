"use client";

import { PublicDataError } from "@/components/PublicDataError";

export default function TaskMatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title="TaskMatch is temporarily unavailable"
      description="Public opportunity listings could not be loaded. This is a data-fetch failure, not an empty TaskMatch catalog."
      error={error}
      reset={reset}
    />
  );
}
