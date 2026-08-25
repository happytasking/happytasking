import Link from "next/link";
import type { OpportunityCard as Card } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { DualScore } from "./DualScore";
import { formatMoney, formatRelativeTime } from "@/lib/format";

function payLabel(item: Card) {
  if (item.minRate == null && item.maxRate == null) return null;
  const low = formatMoney(item.minRate ?? item.maxRate, item.currency);
  const high =
    item.maxRate != null && item.minRate != null && item.maxRate !== item.minRate
      ? `–${formatMoney(item.maxRate, item.currency)}`
      : "";
  return `${low}${high}/h`;
}

export function OpportunityCard({ item }: { item: Card }) {
  const why = (item.candidateMatch?.reasons ?? [])
    .filter((r) => r.kind === "match")
    .slice(0, 4);
  const pay = payLabel(item);

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
            <p className="text-sm font-semibold">{item.company.name}</p>
            <DemoBadge show={item.isDemo} />
            {item.featured && (
              <span className="badge bg-demo-bg text-demo">Featured</span>
            )}
          </div>
          <h2 className="mt-0.5 text-[1.05rem] font-semibold leading-snug">
            {item.title}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {item.recommendationLabel}
            {item.candidateMatch
              ? ` · Confidence ${item.confidence.toLowerCase()}`
              : ""}
          </p>
        </div>
      </div>

      <DualScore
        match={item.candidateMatch?.score}
        quality={item.opportunityQuality.score}
        size="sm"
      />

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {pay && <span>{pay}</span>}
        <span className="inline-flex items-center gap-1.5">
          Availability
          <AvailabilityPill
            status={item.pulse.availability}
            trend={item.pulse.trend}
          />
        </span>
        <span>
          TaskScore{" "}
          <span className="num font-semibold text-foreground">
            {item.taskScore ?? "—"}
          </span>
        </span>
      </div>

      {why.length > 0 && (
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Why you match </span>
          {why.map((r) => r.text).join(" · ")}
        </p>
      )}

      {item.stale && (
        <p className="text-xs text-mid">
          Last verified {formatRelativeTime(item.lastVerifiedAt)}. Status may have
          changed.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/taskmatch/opportunities/${item.slug}`}
          className="btn btn-accent min-h-11"
        >
          View match
        </Link>
        <Link
          href={`/taskmatch/opportunities/${item.slug}#how-to-apply`}
          className="btn btn-secondary min-h-11"
        >
          How to apply
        </Link>
      </div>
    </article>
  );
}
