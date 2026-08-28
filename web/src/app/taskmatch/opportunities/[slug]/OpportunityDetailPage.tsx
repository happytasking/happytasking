"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { OpportunityDetail } from "@/lib/types";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { ScoreBar } from "@/components/ScoreBar";
import { Skeleton } from "@/components/Skeleton";
import { DualScore } from "@/components/taskmatch/DualScore";
import { formatDate, formatMoney, formatRelativeTime, humanize } from "@/lib/format";
import { track } from "@/lib/track";

const JOURNEY = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "QUALIFIED",
  "MATCHED",
  "WORKING",
  "REJECTED",
  "WITHDRAWN",
] as const;

function stars(n?: number | null) {
  if (n == null) return "—";
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

export default function OpportunityPage({
  initial,
}: {
  initial?: OpportunityDetail | null;
}) {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<OpportunityDetail | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItem(await api<OpportunityDetail>(`/taskmatch/opportunities/${params.slug}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load opportunity");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleSave() {
    if (!item) return;
    if (item.saved) {
      await api(`/taskmatch/save/${item.slug}`, { method: "DELETE" });
      toast.success("Removed from saved");
    } else {
      await api(`/taskmatch/save/${item.slug}`, { method: "POST" });
      toast.success("Saved");
    }
    await load();
  }

  async function setStatus(status: string) {
    if (!item) return;
    await api(`/taskmatch/status/${item.slug}`, {
      method: "POST",
      body: { status },
    });
    toast.success("Application status updated");
    await load();
  }

  if (loading && !item) {
    return (
      <div className="container-page space-y-4" role="status">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container-page space-y-4">
        {error && <ErrorNote message={error} onRetry={() => void load()} />}
        <EmptyState
          title="Opportunity not found"
          description="It may have been closed or the link is outdated."
          action={
            <Link href="/taskmatch" className="btn btn-secondary">
              Back to TaskMatch
            </Link>
          }
        />
      </div>
    );
  }

  const pay =
    item.minRate != null || item.maxRate != null
      ? `${formatMoney(item.minRate ?? item.maxRate, item.currency)}${
          item.maxRate != null && item.minRate != null && item.maxRate !== item.minRate
            ? `–${formatMoney(item.maxRate, item.currency)}`
            : ""
        }/h`
      : "Not listed";
  const matches = (item.candidateMatch?.reasons ?? []).filter((r) => r.kind === "match");
  const gaps = (item.candidateMatch?.reasons ?? []).filter((r) => r.kind === "gap");

  return (
    <div className="container-page max-w-3xl space-y-6">
      <Link href="/taskmatch" className="text-sm font-semibold text-accent">
        ← TaskMatch
      </Link>

      <header className="space-y-3">
        <div className="flex items-start gap-3">
          <CompanyLogo
            name={item.company.name}
            logoUrl={item.company.logoUrl}
            size="lg"
            fit="auto"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/companies/${item.company.slug}`} className="text-sm font-semibold">
                {item.company.name}
              </Link>
              <DemoBadge show={item.isDemo} />
              {item.featured && (
                <span className="badge bg-demo-bg text-demo">Featured</span>
              )}
            </div>
            <h1 className="page-title mt-1">{item.title}</h1>
            {item.candidateMatch && (
              <p className="mt-1 text-sm text-muted">{item.recommendationLabel}</p>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted">{item.description}</p>
      </header>

      <DualScore
        match={item.candidateMatch?.score}
        quality={item.opportunityQuality.score}
        showMatch={item.candidateMatch?.score != null}
        showQuality={
          !item.opportunityQuality.insufficient &&
          item.opportunityQuality.score != null
        }
      />

      {item.candidateMatch && (
        <p className="text-xs text-muted">
          Match confidence {item.confidence.toLowerCase()}. These are estimated
          scores, not a guarantee of screening or acceptance.
        </p>
      )}

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Your match</h2>
        {(item.candidateMatch?.dimensions ?? []).map((d) => (
          <ScoreBar key={d.key} label={d.label} value={d.score} />
        ))}
        {!item.candidateMatch && (
          <p className="text-sm text-muted">
            <Link href="/login" className="text-accent">
              Log in
            </Link>{" "}
            to see how this opportunity fits your profile.
          </p>
        )}
        {matches.length > 0 && (
          <div>
            <p className="eyebrow">Why you match</p>
            <ul className="mt-2 space-y-1 text-sm">
              {matches.map((r) => (
                <li key={r.text}>✓ {r.text}</li>
              ))}
            </ul>
          </div>
        )}
        {gaps.length > 0 && (
          <div>
            <p className="eyebrow">Potential gaps</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {gaps.map((r) => (
                <li key={r.text}>△ {r.text}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Opportunity quality</h2>
        {item.opportunityQuality.insufficient ? (
          <p className="text-sm text-muted">
            Limited community data. Not enough data yet to score this opportunity.
          </p>
        ) : (
          (item.opportunityQuality.dimensions ?? []).map((d) => (
            <ScoreBar key={d.key} label={d.label} value={d.score} />
          ))
        )}
        <p className="text-xs text-muted">Company-level community data</p>
        <div className="flex flex-wrap gap-3 text-sm text-muted">
          <span>
            Contributor task availability{" "}
            {item.pulse.availability ? (
              <AvailabilityPill
                status={item.pulse.availability}
                trend={item.pulse.trend}
              />
            ) : (
              <span>No data</span>
            )}
          </span>
          <span>
            TaskScore{" "}
            <span className="num font-semibold text-foreground">
              {item.taskScore ?? "No data"}
            </span>
          </span>
        </div>
        <Link href={`/companies/${item.company.slug}`} className="text-sm font-semibold text-accent">
          Company reputation
        </Link>
      </section>

      <section className="panel panel-pad space-y-2 text-sm">
        <h2 className="section-title">Requirements</h2>
        <p>
          Skills:{" "}
          {item.skills.map((s) => `${s.name}${s.required ? "" : " (preferred)"}`).join(", ") ||
            "—"}
        </p>
        <p>
          Experience:{" "}
          {item.experienceYearsMin != null
            ? `${item.experienceYearsMin}+ years`
            : "Not specified"}
        </p>
        <p>
          Languages:{" "}
          {item.languageRequirements.length
            ? item.languageRequirements.join(", ").toUpperCase()
            : "Not specified"}
        </p>
        <p>
          Countries:{" "}
          {item.countryRestrictions.length
            ? item.countryRestrictions.join(", ")
            : "Open / not specified"}
        </p>
        <p>
          Workload:{" "}
          {item.weeklyHoursMin != null || item.weeklyHoursMax != null
            ? `${item.weeklyHoursMin ?? "?"}–${item.weeklyHoursMax ?? "?"} h/week`
            : "Not specified"}
        </p>
        <p>Compensation: {pay}</p>
        <p>Remote: {humanize(item.remoteType)}</p>
      </section>

      {item.readiness && (
        <section className="panel panel-pad space-y-3">
          <h2 className="section-title">Your preparation</h2>
          {item.readiness.have.length > 0 && (
            <div>
              <p className="eyebrow">You already have</p>
              <ul className="mt-2 space-y-1 text-sm">
                {item.readiness.have.map((t) => (
                  <li key={t}>✓ {t}</li>
                ))}
              </ul>
            </div>
          )}
          {item.readiness.before.length > 0 && (
            <div>
              <p className="eyebrow">Before applying</p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {item.readiness.before.map((t) => (
                  <li key={t}>△ {t}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-muted">
            Estimated readiness{" "}
            <span className="num font-semibold text-foreground">
              {item.readiness.estimatedReadiness ?? "—"}%
            </span>
            . Advisory only.
          </p>
        </section>
      )}

      <section id="how-to-apply" className="panel panel-pad space-y-3">
        <h2 className="section-title">How to apply to {item.company.name}</h2>
        {item.guide?.officialSummary && (
          <div>
            <p className="eyebrow">Official / public information</p>
            <p className="mt-1 text-sm text-muted">{item.guide.officialSummary}</p>
          </div>
        )}
        {item.guide?.communitySummary && (
          <div>
            <p className="eyebrow">Community-reported experience</p>
            <p className="mt-1 text-sm text-muted">{item.guide.communitySummary}</p>
          </div>
        )}
        <ol className="space-y-2 text-sm">
          {(item.guide?.steps ?? []).map((step, i) => (
            <li key={`${step.title}-${i}`}>
              <span className="font-medium">
                {i + 1}. {step.title}
              </span>
              <p className="text-xs text-muted">Source: {step.source}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <span>Estimated process time {item.guide?.estimatedTime || "—"}</span>
          <span>Difficulty {stars(item.guide?.difficulty)}</span>
        </div>
        {item.applicationUrl && (
          <>
            {item.referral?.used && item.referral.disclosure && (
              <p className="text-sm text-muted">{item.referral.disclosure}</p>
            )}
            <p className="text-xs text-muted">
              Commercial relationships do not influence Happy Tasking&apos;s
              independent company intelligence.
            </p>
            <a
            href={item.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent min-h-11"
            onClick={() => {
              track(
                item.referral?.used
                  ? "referral_apply_clicked"
                  : "opportunity_apply_clicked",
              );
              void api("/profile/events", {
                method: "POST",
                body: {
                  name: "apply_clicked",
                  properties: {
                    slug: item.slug,
                    match: item.candidateMatch?.score,
                    quality: item.opportunityQuality.score,
                    referral: Boolean(item.referral?.used),
                    campaign: item.referral?.campaign,
                  },
                },
              }).catch(() => undefined);
            }}
          >
            {item.referral?.used ? "Apply via Happy Tasking referral" : "Open public application"}
          </a>
          {item.originalApplicationUrl && item.referral?.used && (
            <a
              href={item.originalApplicationUrl}
              className="text-sm text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              Original application URL
            </a>
          )}
          </>
        )}
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Prepare for screening</h2>
        <ul className="space-y-1.5 text-sm text-muted">
          <li>Review relevant technical fundamentals you already use.</li>
          <li>Prepare examples from real work — never confidential client material.</li>
          <li>Practice concise professional explanations.</li>
          <li>Verify microphone, camera, and a quiet setup.</li>
          <li>Prepare GitHub or a portfolio if it helps show your work.</li>
        </ul>
        <p className="text-xs text-muted">
          Happy Tasking helps contributors prepare legitimately. We do not host
          leaked assessments, confidential test questions, or unauthorized
          screening answers.
        </p>
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Community tips</h2>
        {item.communityTips.length === 0 ? (
          <p className="text-sm text-muted">No published tips yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-muted">
            {item.communityTips.map((tip) => (
              <li key={tip.id}>“{tip.body}”</li>
            ))}
          </ul>
        )}
        {item.screening.sampleSize > 0 && (
          <p className="text-xs text-muted">
            Screening difficulty from {item.screening.sampleSize} contributor
            reports
            {item.screening.averageDifficulty
              ? ` · average ${item.screening.averageDifficulty.toFixed(1)} / 5`
              : ""}
            .
          </p>
        )}
      </section>

      <section className="panel panel-pad space-y-2 text-sm">
        <h2 className="section-title">Source / freshness</h2>
        <p>
          Source: {item.sourceLabel}
          {item.sourceUrl && (
            <>
              {" "}
              ·{" "}
              <a
                href={item.sourceUrl}
                className="text-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                Public page
              </a>
            </>
          )}
        </p>
        <p>
          Last verified: {formatDate(item.lastVerifiedAt)} (
          {formatRelativeTime(item.lastVerifiedAt)})
        </p>
        {item.stale && (
          <p className="text-mid">Status may have changed.</p>
        )}
        <p className="text-xs text-muted">Status {humanize(item.status)}</p>
      </section>

      {user && (
        <section className="panel panel-pad space-y-3">
          <h2 className="section-title">My applications</h2>
          <p className="text-sm text-muted">Private to you.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary min-h-11" onClick={() => void toggleSave()}>
              {item.saved ? "Unsave" : "Save opportunity"}
            </button>
            <select
              className="select max-w-xs"
              value={item.journey || ""}
              onChange={(e) => {
                if (e.target.value) void setStatus(e.target.value);
              }}
            >
              <option value="">Track status</option>
              {JOURNEY.map((s) => (
                <option key={s} value={s}>
                  {humanize(s)}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}
    </div>
  );
}
