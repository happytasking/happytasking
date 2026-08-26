"use client";

import { PublicDataError } from "@/components/PublicDataError";

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title="Community is temporarily unavailable"
      description="Public discussions could not be loaded. This is a data-fetch failure, not an empty community."
      error={error}
      reset={reset}
    />
  );
}
