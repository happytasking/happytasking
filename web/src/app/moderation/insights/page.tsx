"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSoftQuery } from "@/lib/useSoftQuery";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { ModeratorNav } from "@/components/ModeratorNav";
import { Skeleton, SkeletonCards } from "@/components/Skeleton";
import { StatCard } from "@/components/StatCard";
import {
  BarChart,
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  ChartLegend,
  DonutChart,
  LineChart,
} from "@/components/charts";
import {
  formatDateTime,
  formatRelativeTime,
} from "@/lib/format";

type Point = { label: string; value: number; key?: string };

type Insights = {
  rangeDays: number;
  includeDemo: boolean;
  generatedAt: string;
  totals: {
    visits: number;
    uniqueSessions: number;
    uniqueIps: number;
    signups: number;
    logins: number;
    liveVisits: number;
    onboarded: number;
    users: number;
  };
  previous: { visits: number; signups: number; logins: number };
  series: {
    visits: Point[];
    sessions: Point[];
    signups: Point[];
    logins: Point[];
  };
  countries: { label: string; code: string | null; value: number }[];
  pages: { label: string; value: number }[];
  recentVisits: {
    id: string;
    createdAt: string;
    path: string;
    referrer: string | null;
    ip: string;
    country: string | null;
    countryCode: string | null;
    region: string | null;
    city: string | null;
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string | null;
    } | null;
  }[];
  recentUsers: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    country: string | null;
    role: string;
    createdAt: string;
    lastLoginAt: string | null;
    lastSeenAt: string | null;
    lastLoginIp: string | null;
    lastLoginCountry: string | null;
    onboardingCompletedAt: string | null;
    activatedAt: string | null;
  }[];
};

function trend(current: number, previous: number): "up" | "down" | "flat" {
  if (previous === 0) return current > 0 ? "up" : "flat";
  const delta = (current - previous) / previous;
  if (delta > 0.05) return "up";
  if (delta < -0.05) return "down";
  return "flat";
}

function place(visit: Insights["recentVisits"][number]) {
  return [visit.city, visit.region, visit.country].filter(Boolean).join(", ") || "Unknown";
}

