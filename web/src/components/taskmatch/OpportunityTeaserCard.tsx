import Link from "next/link";
import type { OpportunityCard as Card } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { formatRelativeTime, humanize } from "@/lib/format";
import { opportunityPay } from "@/lib/opportunityPay";
import { SOURCE_WORK_TYPES } from "@/lib/workTypes";

export function OpportunityTeaserCard({ item }: { item: Card }) {
  const pay = opportunityPay(item);
  const workLabel =
    item.workLabel ||
    SOURCE_WORK_TYPES.find((row) => row.key === item.workType)?.chip ||
    null;

  return (
    <Link
      href={`/taskmatch/opportunities/${item.slug}`}
      className="opportunity-teaser panel panel-pad hover:border-accent"
    >
      <div className="flex items-center gap-2">
        <CompanyLogo
          name={item.company.name}
          logoUrl={item.company.logoUrl}
          size="sm"
          fit="mark"
        />
        <p className="truncate text-sm font-semibold">{item.company.name}</p>
        {item.isNew ? (
          <span className="badge bg-accent-soft text-accent">NEW</span>
        ) : null}
      </div>
      <p className="mt-2 font-semibold leading-snug">{item.title}</p>
      {pay ? (
        <p className="pay-badge pay-badge-compact mt-3" aria-label={pay.aria}>
          <span className="pay-amount num">{pay.amount}</span>
          <span className="pay-unit">{pay.unit}</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">Pay not listed</p>
      )}
      <p className="mt-2 text-xs text-muted">
        {[
          item.remoteType ? humanize(item.remoteType) : null,
          workLabel,
          item.lastVerifiedAt
            ? `Verified ${formatRelativeTime(item.lastVerifiedAt)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <span className="mt-3 inline-block text-sm font-semibold text-accent">
        View →
      </span>
    </Link>
  );
}
