"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSoftQuery } from "@/lib/useSoftQuery";
import type { Skill, SkillGapResult, TaskMatchList } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SkeletonCards } from "@/components/Skeleton";
import { OpportunityCard } from "@/components/taskmatch/OpportunityCard";
import { ProfileStrength } from "@/components/taskmatch/ProfileStrength";
import { TaskMatchFilters } from "@/components/taskmatch/TaskMatchFilters";
import { TaskMatchLanding } from "@/components/taskmatch/TaskMatchLanding";
import { formatMoney } from "@/lib/format";
import { TASKMATCH_H1 } from "@/lib/taskmatchLanding";

function Dashboard() {
  const { searchParams, setQuery } = useSoftQuery();
  const [data, setData] = useState<TaskMatchList | null>(null);
  const [gaps, setGaps] = useState<SkillGapResult | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      domain: searchParams.get("domain") || "",
      skill: searchParams.get("skill") || "",
      company: searchParams.get("company") || "",
      country: searchParams.get("country") || "",
      workType: searchParams.get("workType") || "",
      q: searchParams.get("q") || "",
      remote: searchParams.get("remote") || "",
      includeUnspecified: searchParams.get("includeUnspecified") || "",
      pulse: searchParams.get("pulse") || "",
      sort: searchParams.get("sort") || "recommended",
      includeWorkedWith: searchParams.get("includeWorkedWith") || "true",
      minTaskScore: searchParams.get("minTaskScore") || "",
    }),
    [searchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api<TaskMatchList>(
        `/taskmatch${qs({
          domain: filters.domain || undefined,
          skill: filters.skill || undefined,
          company: filters.company || undefined,
          country: filters.country || undefined,
          workType: filters.workType || undefined,
          q: filters.q || undefined,
          remote: filters.remote || undefined,
          includeUnspecified: filters.includeUnspecified || undefined,
          pulse: filters.pulse || undefined,
          sort: filters.sort,
          includeWorkedWith: filters.includeWorkedWith,
          minTaskScore: filters.minTaskScore || undefined,
        })}`,
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load matches");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void api<Skill[]>("/companies/meta/skills")
      .then(setSkills)
      .catch(() => setSkills([]));
    void api<SkillGapResult>("/taskmatch/gaps")
      .then(setGaps)
      .catch(() => setGaps(null));
  }, []);

  const hasIntel = Boolean(data?.hasCommunityIntelligence);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">TaskMatch</p>
        <h1 className="page-title mt-1">{TASKMATCH_H1}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Two scores, kept separate: how well you fit the role, and how the
          opportunity looks from independent Happy Tasking intelligence.
        </p>
      </div>

      {data?.strength && (
        <ProfileStrength
          percent={data.strength.percent}
          items={data.strength.items}
        />
      )}

      <TaskMatchFilters
        shown={data?.items.length ?? 0}
        total={data?.total ?? data?.items.length ?? 0}
        facets={data?.facets}
        personalized
        hasIntel={hasIntel}
        extra={
          <details className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold">
              More filters
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1" htmlFor="taskmatch-skill">
                <span className="label">Skill</span>
                <select
                  id="taskmatch-skill"
                  className="select"
                  value={filters.skill}
                  onChange={(e) => setQuery({ skill: e.target.value || null })}
                >
                  <option value="">All skills</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              {hasIntel && (
                <label className="space-y-1" htmlFor="taskmatch-pulse">
                  <span className="label">Contributor task availability</span>
                  <select
                    id="taskmatch-pulse"
                    className="select"
                    value={filters.pulse}
                    onChange={(e) => setQuery({ pulse: e.target.value || null })}
                  >
                    <option value="">Any reported availability</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                    <option value="NO_TASKS">No tasks</option>
                  </select>
                </label>
              )}
              {hasIntel && (
                <label className="space-y-1" htmlFor="taskmatch-minscore">
                  <span className="label">Minimum TaskScore</span>
                  <select
                    id="taskmatch-minscore"
                    className="select"
                    value={filters.minTaskScore}
                    onChange={(e) =>
                      setQuery({ minTaskScore: e.target.value || null })
                    }
                  >
                    <option value="">Any</option>
                    <option value="60">60+</option>
                    <option value="70">70+</option>
                    <option value="80">80+</option>
                  </select>
                </label>
              )}
              <label className="flex items-end gap-2 pb-2 text-sm" htmlFor="taskmatch-worked">
                <input
                  id="taskmatch-worked"
                  type="checkbox"
                  checked={filters.includeWorkedWith === "true"}
                  onChange={(e) =>
                    setQuery({
                      includeWorkedWith: e.target.checked ? "true" : "false",
                    })
                  }
                />
                Include companies I have worked with
              </label>
            </div>
          </details>
        }
      />

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      {loading && !data ? (
        <SkeletonCards count={3} />
      ) : !data?.items.length ? (
        <EmptyState
          title="No strong matches yet."
          description="Improve your profile, or we may not have enough verified live openings in your domain yet."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/taskmatch/profile" className="btn btn-accent min-h-11">
                Improve your profile
              </Link>
              <Link href="/taskmatch/profile" className="btn btn-secondary min-h-11">
                Watch my skills
              </Link>
            </div>
          }
        />
      ) : (
        <section className="space-y-4">
          <h2 className="section-title">Best matches for you</h2>
          {data.items.map((item) => (
            <OpportunityCard key={item.id} item={item} personalized />
          ))}
        </section>
      )}

      {gaps?.suggestions.length ? (
        <section className="panel panel-pad space-y-3">
          <h2 className="section-title">What should I improve?</h2>
          <p className="text-sm text-muted">
            Suggestions come from gaps in current opportunities, not generic course
            lists.
          </p>
          <ol className="space-y-2">
            {gaps.suggestions.map((s, i) => (
              <li key={s.slug} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {i + 1}. {s.name}
                  </p>
                  <p className="text-muted">
                    Could improve {s.opportunities} current{" "}
                    {s.opportunities === 1 ? "match" : "matches"}
                    {s.averageMaxRate
                      ? ` · avg listed max ${formatMoney(s.averageMaxRate)}/h`
                      : ""}
                  </p>
                </div>
                <Link href={`/skills/${s.slug}`} className="text-accent">
                  View
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function TaskMatchPage({ initial }: { initial: TaskMatchList }) {
  const { user } = useAuth();
  if (user) return <Dashboard />;
  return (
    <TaskMatchLanding
      opportunities={initial.items}
      total={initial.total}
      facets={initial.facets}
    />
  );
}

export default function Page({ initial }: { initial: TaskMatchList }) {
  return (
    <div className="container-page">
      <Suspense fallback={<SkeletonCards count={2} />}>
        <TaskMatchPage initial={initial} />
      </Suspense>
    </div>
  );
}
