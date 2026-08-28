import Link from "next/link";
import type { OpportunityCard as Card } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { DualScore } from "./DualScore";
import { formatDate, formatMoney, formatRelativeTime, humanize } from "@/lib/format";
import { hasPublicCommunityIntelligence } from "./communitySignals";

function payLabel(item: Card) {
  if (item.minRate == null && item.maxRate == null) return null;
  const low = formatMoney(item.minRate ?? item.maxRate, item.currency);
  const high =
    item.maxRate != null && item.minRate != null && item.maxRate !== item.minRate
      ? `–${formatMoney(item.maxRate, item.currency)}`
      : "";
  const unit =
    item.rateUnit === "PER_TASK"
      ? "/task"
      : item.rateUnit === "MILESTONE"
        ? "/milestone"
        : "/h";
  return `${low}${high}${unit}`;
}

function countryLabel(codes?: string[]) {
  if (!codes?.length) return null;
  return codes.join(", ");
}

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
  const pay = payLabel(item);
  const countries = countryLabel(item.countryRestrictions);
  const domainNames = item.domains.map((d) => d.name).slice(0, 3);
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
    <article className="panel panel-pad space-y-4">
      <div className="flex items-start gap-3">
        <CompanyLogo
          name={item.company.name}
          logoUrl={item.company.logoUrl}
          size="md"
          fit="auto"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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
          <h2 className="mt-0.5 text-[1.05rem] font-semibold leading-snug">
            {item.title}
          </h2>
          {personalized && item.candidateMatch && (
            <p className="mt-1 text-xs text-muted">
              {item.recommendationLabel}
              {` · Confidence ${item.confidence.toLowerCase()}`}
            </p>
          )}
        </div>
      </div>

      <DualScore
        match={item.candidateMatch?.score}
        quality={item.opportunityQuality.score}
        showMatch={showMatch}
        showQuality={showQuality}
        size="sm"
      />

      <div className="space-y-1 text-sm text-muted">
        <p className="eyebrow text-foreground">Listing</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {item.sourceLabel && <span>{item.sourceLabel}</span>}
          {item.lastVerifiedAt && (
            <span>Verified {formatRelativeTime(item.lastVerifiedAt)}</span>
          )}
          {pay && <span>{pay}</span>}
          {item.remoteType && <span>{humanize(item.remoteType)}</span>}
          {item.countryLabel && <span>{item.countryLabel}</span>}
          {!item.countryLabel && item.locationText && (
            <span>{item.locationText}</span>
          )}
          {!item.countryLabel && !item.locationText && countries && (
            <span>{countries}</span>
          )}
        </div>
        {item.discoveryNote && (
          <p className="text-xs">{item.discoveryNote}</p>
        )}
        {domainNames.length > 0 && <p>Domain: {domainNames.join(", ")}</p>}
        {skillNames.length > 0 && <p>Skills: {skillNames.join(", ")}</p>}
        {item.lastVerifiedAt && (
          <p>
            Last verified {formatDate(item.lastVerifiedAt)}
            {item.stale
              ? ` (${formatRelativeTime(item.lastVerifiedAt)}). Status may have changed.`
              : ""}
          </p>
        )}
      </div>

      {community ? (
        <div className="space-y-1 text-sm text-muted">
          <p className="eyebrow text-foreground">Company intelligence</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {item.pulse.availability ? (
              <span className="inline-flex items-center gap-1.5">
                Contributor task availability
                <AvailabilityPill
                  status={item.pulse.availability}
                  trend={item.pulse.trend}
                />
              </span>
            ) : null}
            {item.taskScore != null && (
              <span>
                TaskScore{" "}
                <span className="num font-semibold text-foreground">
                  {item.taskScore}
                </span>
              </span>
            )}
            {showQuality && item.opportunityQuality.score != null && (
              <span>
                Quality{" "}
                <span className="num font-semibold text-foreground">
                  {item.opportunityQuality.score}
                </span>
              </span>
            )}
          </div>
        </div>
      ) : personalized ? (
        <p className="text-sm text-muted">Limited community data.</p>
      ) : null}

      {showMatch && why.length > 0 && (
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Your TaskMatch </span>
          {item.candidateMatch?.score != null && (
            <span className="num font-semibold text-foreground">
              {item.candidateMatch.score}% estimated fit
            </span>
          )}{" "}
          {why.map((r) => r.text).join(" · ")}
        </p>
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
        >
          {personalized ? "View match" : "View opportunity"}
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
          Apply
        </Link>
      </div>
    </article>
  );
}