function InsightsContent() {
  const { user, loading: authLoading } = useAuth();
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";
  const { searchParams, setQuery } = useSoftQuery();
  const days = searchParams.get("days") || "14";
  const q = searchParams.get("q") || "";
  const includeDemo = searchParams.get("includeDemo") === "true";
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api<Insights>(
        `/analytics/insights${qs({
          days,
          q: q || undefined,
          includeDemo: includeDemo ? "true" : undefined,
        })}`,
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load insights");
    } finally {
      setLoading(false);
    }
  }, [days, q, includeDemo]);

  useEffect(() => {
    if (isModerator) void load();
    else setLoading(false);
  }, [isModerator, load]);

  if (authLoading) return <SkeletonCards count={4} />;
  if (!isModerator) {
    return (
      <EmptyState
        title="Moderator access only"
        description="Insights are limited to Happy Tasking moderators."
        action={
          <Link href="/login" className="btn btn-secondary">
            Log in
          </Link>
        }
      />
    );
  }

  const t = data?.totals;
  const hasTraffic = (t?.visits ?? 0) > 0;

  return (
    <div className="container-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Moderation</p>
          <h1 className="page-title mt-1">Insights</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            First-party traffic, registrations, and logins. Use this to see whether
            invited people visited or created an account. IP and city are
            approximate and stay inside the moderator tools.
          </p>
        </div>
        <ModeratorNav current="/moderation/insights" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="label">Range</span>
          <select
            className="select"
            value={days}
            onChange={(e) => setQuery({ days: e.target.value })}
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
        <form
          className="flex min-w-[16rem] flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery({ q: search || null });
          }}
        >
          <label className="min-w-0 flex-1 space-y-1">
            <span className="label">Find a person</span>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="email, username…"
            />
          </label>
          <button type="submit" className="btn btn-secondary mt-6 min-h-11">
            Search
          </button>
        </form>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={includeDemo}
            onChange={(e) =>
              setQuery({ includeDemo: e.target.checked ? "true" : null })
            }
          />
          Include demo accounts
        </label>
      </div>

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visits"
          value={t ? String(t.visits) : "—"}
          hint={`${t?.uniqueSessions ?? 0} sessions · ${t?.uniqueIps ?? 0} IPs`}
          trend={data ? trend(data.totals.visits, data.previous.visits) : undefined}
          loading={loading && !data}
        />
        <StatCard
          label="New registrations"
          value={t ? String(t.signups) : "—"}
          hint={`${t?.users ?? 0} accounts total`}
          trend={data ? trend(data.totals.signups, data.previous.signups) : undefined}
          loading={loading && !data}
        />
        <StatCard
          label="Logins"
          value={t ? String(t.logins) : "—"}
          hint={`${t?.liveVisits ?? 0} page views in last 30 min`}
          trend={data ? trend(data.totals.logins, data.previous.logins) : undefined}
          loading={loading && !data}
        />
        <StatCard
          label="Onboarded"
          value={t ? String(t.onboarded) : "—"}
          hint="Completed contributor onboarding"
          loading={loading && !data}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Traffic and signups"
          subtitle={`Daily counts · last ${days} days`}
          legend={
            <ChartLegend
              items={[
                { name: "Visits", color: CHART_COLORS.blue },
                { name: "Sessions", color: CHART_COLORS.emerald },
                { name: "Signups", color: CHART_COLORS.amber },
                { name: "Logins", color: CHART_COLORS.violet },
              ]}
            />
          }
        >
          {!data || (!hasTraffic && data.totals.signups === 0 && data.totals.logins === 0) ? (
            <ChartEmpty message={loading ? "Loading…" : "No traffic recorded yet"} />
          ) : (
            <LineChart
              zeroBased
              ariaLabel="Daily visits, sessions, signups, and logins"
              series={[
                {
                  name: "Visits",
                  color: CHART_COLORS.blue,
                  area: true,
                  points: data.series.visits,
                },
                {
                  name: "Sessions",
                  color: CHART_COLORS.emerald,
                  points: data.series.sessions,
                },
                {
                  name: "Signups",
                  color: CHART_COLORS.amber,
                  points: data.series.signups,
                },
                {
                  name: "Logins",
                  color: CHART_COLORS.violet,
                  dashed: true,
                  points: data.series.logins,
                },
              ]}
            />
          )}
        </ChartCard>

        <ChartCard title="Countries" subtitle="Approximate location from IP">
          {!data?.countries.length ? (
            <ChartEmpty message="No geolocation data yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-[8.5rem_1fr] sm:items-center">
              <DonutChart
                slices={data.countries.map((c, i) => ({
                  label: c.label,
                  value: c.value,
                  color: [
                    CHART_COLORS.emerald,
                    CHART_COLORS.blue,
                    CHART_COLORS.amber,
                    CHART_COLORS.violet,
                    CHART_COLORS.rose,
                    CHART_COLORS.slate,
                  ][i % 6],
                }))}
                centerLabel="Geo"
                centerValue={String(data.countries.reduce((s, c) => s + c.value, 0))}
              />
              <BarChart
                ariaLabel="Visits by country"
                data={data.countries.map((c) => ({
                  label: c.label,
                  value: c.value,
                }))}
              />
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Top pages" subtitle="Paths people opened">
        {!data?.pages.length ? (
          <ChartEmpty message="No page views yet" />
        ) : (
          <BarChart
            ariaLabel="Top pages"
            labelWidth={160}
            data={data.pages.map((p) => ({ label: p.label, value: p.value }))}
          />
        )}
      </ChartCard>

      <section className="space-y-3">
        <h2 className="section-title">Recent registrations</h2>
        <p className="text-sm text-muted">
          Newest accounts first. Last seen updates when they browse while logged in.
        </p>
        {!data ? (
          <Skeleton className="h-40 w-full" />
        ) : data.recentUsers.length === 0 ? (
          <div className="panel panel-pad text-sm text-muted">
            No matching accounts in this view.
          </div>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Person</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3 font-medium">Last seen</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.displayName || u.username}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatRelativeTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {u.lastLoginAt ? formatRelativeTime(u.lastLoginAt) : "Never"}
                      {u.lastLoginCountry ? (
                        <span className="block text-xs">
                          {u.lastLoginCountry}
                          {u.lastLoginIp ? ` · ${u.lastLoginIp}` : ""}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {u.lastSeenAt ? formatRelativeTime(u.lastSeenAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-surface-2 text-muted">
                        {u.onboardingCompletedAt ? "Onboarded" : "Registered"}
                      </span>
                      {u.activatedAt && (
                        <span className="badge ml-1 bg-accent-soft text-accent">
                          Activated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Recent visits</h2>
        <p className="text-sm text-muted">
          Includes anonymous visitors. Match a friend by city, IP, or the account
          they used if they logged in.
        </p>
        {!data ? (
          <Skeleton className="h-40 w-full" />
        ) : data.recentVisits.length === 0 ? (
          <div className="panel panel-pad text-sm text-muted">
            No page views recorded in this range yet. Open the site from another
            device to see the first rows appear.
          </div>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Page</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Visitor</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted">
                      {formatRelativeTime(v.createdAt)}
                      <span className="block text-xs">
                        {formatDateTime(v.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{v.path}</span>
                      {v.referrer && (
                        <span className="block max-w-[16rem] truncate text-xs text-muted">
                          from {v.referrer}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{place(v)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.ip}</td>
                    <td className="px-4 py-3 text-muted">
                      {v.user ? (
                        <span>
                          {v.user.displayName || v.user.username}
                          <span className="block text-xs">{v.user.email}</span>
                        </span>
                      ) : (
                        "Anonymous"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<SkeletonCards count={4} />}>
      <InsightsContent />
    </Suspense>
  );
}
