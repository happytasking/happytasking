"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { OpportunityCard } from "@/lib/types";
import { isLiveCatalogOpportunity } from "@/lib/taskmatchLanding";
import { OpportunityTeaserCard } from "./OpportunityTeaserCard";

export function CompanyCurrentOpportunities({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [items, setItems] = useState<OpportunityCard[] | null>(null);

  useEffect(() => {
    void api<{ items: OpportunityCard[] }>(`/taskmatch?company=${slug}&limit=8&sort=newest`)
      .then((data) =>
        setItems(data.items.filter(isLiveCatalogOpportunity)),
      )
      .catch(() => setItems([]));
  }, [slug]);

  if (!items?.length) return null;

  return (
    <section className="panel panel-pad space-y-3">
      <div>
        <p className="eyebrow">Hiring</p>
        <h2 className="section-title mt-1">Current opportunities</h2>
        <p className="mt-1 text-sm text-muted">
          Public recruiting listings for {name}. Open jobs are not TaskPulse.
        </p>
      </div>
      <div className="grid gap-3">
        {items.slice(0, 8).map((item) => (
          <OpportunityTeaserCard key={item.id} item={item} />
        ))}
      </div>
      <Link
        href={`/taskmatch?company=${slug}`}
        className="text-sm font-semibold text-accent"
      >
        View all opportunities
      </Link>
    </section>
  );
}
