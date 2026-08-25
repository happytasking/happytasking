import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/site";
import { IndependenceStatement } from "@/components/IndependenceStatement";
import { ContributeCta } from "@/components/ContributeCta";
import { GitHubIcon } from "@/components/GitHubIcon";
import { GITHUB } from "@/lib/github";

export const metadata: Metadata = {
  title: "Governance — How Happy Tasking is steered",
  description:
    "Happy Tasking is founder-led today and community-informed by design. How issues, methodology, privacy, and independence work.",
  ...canonicalMetadata("/governance"),
};

export default function GovernancePage() {
  return (
    <div className="container-page max-w-2xl space-y-10">
      <header>
        <p className="eyebrow">Governance</p>
        <h1 className="page-title mt-1">Founder-led today. Community-informed by design.</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          Happy Tasking is an independent community for the AI work economy. This
          page explains how product and methodology decisions are made now — not
          a promise of a future legal structure.
        </p>
      </header>

      <IndependenceStatement />

      <section className="space-y-3">
        <h2 className="section-title">Who decides</h2>
        <p className="text-sm leading-relaxed text-muted">
          The founder, and maintainers they appoint, decide what merges, what
          ships to happytasking.com, and who holds moderator roles on the live
          site. Listed companies do not vote on TaskScore. They can claim a
          profile and answer issues. That is a voice, not a veto.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">How the community participates</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li>GitHub Issues and Discussions can influence what gets built.</li>
          <li>Anyone can propose a feature before writing a large change.</li>
          <li>Maintainers review pull requests. Merge is not automatic.</li>
          <li>
            Major methodology changes should be discussed in public before they
            reorder public numbers.
          </li>
        </ul>
        <p className="text-sm">
          <Link href="/open-source" className="font-semibold text-accent hover:underline">
            Ways to contribute
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Privacy takes priority</h2>
        <p className="text-sm leading-relaxed text-muted">
          When product goals conflict, contributor privacy wins. Public identity
          is pseudonymous by default. We collect experience and structured
          ratings, not confidential work product. Verification evidence is not a
          public artifact.
        </p>
        <p className="rounded-[var(--radius)] bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
          Share your experience, not confidential work.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Commercial relationships</h2>
        <p className="text-sm leading-relaxed text-muted">
          Happy Tasking may later offer tools, research, or recruiting products
          in separate services. Those products must not rewrite public scores.
          Contributors to the community repository are not obligated to work on
          closed modules.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <ContributeCta />
        <a
          href={GITHUB.governance}
          className="btn btn-secondary min-h-11 inline-flex items-center gap-2"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon className="h-4 w-4" />
          Full governance document
        </a>
        <Link href="/methodology" className="btn btn-ghost min-h-11">
          Methodology
        </Link>
      </div>
    </div>
  );
}
