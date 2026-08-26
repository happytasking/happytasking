"use client";

import { useEffect } from "react";
import Link from "next/link";

export function PublicDataError({
  title,
  description,
  error,
  reset,
  homeLabel = "Back home",
  homeHref = "/",
}: {
  title: string;
  description: string;
  error: Error & { digest?: string };
  reset: () => void;
  homeLabel?: string;
  homeHref?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page max-w-xl space-y-4">
      <h1 className="page-title">{title}</h1>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary min-h-11" onClick={reset}>
          Try again
        </button>
        <Link href={homeHref} className="btn btn-secondary min-h-11">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
