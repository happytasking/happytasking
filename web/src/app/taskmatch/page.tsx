"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSoftQuery } from "@/lib/useSoftQuery";
import type { Domain, Skill, SkillGapResult, TaskMatchList } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SkeletonCards } from "@/components/Skeleton";
import { OpportunityCard } from "@/components/taskmatch/OpportunityCard";
import { ProfileStrength } from "@/components/taskmatch/ProfileStrength";
import { formatMoney } from "@/lib/format";

function Landing() {
  return (
    <div className="space-y-8">
      <section className="panel panel-pad space-y-4">
        <p className="eyebrow">TaskMatch</p>
        <h1 className="page-title">One profile. Better AI-work matches.</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Find where your AI skills fit best. TaskMatch estimates how well you
          fit an opportunity — and, separately, whether that opportunity looks
          worth pursuing using independent Happy Tasking intelligence.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4">
            <p className="eyebrow">You → role</p>
            <p className="mt-1 font-semibold">Am I a good fit for this?</p>
            <p className="mt-1 text-sm text-muted">
              Skills, experience, language, country, availability, and rate
              expectations.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4">
            <p className="eyebrow">Role → you</p>
            <p className="mt-1 font-semibold">Is this a good fit for me?</p>
            <p className="mt-1 text-sm text-muted">
              TaskScore, TaskPulse, pay, stability, and resolution — company-level
              community data.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted">
          These are estimated matches, not job offers. Happy Tasking does not
          control company hiring decisions.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/register" className="btn btn-accent min-h-11">
            Build your profile
          </Link>
          <Link href="/login" className="btn btn-secondary min-h-11">
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}

function Dashboard() {
  const { searchParams, setQuery } = useSoftQuery();
  const [data, setData] = useState<TaskMatchList | null>(null);
  const [gaps, setGaps] = useState<SkillGapResult | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      domain: searchParams.get("domain") || "",
      skill: searchParams.get("skill") || "",
      company: searchParams.get("company") || "",
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
    void api<Domain[]>("/companies/meta/domains")
      .then(setDomains)
      .catch(() => setDomains([]));
    void api<Skill[]>("/companies/meta/skills")
      .then(setSkills)
      .catch(() => setSkills([]));
    void api<SkillGapResult>("/taskmatch/gaps")
      .then(setGaps)
      .catch(() => setGaps(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">TaskMatch</p>
        <h1 className="page-title mt-1">Find the AI work that fits you.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Two scores, kept separate: how well you fit the role, and how attractive
          the opportunity looks from Happy Tasking intelligence.
        </p>
      </div>

      {data?.strength && (
        <ProfileStrength
          percent={data.strength.percent}
          items={data.strength.items}
        />
      )}

      <section className="panel panel-pad grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1">
          <span className="label">Domain</span>
          <select
            className="select"
            value={filters.domain}
            onChange={(e) => setQuery({ domain: e.target.value || null, page: null })}
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Skill</span>
          <select
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
        <label className="space-y-1">
          <span className="label">Sort</span>
          <select
            className="select"
            value={filters.sort}
            onChange={(e) => setQuery({ sort: e.target.value })}
          >
            <option value="recommended">Recommended</option>
            <option value="match">Best match</option>
            <option value="quality">Best opportunity quality</option>
            <option value="pay">Highest pay</option>
            <option value="taskscore">Best TaskScore</option>
            <option value="verified">Recently verified</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">TaskPulse</span>
          <select
            className="select"
            value={filters.pulse}
            onChange={(e) => setQuery({ pulse: e.target.value || null })}
          >
            <option value="">Any availability</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
            <option value="NO_TASKS">No tasks</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Minimum TaskScore</span>
          <select
            className="select"
            value={filters.minTaskScore}
            onChange={(e) => setQuery({ minTaskScore: e.target.value || null })}
          >
            <option value="">Any</option>
            <option value="60">60+</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filters.includeWorkedWith === "true"}
            onChange={(e) =>
              setQuery({ includeWorkedWith: e.target.checked ? "true" : "false" })
            }
          />
          Include companies I have worked with
        </label>
      </section>

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      {loading && !data ? (
        <SkeletonCards count={3} />
      ) : !data?.items.length ? (
        <EmptyState
          title="No strong matches yet."
          description="Improve your profile, or we may not have enough active opportunities in your domain yet."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/taskmatch/profile" className="btn btn-accent">
                Improve your profile
              </Link>
              <Link href="/taskmatch/profile" className="btn btn-secondary">
                Watch my skills
              </Link>
            </div>
          }
        />
      ) : (
        <section className="space-y-4">
          <h2 className="section-title">Best matches for you</h2>
          {data.items.map((item) => (
            <OpportunityCard key={item.id} item={item} />
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

function TaskMatchPage() {
  const { user, loading } = useAuth();
  if (loading) return <SkeletonCards count={2} />;
  return user ? <Dashboard /> : <Landing />;
}

export default function Page() {
  return (
    <div className="container-page">
      <Suspense fallback={<SkeletonCards count={2} />}>
        <TaskMatchPage />
      </Suspense>
    </div>
  );
}
