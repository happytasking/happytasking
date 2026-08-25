"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Company, Pagination } from "@/lib/types";
import { ClaimBadge } from "@/components/ClaimBadge";
import { CompanyLogo } from "@/components/CompanyLogo";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonCards } from "@/components/Skeleton";

const STEPS = [
  {
    title: "Create an account and claim the profile",
    body: "Register with your work email, then open your company page and request verification. Tell us your role so replies carry the right title.",
  },
  {
    title: "A moderator verifies the claim",
    body: "We confirm you actually represent the company. Until then the profile shows “Claim pending” — we never mark a profile verified automatically.",
  },
  {
    title: "Respond to issues in public",
    body: "Once verified, your profile shows a Verified profile badge and your replies on issues are labelled as official company responses.",
  },
];

export default function ForCompaniesPage() {
  const { user } = useAuth();
  const [claimed, setClaimed] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Company[]; pagination: Pagination }>(
        `/companies${qs({ sort: "score", limit: 50 })}`,
      );
      setClaimed(res.items.filter((c) => c.claimStatus === "CLAIMED"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const managed = user?.companies ?? [];

  return (
    <div className="container-page max-w-4xl space-y-10">
      <div>
        <p className="eyebrow">For companies</p>
        <h1 className="page-title mt-1 max-w-2xl">
          Claim your profile and answer contributors directly
        </h1>
        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          Happy Tasking scores are computed from contributor reports and are not
          for sale. What claiming does give you is a verified voice: a badge on
          your profile and the ability to respond publicly to issues raised about
          your platform.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/companies" className="btn btn-accent min-h-11">
            Find your company
          </Link>
          {!user && (
            <Link href="/login" className="btn btn-secondary min-h-11">
              Company log in
            </Link>
          )}
        </div>
      </div>

      {managed.length > 0 && (
        <section>
          <SectionHeader
            title="Your profiles"
            description="Profiles linked to this account"
          />
          <div className="space-y-2.5">
            {managed.map((m) => (
              <div
                key={m.slug}
                className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CompanyLogo name={m.name} logoUrl={m.logoUrl} size="md" />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {m.name}
                      <ClaimBadge status={m.claimStatus} />
                    </p>
                    <p className="text-xs text-subtle">
                      {m.approved
                        ? m.title
                          ? `Verified representative · ${m.title}`
                          : "Verified representative"
                        : "Verification in review"}
                    </p>
                  </div>
                </div>
                <Link
                  href={
                    m.approved
                      ? `/issues?company=${m.slug}`
                      : `/companies/${m.slug}`
                  }
                  className="btn btn-secondary min-h-10"
                >
                  {m.approved ? "Open issue inbox" : "View profile"}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          title="How claiming works"
          description="Three steps, one human check"
        />
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="panel panel-pad">
              <span className="num flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[0.8125rem] font-bold text-white">
                {i + 1}
              </span>
              <h2 className="mt-3 text-[0.9375rem] font-semibold leading-snug">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHeader
          title="What you can and cannot do"
          description="Claiming adds a voice, not editorial control"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="panel panel-pad">
            <p className="badge bg-good-bg text-good">You can</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Post official, badged replies on issues about your company</li>
              <li>See reports about your company while they are still in triage</li>
              <li>Keep your description, website, and headquarters accurate</li>
            </ul>
          </div>
          <div className="panel panel-pad">
            <p className="badge bg-low-bg text-low">You cannot</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Edit, hide, or delete contributor reviews and issues</li>
              <li>Change your TaskScore or any computed metric</li>
              <li>See who filed a report when they chose identity protection</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Already responding"
          description="Companies with a verified representative on Happy Tasking"
        />
        {loading ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            <SkeletonCards count={2} className="h-16" />
          </div>
        ) : claimed.length === 0 ? (
          <p className="text-sm text-muted">
            No profiles have been claimed yet. Yours can be the first.
          </p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {claimed.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.slug}`}
                className="panel panel-hover flex items-center gap-3 px-4 py-3"
              >
                <CompanyLogo name={c.name} logoUrl={c.logoUrl} size="md" />
                <span className="min-w-0">
                  <span className="block font-semibold">{c.name}</span>
                  <ClaimBadge status={c.claimStatus} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
