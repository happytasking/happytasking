"use client";

import Link from "next/link";
import type { OpportunityCard as Card } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { DualScore } from "./DualScore";
import { formatRelativeTime, humanize } from "@/lib/format";
import { opportunityPay } from "@/lib/opportunityPay";
import { hasPublicCommunityIntelligence } from "./communitySignals";
import { SOURCE_WORK_TYPES } from "@/lib/workTypes";
import { track } from "@/lib/track";

export function OpportunityCard({
  item,
  personalized = false,
}: {
  item: Card;
  personalized?: boolean;
}) {
  const why = (item.candidateMatch?.reasons ?? [])
    .filter((r) => r.kind === "match")
    .slice(0, 4);
  const pay = opportunityPay(item);
  const workLabel =
    item.workLabel ||
    SOURCE_WORK_TYPES.find((row) => row.key === item.workType)?.label ||
    null;
  const skillNames = item.skills
    .filter((s) => s.required)
    .map((s) => s.name)
    .slice(0, 4);
  const community = hasPublicCommunityIntelligence(item);
  const showMatch = personalized && item.candidateMatch?.score != null;
  const showQuality =
    personalized &&
    community &&
    item.opportunityQuality.score != null &&
    !item.opportunityQuality.insufficient;

  return (
    <article className="opportunity-card panel panel-pad space-y-4">
      <div className="flex items-start gap-3">
        <CompanyLogo
          name={item.company.name}
          logoUrl={item.company.logoUrl}
          size="lg"
          fit="mark"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="mt-0 text-[1.1rem] font-semibold leading-snug">
                {item.title}
                {item.isNew ? (
                  <span className="badge ml-2 bg-accent-soft text-accent">NEW</span>
                ) : null}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Link
                  href={`/companies/${item.company.slug}`}
                  className="text-sm font-semibold hover:text-accent hover:underline"
                >
                  {item.company.name}
                </Link>
                <DemoBadge show={item.isDemo} />
                {item.featured && (
                  <span className="badge bg-demo-bg text-demo">Featured</span>
                )}
              </div>
            </div>
            {pay ? (
              <p className="pay-badge" aria-label={pay.aria}>
                <span className="pay-amount num">{pay.amount}</span>
                <span className="pay-unit">{pay.unit}</span>
              </p>
            ) : (
              <p className="text-sm text-muted">Pay not listed</p>
            )}
          </div>
          <p className="mt-2 text-sm text-muted">
            {[
              workLabel,
              item.remoteType ? humanize(item.remoteType) : null,
              item.countryLabel,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-1 text-xs text-muted">
            {item.sourceLabel}
            {item.lastVerifiedAt
              ? ` · Verified ${formatRelativeTime(item.lastVerifiedAt)}`
              : ""}
          </p>
        </div>
      </div>

      {skillNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skillNames.map((name) => (
            <span key={name} className="chip">
              {name}
            </span>
          ))}
        </div>
      )}

      {community ? (
        <div className="space-y-1 text-sm text-muted">
          <p className="eyebrow text-foreground">Community intelligence</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {item.taskScore != null && (
              <span>
                TaskScore{" "}
                <span className="num font-semibold text-foreground">
                  {item.taskScore}
                </span>
              </span>
            )}
            {item.pulse.availability ? (
              <span className="inline-flex items-center gap-1.5">
                Contributor activity
                <AvailabilityPill
                  status={item.pulse.availability}
                  trend={item.pulse.trend}
                />
              </span>
            ) : null}
            {showQuality && item.opportunityQuality.score != null && (
              <span>
                Quality{" "}
                <span className="num font-semibold text-foreground">
                  {item.opportunityQuality.score}
                </span>
              </span>
            )}
          </div>
          <p className="text-xs">
            Public hiring activity is not contributor task availability.
          </p>
        </div>
      ) : personalized ? (
        <p className="text-sm text-muted">Limited community data.</p>
      ) : null}

      {showMatch && (
        <div className="text-sm">
          <p className="eyebrow">Your TaskMatch</p>
          <p className="mt-1">
            {item.candidateMatch?.score != null && (
              <span className="num font-semibold">
                {item.candidateMatch.score}% estimated fit
              </span>
            )}
            {item.confidence ? (
              <span className="text-muted">
                {" "}
                · Confidence {item.confidence.toLowerCase()}
              </span>
            ) : null}
          </p>
          {why.length > 0 && (
            <p className="mt-1 text-muted">
              {why.map((r) => `✓ ${r.text}`).join("   ")}
            </p>
          )}
        </div>
      )}

      {personalized && item.candidateMatch && (
        <DualScore
          match={item.candidateMatch.score}
          quality={item.opportunityQuality.score}
          showMatch={showMatch}
          showQuality={showQuality}
          size="sm"
        />
      )}

      {!personalized && (
        <p className="text-sm text-muted">
          <Link href="/login" className="font-semibold text-accent">
            See how this opportunity fits your profile
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/taskmatch/opportunities/${item.slug}`}
          className="btn btn-accent min-h-11"
          onClick={() => track("opportunity_card_opened")}
        >
          View details
        </Link>
        <Link
          href={`/companies/${item.company.slug}`}
          className="btn btn-secondary min-h-11"
        >
          Company intelligence
        </Link>
        <Link
          href={`/taskmatch/opportunities/${item.slug}#how-to-apply`}
          className="btn btn-secondary min-h-11"
        >
          Apply →
        </Link>
      </div>
    </article>
  );
}
