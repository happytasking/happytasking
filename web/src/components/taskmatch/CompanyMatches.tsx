"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { OpportunityCard } from "@/lib/types";

export function CompanyMatches({ slug, name }: { slug: string; name: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<OpportunityCard[] | null>(null);

  useEffect(() => {
    if (!user) {
      setItems(null);
      return;
    }
    void api<{ items: OpportunityCard[] }>(`/taskmatch/company/${slug}`)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, [user, slug]);

  if (!user || !items?.length) return null;

  return (
    <section className="panel panel-pad space-y-3">
      <div>
        <p className="eyebrow">You + {name}</p>
        <h2 className="section-title mt-1">Best current matches</h2>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <Link
              href={`/taskmatch/opportunities/${item.slug}`}
              className="font-medium hover:text-accent"
            >
              {item.title}
            </Link>
            <span className="num font-semibold">
              {item.candidateMatch?.score ?? "—"}%
            </span>
          </li>
        ))}
      </ul>
      <Link href={`/taskmatch?company=${slug}`} className="text-sm font-semibold text-accent">
        See all matches
      </Link>
    </section>
  );
}
