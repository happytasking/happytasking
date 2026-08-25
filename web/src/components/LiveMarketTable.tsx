import Link from "next/link";
import type { LiveMarketRow } from "@/lib/types";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import { CompanyLogo } from "@/components/CompanyLogo";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { DemoBadge } from "@/components/DemoBadge";
import { LinkableRow } from "@/components/LinkableRow";
import { StarRating } from "@/components/StarRating";
import { TaskScoreBadge } from "@/components/TaskScoreBadge";

type Props = {
  items: LiveMarketRow[];
  showConfidence?: boolean;
};

export function LiveMarketTable({ items, showConfidence = false }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Company</th>
          <th>TaskScore</th>
          <th>Tasks</th>
          <th>Pay</th>
          {showConfidence ? <th>Confidence</th> : null}
        </tr>
      </thead>
      <tbody>
        {items.map((row) => (
          <LinkableRow key={row.id} href={`/companies/${row.slug}`}>
            <td>
              <Link
                href={`/companies/${row.slug}`}
                className="group flex items-center gap-3"
              >
                <CompanyLogo name={row.name} logoUrl={row.logoUrl} size="md" />
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-2 font-semibold group-hover:text-accent">
                    {row.name}
                    <DemoBadge show={!!row.isDemo} />
                  </span>
                  {row.country && (
                    <span className="block text-xs text-subtle">{row.country}</span>
                  )}
                </span>
              </Link>
            </td>
            <td>
              {row.insufficientData ? (
                <span className="text-sm text-subtle">—</span>
              ) : (
                <TaskScoreBadge score={row.taskScore} size="md" mood />
              )}
            </td>
            <td>
              <AvailabilityPill
                status={row.pulse.availability}
                trend={row.pulse.trend}
              />
            </td>
            <td>
              <StarRating value={row.payStars} />
            </td>
            {showConfidence ? (
              <td>
                <ConfidenceIndicator
                  score={row.confidence.score}
                  tier={row.confidence.tier}
                  sampleSize={row.sampleSize}
                  insufficient={row.insufficientData}
                />
              </td>
            ) : null}
          </LinkableRow>
        ))}
      </tbody>
    </table>
  );
}
