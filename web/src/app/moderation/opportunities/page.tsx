"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { ModeratorNav } from "@/components/ModeratorNav";
import { SkeletonRows } from "@/components/Skeleton";
import { formatDate, humanize } from "@/lib/format";

type AdminOpp = {
  id: string;
  slug: string;
  title: string;
  status: string;
  sourceType: string;
  isDemo: boolean;
  lastVerifiedAt: string | null;
  company: { name: string; slug: string };
};

export default function AdminOpportunitiesPage() {
  const { user, loading } = useAuth();
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";
  const [items, setItems] = useState<AdminOpp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await api<{ items: AdminOpp[] }>("/taskmatch/admin/opportunities");
    setItems(data.items);
  }, []);

  useEffect(() => {
    if (isModerator) {
      void load().catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load"),
      );
    }
  }, [isModerator, load]);

  async function verify(id: string) {
    await api(`/taskmatch/admin/opportunities/${id}/verify`, { method: "POST" });
    toast.success("Verified");
    await load();
  }

  async function close(id: string) {
    await api(`/taskmatch/admin/opportunities/${id}/close`, { method: "POST" });
    toast.success("Marked closed");
    await load();
  }

  if (loading) return <SkeletonRows rows={4} />;
  if (!isModerator) {
    return (
      <EmptyState
        title="Moderator access only"
        description="Opportunity management is limited to Happy Tasking moderators."
      />
    );
  }

  return (
    <div className="container-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
        <Link href="/moderation" className="text-sm font-semibold text-accent">
          ← Triage
        </Link>
        <p className="eyebrow mt-3">Moderation</p>
        <h1 className="page-title mt-1">Opportunities</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Add and verify public listings. Do not paste confidential or internal
          opportunities.
        </p>
        </div>
        <ModeratorNav current="/moderation/opportunities" />
      </div>

      {error && <ErrorNote message={error} onRetry={() => void load()} />}

      <form
        className="panel panel-pad grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setBusy(true);
          void api("/taskmatch/admin/opportunities", {
            method: "POST",
            body: {
              companySlug: form.get("companySlug"),
              title: form.get("title"),
              description: form.get("description"),
              sourceUrl: form.get("sourceUrl") || null,
              sourceType: "PUBLIC_LISTING",
              applicationUrl: form.get("applicationUrl") || null,
              minRate: form.get("minRate") ? Number(form.get("minRate")) : null,
              maxRate: form.get("maxRate") ? Number(form.get("maxRate")) : null,
              isDemo: form.get("isDemo") === "on",
              domainSlugs: String(form.get("domains") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              skillSlugs: String(form.get("skills") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((slug) => ({ slug, required: true })),
            },
          })
            .then(() => {
              toast.success("Opportunity added");
              (e.target as HTMLFormElement).reset();
              return load();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed"))
            .finally(() => setBusy(false));
        }}
      >
        <label className="space-y-1">
          <span className="label">Company slug</span>
          <input name="companySlug" className="input" required placeholder="mercor" />
        </label>
        <label className="space-y-1">
          <span className="label">Title</span>
          <input name="title" className="input" required />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="label">Public description</span>
          <textarea name="description" className="input min-h-20" />
        </label>
        <label className="space-y-1">
          <span className="label">Public source URL</span>
          <input name="sourceUrl" className="input" type="url" />
        </label>
        <label className="space-y-1">
          <span className="label">Application URL</span>
          <input name="applicationUrl" className="input" type="url" />
        </label>
        <label className="space-y-1">
          <span className="label">Min rate</span>
          <input name="minRate" className="input" type="number" />
        </label>
        <label className="space-y-1">
          <span className="label">Max rate</span>
          <input name="maxRate" className="input" type="number" />
        </label>
        <label className="space-y-1">
          <span className="label">Domain slugs</span>
          <input name="domains" className="input" placeholder="coding, generalist" />
        </label>
        <label className="space-y-1">
          <span className="label">Skill slugs</span>
          <input name="skills" className="input" placeholder="python, typescript" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input name="isDemo" type="checkbox" defaultChecked />
          DEMO listing
        </label>
        <button type="submit" className="btn btn-accent min-h-11 sm:col-span-2" disabled={busy}>
          {busy ? "Saving…" : "Add opportunity"}
        </button>
      </form>

      <div className="panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Opportunity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/taskmatch/opportunities/${item.slug}`}
                      className="font-medium hover:text-accent"
                    >
                      {item.company.name} · {item.title}
                    </Link>
                    <DemoBadge show={item.isDemo} />
                  </div>
                  <p className="text-xs text-muted">{humanize(item.sourceType)}</p>
                </td>
                <td className="px-4 py-3">{humanize(item.status)}</td>
                <td className="px-4 py-3">{formatDate(item.lastVerifiedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => void verify(item.id)}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void close(item.id)}
                    >
                      Close
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
