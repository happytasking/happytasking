"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { OpportunityCard as Card } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { OpportunityCard } from "@/components/taskmatch/OpportunityCard";
import { track } from "@/lib/track";
import { useSoftQuery } from "@/lib/useSoftQuery";
import {
  TASKMATCH_EMPTY_DESCRIPTION,
  TASKMATCH_EMPTY_TITLE,
  TASKMATCH_H1,
  TASKMATCH_TRUST_NOTE,
  isLiveCatalogOpportunity,
} from "@/lib/taskmatchLanding";

const SUPPORTING = [
  { href: "/companies", label: "Company directory" },
  { href: "/compare", label: "Compare companies" },
  { href: "/guides", label: "Guides" },
  { href: "/market", label: "Market" },
  { href: "/issues", label: "Issues" },
] as const;

export function TaskMatchLanding({
  opportunities,
  total,
}: {
  opportunities: Card[];
  total?: number;
}) {
  const { searchParams, setQuery } = useSoftQuery();
  const catalog = opportunities.filter(isLiveCatalogOpportunity);
  const country = searchParams.get("country") || "";
  const sort = searchParams.get("sort") || "newest";
  const remote = searchParams.get("remote") === "true";

  useEffect(() => {
    track("taskmatch_landing_viewed");
    if (catalog.length === 0) {
      track("taskmatch_empty_state_viewed");
    }
  }, [catalog.length]);

  return (
    <div className="space-y-8">
      <section className="panel panel-pad space-y-4">
        <p className="eyebrow">TaskMatch</p>
        <h1 className="page-title">{TASKMATCH_H1}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          TaskMatch combines independently sourced AI-work opportunities, your
          professional profile, and Happy Tasking company intelligence — so you
          can see whether a role is a fit, and whether the platform is worth
          your time.
        </p>
        <p className="text-sm text-muted">{TASKMATCH_TRUST_NOTE}</p>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Current opportunities</h2>
        {typeof total === "number" && total > 0 && (
          <p className="text-sm text-muted">
            {catalog.length} shown of {total} tracked active listings.
            Open jobs are not TaskPulse.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <label className="space-y-1" htmlFor="landing-country">
            <span className="label">Country</span>
            <select
              id="landing-country"
              className="select"
              value={country}
              onChange={(e) => setQuery({ country: e.target.value || null })}
            >
              <option value="">All / unspecified</option>
              <option value="BR">Brazil</option>
              <option value="US">United States</option>
            </select>
          </label>
          <label className="space-y-1" htmlFor="landing-sort">
            <span className="label">Sort</span>
            <select
              id="landing-sort"
              className="select"
              value={sort}
              onChange={(e) => setQuery({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="pay">Highest pay</option>
              <option value="recommended">Recommended</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm" htmlFor="landing-remote">
            <input
              id="landing-remote"
              type="checkbox"
              checked={remote}
              onChange={(e) =>
                setQuery({ remote: e.target.checked ? "true" : null })
              }
            />
            Remote
          </label>
        </div>
        <p className="text-xs text-muted">
          Remote does not automatically mean a country is eligible. Brazil
          results include explicitly eligible, worldwide, and unspecified
          listings.
        </p>
        {catalog.length > 0 ? (
          <>
            <p className="text-sm text-muted">
              Independently sourced listings. Sign in to see how they fit your
              profile.
            </p>
            {catalog.map((item) => (
              <OpportunityCard key={item.id} item={item} personalized={false} />
            ))}
          </>
        ) : (
          <EmptyState
            title={TASKMATCH_EMPTY_TITLE}
            description={TASKMATCH_EMPTY_DESCRIPTION}
          />
        )}
      </section>

      <section className="panel panel-pad space-y-4">
        <h2 className="section-title">Why TaskMatch is different</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4">
            <p className="eyebrow">Open opportunity</p>
            <p className="mt-1 font-semibold">Is the company recruiting?</p>
            <p className="mt-1 text-sm text-muted">
              A listing means a public recruiting signal for that role — not
              that tasks are flowing today.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4">
            <p className="eyebrow">Task availability</p>
            <p className="mt-1 font-semibold">
              Are contributors reporting available tasks?
            </p>
            <p className="mt-1 text-sm text-muted">
              Contributor task availability (TaskPulse) is community-reported
              and separate from whether a job is open.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4">
            <p className="eyebrow">Profile match</p>
            <p className="mt-1 font-semibold">Does the role fit you?</p>
            <p className="mt-1 text-sm text-muted">
              Skills, experience, language, country, and rate — estimated only
              after you add a professional profile.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4">
            <p className="eyebrow">Company intelligence</p>
            <p className="mt-1 font-semibold">
              What does the community report?
            </p>
            <p className="mt-1 text-sm text-muted">
              Pay, stability, payment reliability, and reputation when there is
              enough real evidence. Missing data is omitted, not shown as zero.
            </p>
          </div>
        </div>
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">How TaskMatch works</h2>
        <ol className="space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-foreground">1. Explore opportunities</span>
            {" — "}
            browse independently sourced listings when they exist.
          </li>
          <li>
            <span className="font-medium text-foreground">2. Understand the company</span>
            {" — "}
            read community intelligence before you apply.
          </li>
          <li>
            <span className="font-medium text-foreground">3. Build your professional profile</span>
            {" — "}
            skills, availability, and constraints stay private.
          </li>
          <li>
            <span className="font-medium text-foreground">4. See personalized matches</span>
            {" — "}
            estimated fit, not a job offer or a hiring decision.
          </li>
        </ol>
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">See matches for your skills</h2>
        <p className="text-sm text-muted">
          Optional. You can understand TaskMatch first — then personalize when
          you are ready. Know before you task.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/register"
            className="btn btn-accent min-h-11"
            onClick={() => track("taskmatch_personalize_clicked")}
          >
            Build your profile
          </Link>
          <Link href="/login" className="btn btn-secondary min-h-11">
            Log in
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Explore more</h2>
        <div className="flex flex-wrap gap-2">
          {SUPPORTING.map((link) => (
            <Link key={link.href} href={link.href} className="btn btn-secondary min-h-11">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
