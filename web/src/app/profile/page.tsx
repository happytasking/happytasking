"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/Skeleton";
import { SectionHeader } from "@/components/SectionHeader";
import { CompanyLogo } from "@/components/CompanyLogo";
import { QuickPulse } from "@/components/QuickPulse";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ContributorProfile, FieldVisibility } from "@/lib/types";

const VISIBILITY_HELP: Record<FieldVisibility, string> = {
  PRIVATE: "Only you",
  AGGREGATE_ONLY: "Private, used in community stats",
  PUBLIC: "Visible on your public profile",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await api<ContributorProfile>("/profile");
    setProfile(data);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.needsOnboarding) return;
    void load().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load profile");
    });
  }, [user, load]);

  async function setVisibility(key: keyof ContributorProfile["visibility"], value: FieldVisibility) {
    await api("/profile/visibility", {
      method: "PATCH",
      body: { [key]: value },
    });
    toast.success("Visibility updated");
    await load();
  }

  async function confirm(id: string, currentlyActive: boolean) {
    await api(`/profile/experiences/${id}/confirm`, {
      method: "POST",
      body: { currentlyActive },
    });
    toast.success(currentlyActive ? "Still working with them" : "Marked as previous");
    await load();
  }

  if (loading || !user || !profile) {
    return (
      <div
        className="container-page max-w-2xl space-y-4"
        role="status"
        aria-label="Loading"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        {error && <p className="text-sm text-[var(--low)]">{error}</p>}
      </div>
    );
  }

  const founding = profile.badges.find((b) => b.type === "FOUNDING_TASKER");
  const country = profile.countryCode
    ? profile.country
    : profile.country || "—";

  return (
    <div className="container-page max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Your AI work profile</p>
          <h1 className="page-title mt-1">
            {profile.displayName || profile.username}
          </h1>
          <p className="mt-1 text-sm text-muted">@{profile.username}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="chip">Verified Contributor</span>
            {founding && (
              <span className="chip chip-accent" title={founding.tooltip || ""}>
                🏅 Founding Tasker
              </span>
            )}
            {profile.isActivated && (
              <span className="chip">Activated</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary min-h-11"
          onClick={logout}
        >
          Log out
        </button>
      </div>

      <section className="panel panel-pad">
        <SectionHeader
          title={`Your AI Work Profile · ${profile.completion.percent}% complete`}
          description="A simple checklist — finish what you skipped whenever you like."
        />
        <ul className="mt-3 space-y-2 text-sm">
          {profile.completion.items.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              <span aria-hidden="true">{item.done ? "✓" : "○"}</span>
              <span className={item.done ? "" : "text-muted"}>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/taskmatch" className="btn btn-accent min-h-11">
            See my TaskMatches
          </Link>
          <Link href="/taskmatch/profile" className="btn btn-secondary min-h-11">
            Improve match profile
          </Link>
          {profile.completion.percent < 100 && (
            <Link href="/onboarding" className="btn btn-secondary min-h-11">
              Complete onboarding
            </Link>
          )}
        </div>
      </section>

      <section className="panel panel-pad grid gap-5 sm:grid-cols-2">
        <div>
          <p className="eyebrow">Email</p>
          <p className="mt-1.5 text-sm font-medium">{profile.email}</p>
          <p className="hint">Always private</p>
        </div>
        <div>
          <p className="eyebrow">Country</p>
          <p className="mt-1.5 text-sm font-medium">{country}</p>
        </div>
        <div>
          <p className="eyebrow">Contribution score</p>
          <p className="num mt-1.5 text-2xl font-semibold">
            {profile.contributionScore}
          </p>
        </div>
        <div>
          <p className="eyebrow">Member since</p>
          <p className="mt-1.5 text-sm font-medium">
            {formatDate(profile.createdAt)}
          </p>
        </div>
      </section>

      <section className="panel panel-pad space-y-3">
        <SectionHeader title="Domains" description="The kinds of AI work you do." />
        <div className="flex flex-wrap gap-2">
          {profile.domains.length === 0 && (
            <p className="text-sm text-muted">None yet.</p>
          )}
          {profile.domains.map((d) => (
            <span key={d.id} className="chip">
              {d.name}
            </span>
          ))}
        </div>
      </section>

      <section className="panel panel-pad space-y-3">
        <SectionHeader title="Skills" description="What you use or evaluate." />
        <div className="flex flex-wrap gap-2">
          {profile.skills.length === 0 && (
            <p className="text-sm text-muted">None yet.</p>
          )}
          {profile.skills.map((s) => (
            <span key={s.id} className="chip">
              {s.name}
            </span>
          ))}
        </div>
      </section>

      <section className="panel panel-pad space-y-4">
        <SectionHeader
          title="Platform experience"
          description="Hidden from your public profile by default. Aggregates can still use it."
        />
        {profile.experiences.length === 0 && (
          <p className="text-sm text-muted">
            Add platforms you&apos;ve worked with to personalize TaskPulse.
          </p>
        )}
        {profile.experiences.map((exp) => (
          <article
            key={exp.id}
            className="rounded-[var(--radius)] border border-border bg-surface-2 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <CompanyLogo
                name={exp.company.name}
                logoUrl={exp.company.logoUrl}
                size="md"
                fit="auto"
              />
              <div>
                <p className="font-semibold">{exp.company.name}</p>
                <p className="text-sm text-muted">
                  {exp.currentlyActive ? "Current" : "Previous"}
                  {exp.tenureLabel ? ` · ${exp.tenureLabel}` : ""}
                  {exp.domain ? ` · ${exp.domain.name}` : ""}
                </p>
              </div>
            </div>
            {exp.confirmTenure && (
              <div className="rounded-[var(--radius-sm)] bg-surface px-3 py-3">
                <p className="text-sm font-medium">
                  Still working with {exp.company.name}?
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="btn btn-accent min-h-11"
                    onClick={() => void confirm(exp.id, true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary min-h-11"
                    onClick={() => void confirm(exp.id, false)}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
            {exp.currentlyActive && (
              <QuickPulse
                companySlug={exp.company.slug}
                companyName={exp.company.name}
                domainId={exp.domain?.id}
                domainName={exp.domain?.name}
              />
            )}
            <Link
              href={`/reviews/new?company=${exp.company.slug}${
                exp.domain ? `&domain=${exp.domain.slug}` : ""
              }`}
              className="btn btn-secondary min-h-11"
            >
              Share your {exp.company.name} experience
            </Link>
          </article>
        ))}
      </section>

      <section className="panel panel-pad space-y-4">
        <SectionHeader
          title="What others can see"
          description="Email is always private. Company experience defaults to aggregate-only."
        />
        {(
          [
            ["country", "Country"],
            ["domains", "Domains"],
            ["skills", "Skills"],
            ["companyExperience", "Platform experience"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <p className="label">{label}</p>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {(["PRIVATE", "AGGREGATE_ONLY", "PUBLIC"] as FieldVisibility[]).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    className="choice-card min-h-11 text-[0.7rem] leading-tight"
                    data-selected={profile.visibility[key] === value}
                    onClick={() => void setVisibility(key, value)}
                  >
                    {VISIBILITY_HELP[value]}
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="panel panel-pad">
        <SectionHeader
          title="Contribute"
          description="Help the community with structured experiences and issue reports."
        />
        <div className="mt-1 flex flex-wrap gap-2">
          <Link href="/reviews/new" className="btn btn-accent min-h-11">
            Share experience
          </Link>
          <Link href="/issues/new" className="btn btn-secondary min-h-11">
            Report issue
          </Link>
          <Link href="/community" className="btn btn-secondary min-h-11">
            Join discussion
          </Link>
        </div>
      </section>
    </div>
  );
}
