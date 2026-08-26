"use client";

import { PublicDataError } from "@/components/PublicDataError";

export default function MarketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicDataError
      title="Market intelligence is temporarily unavailable"
      description="Public market data could not be loaded. This is a data-fetch failure, not an empty market."
      error={error}
      reset={reset}
    />
  );
}
