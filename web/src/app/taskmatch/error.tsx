"use client";

import { PublicDataError } from "@/components/PublicDataError";
import { TASKMATCH_ERROR_TITLE } from "@/lib/taskmatchLanding";

export default function TaskMatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title={TASKMATCH_ERROR_TITLE}
      description="Public opportunity listings could not be loaded. This is a data-fetch failure, not an empty TaskMatch catalog."
      error={error}
      reset={reset}
    />
  );
}
