"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { OpportunityCard } from "@/lib/types";
import { isLiveCatalogOpportunity } from "@/lib/taskmatchLanding";

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
      <ul className="space-y-2">
        {items.slice(0, 8).map((item) => (
          <li key={item.id}>
            <Link
              href={`/taskmatch/opportunities/${item.slug}`}
              className="font-medium hover:text-accent"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/taskmatch?company=${slug}`}
        className="text-sm font-semibold text-accent"
      >
        View all opportunities
      </Link>
    </section>
  );
}
