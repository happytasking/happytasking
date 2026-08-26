"use client";

import Link from "next/link";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, qs } from "@/lib/api";
import { useSoftQuery } from "@/lib/useSoftQuery";
import type {
  CreateDiscussionInput,
  Discussion,
  Pagination,
} from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton, SkeletonCards } from "@/components/Skeleton";
import { authorName, UserAvatar } from "@/components/UserAvatar";
import { DISCUSSION_CATEGORIES, formatDate, humanize } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { ConfidentialityNote } from "@/components/ConfidentialityNote";
import { ContributeCta } from "@/components/ContributeCta";
import type { PaginatedList } from "@/lib/publicPages";

const SORT_TABS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most-discussed", label: "Most discussed" },
] as const;

function CommunityContent({ initial }: { initial: PaginatedList<Discussion> }) {
  const { searchParams, setQuery } = useSoftQuery();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<Discussion[]>(initial.items);
  const [pagination, setPagination] = useState<Pagination | null>(
    initial.pagination,
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasDataRef = useRef(initial.items.length > 0);
  const requestIdRef = useRef(0);
  const skipFirstLoad = useRef(true);
  const [form, setForm] = useState<CreateDiscussionInput>({
    title: "",
    body: "",
    category: "GENERAL",
    companySlug: searchParams.get("company") || "",
  });

  const filters = useMemo(
    () => ({
      sort: searchParams.get("sort") || "trending",
      company: searchParams.get("company") || "",
      page: Number(searchParams.get("page") || "1"),
    }),
    [searchParams],
  );

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isRefresh = hasDataRef.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api<{ items: Discussion[]; pagination: Pagination }>(
        `/community${qs({
          sort: filters.sort,
          company: filters.company,
          page: filters.page,
          limit: 20,
        })}`,
      );
      if (requestId !== requestIdRef.current) return;
      setItems(data.items);
      setPagination(data.pagination);
      hasDataRef.current = true;
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    void load();
  }, [load]);

  function update(next: Record<string, string>, opts?: { push?: boolean }) {
    setQuery(next, {
      push: opts?.push,
      resetPage: !("page" in next),
    });
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await api<Discussion>("/community", {
        method: "POST",
        body: {
          ...form,
          companySlug: form.companySlug || undefined,
        },
      });
      toast.success("Discussion posted");
      setShowForm(false);
      setForm({
        title: "",
        body: "",
        category: "GENERAL",
        companySlug: filters.company,
      });
      router.push(`/community/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    form.title.trim().length >= 5 && form.body.trim().length >= 10;

  return (
    <div className="container-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Discuss</p>
          <h1 className="page-title mt-1">Community</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Professional discussion for AI work — pay, availability, onboarding,
            and platforms. Share your experience, not confidential work.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent min-h-11"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Close form" : "New discussion"}
        </button>
      </div>

      <div className="tabs" role="tablist">
        {SORT_TABS.map((opt) => {
          const active = filters.sort === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              className="tab"
              data-active={active ? "true" : "false"}
              aria-current={active ? "page" : undefined}
              onClick={() => update({ sort: opt.value })}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="panel panel-pad space-y-4">
          <div>
            <h2 className="section-title">Start a discussion</h2>
            <ConfidentialityNote className="mt-3" />
          </div>
          {!user && (
            <p className="rounded-[--radius-sm] bg-surface-2 px-3 py-2 text-sm text-muted">
              You can post without an account, or{" "}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                log in
              </Link>{" "}
              to build reputation.
            </p>
          )}
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              minLength={5}
              placeholder="Pay consistency on coding projects"
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="select"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {DISCUSSION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {humanize(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              className="textarea"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
              minLength={10}
              placeholder="Share context without confidential details."
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary min-h-11"
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Posting…" : "Post discussion"}
          </button>
        </form>
      )}

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      <div
        className={`transition-opacity ${refreshing ? "opacity-60" : "opacity-100"}`}
        aria-busy={refreshing}
      >
      {loading && items.length === 0 ? (
        <div className="space-y-2.5" role="status" aria-label="Loading">
          <SkeletonCards count={5} className="h-[6.875rem]" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No discussions yet"
          description="Start a thread about pay, task availability, or platform experience."
          action={
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setShowForm(true)}
            >
              New discussion
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((d) => {
            const author = authorName(d.author);
            return (
              <Link
                key={d.id}
                href={`/community/${d.id}`}
                className="panel panel-hover flex gap-3 px-4 py-3.5"
              >
                <div className="flex w-11 shrink-0 flex-col items-center gap-2">
                  <UserAvatar name={author} size="sm" />
                  <div className="flex flex-col items-center rounded-md bg-surface-2 px-1.5 py-1">
                    <span
                      className="text-[0.5625rem] leading-none text-subtle"
                      aria-hidden="true"
                    >
                      ▲
                    </span>
                    <span className="num mt-0.5 text-[0.75rem] font-semibold">
                      {d.voteScore ?? 0}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-subtle">
                    <span className="font-semibold text-muted">{author}</span>
                    <span>· {formatDate(d.createdAt)}</span>
                    <DemoBadge show={!!d.isDemo} />
                  </div>
                  <h2 className="mt-1 text-[0.9375rem] font-semibold leading-snug">
                    {d.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                    {d.body}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-subtle">
                    <span className="chip">{humanize(d.category)}</span>
                    {d.company && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-muted">
                        <CompanyLogo
                          name={d.company.name}
                          logoUrl={d.company.logoUrl}
                          size="xs"
                          fit="mark"
                        />
                        {d.company.name}
                      </span>
                    )}
                    <span>· {d._count?.comments ?? 0} comments</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

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
              disabled={pagination.page <= 1 || refreshing}
              onClick={() =>
                update({ page: String(pagination.page - 1) }, { push: true })
              }
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary min-h-11"
              disabled={pagination.page >= pagination.pages || refreshing}
              onClick={() =>
                update({ page: String(pagination.page + 1) }, { push: true })
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
      </div>

      <section className="panel panel-pad">
        <h2 className="section-title">Help build Happy Tasking</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Happy Tasking grows through more than reviews. You can share
          experience, improve company data, report current task conditions,
          suggest features, contribute code, translate, and discuss methodology.
        </p>
        <div className="mt-4">
          <ContributeCta className="btn btn-accent min-h-11" label="See ways to contribute" />
        </div>
      </section>
    </div>
  );
}

export default function CommunityPage({
  initial,
}: {
  initial: PaginatedList<Discussion>;
}) {
  return (
    <Suspense
      fallback={
        <div className="container-page space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-48" />
          <SkeletonCards count={4} className="h-[4.75rem]" />
        </div>
      }
    >
      <CommunityContent initial={initial} />
    </Suspense>
  );
}
