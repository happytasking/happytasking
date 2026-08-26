"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import type { Pagination, Review } from "@/lib/types";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SkeletonCards } from "@/components/Skeleton";
import { formatDate } from "@/lib/format";

const DIM_CHIPS: { key: keyof Review; label: string }[] = [
  { key: "paySatisfaction", label: "Pay" },
  { key: "paymentReliability", label: "Reliability" },
  { key: "taskAvailability", label: "Availability" },
  { key: "projectStability", label: "Stability" },
  { key: "reviewerFairness", label: "Fairness" },
  { key: "guidelineClarity", label: "Guidelines" },
  { key: "supportQuality", label: "Support" },
  { key: "transparency", label: "Transparency" },
];

export function CompanyReviewList({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ items: Review[]; pagination: Pagination }>(
        `/reviews/company/${slug}${qs({ page, limit: 20 })}`,
      );
      setReviews(data.items);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [slug, page]);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <ErrorNote message={error} onRetry={() => void load()} />;
  }

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading reviews">
        <SkeletonCards count={4} className="h-40" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Be the first to share a structured experience for this company."
        action={
          <Link href={`/reviews/new?company=${slug}`} className="btn btn-accent">
            Write a review
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Structured contributor experiences — no confidential work.
      </p>
      <div className="space-y-3">
        {reviews.map((r) => (
          <article key={r.id} className="panel panel-pad">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[1.0625rem] font-semibold leading-snug">
                    {r.title}
                  </h3>
                  <DemoBadge show={!!r.isDemo} />
                </div>
                <p className="mt-1.5 text-xs text-subtle">
                  <span className="font-medium text-muted">{r.authorLabel}</span>
                  {r.domain ? ` · ${r.domain.name}` : ""} ·{" "}
                  {formatDate(r.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="badge bg-demo-bg text-demo num">
                  {r.overallExperience}/5
                </span>
                {r.wouldWorkAgain ? (
                  <span className="badge bg-good-bg text-good">
                    Would work again
                  </span>
                ) : (
                  <span className="badge bg-low-bg text-low">
                    Would not return
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {r.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {DIM_CHIPS.map((dim) => {
                const value = r[dim.key];
                if (typeof value !== "number") return null;
                return (
                  <span key={dim.key} className="chip">
                    {dim.label}{" "}
                    <span className="num text-foreground">{value}</span>
                  </span>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            Page <span className="num">{pagination.page}</span> of{" "}
            <span className="num">{pagination.pages}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary min-h-11"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary min-h-11"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
