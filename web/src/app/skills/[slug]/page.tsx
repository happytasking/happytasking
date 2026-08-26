"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { TaskMatchList } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SkeletonCards } from "@/components/Skeleton";
import { OpportunityCard } from "@/components/taskmatch/OpportunityCard";
import { humanize } from "@/lib/format";

export default function SkillPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<TaskMatchList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<TaskMatchList>(`/taskmatch${qs({ skill: params.slug, limit: 10 })}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load"));
  }, [params.slug]);

  const label = humanize(params.slug.replace(/-/g, " "));

  return (
    <div className="container-page space-y-6">
      <div>
        <p className="eyebrow">Skill</p>
        <h1 className="page-title mt-1">{label}</h1>
        <p className="mt-2 text-sm text-muted">
          {user
            ? `Your ${label} matches across active opportunities.`
            : "Active opportunities that mention this skill. Log in for personalized fit."}
        </p>
      </div>
      {error && <ErrorNote message={error} />}
      {!data ? (
        <SkeletonCards count={2} />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No current opportunities"
          description="We don't have enough active listings for this skill yet."
          action={
            <Link href="/taskmatch" className="btn btn-secondary">
              Back to TaskMatch
            </Link>
          }
        />
      ) : (
        <section className="space-y-4">
          <h2 className="section-title">
            {user ? `Your ${label} matches` : `${label} opportunities`} ·{" "}
            {data.items.length}
          </h2>
          {data.items.map((item) => (
            <OpportunityCard key={item.id} item={item} personalized={Boolean(user)} />
          ))}
        </section>
      )}
    </div>
  );
}
