import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/site";
import { IndependenceStatement } from "@/components/IndependenceStatement";
import { ContributeCta } from "@/components/ContributeCta";
import { GitHubLink } from "@/components/GitHubLink";

export const metadata: Metadata = {
  title: "About Happy Tasking",
  description:
    "Happy Tasking is an independent community, reputation, matching, and market-intelligence platform for the AI work economy. Know before you task.",
  ...canonicalMetadata("/about"),
};

const WHO = [
  "AI trainers",
  "Software developers",
  "Evaluators and reviewers",
  "Annotators",
  "Researchers",
  "STEM, healthcare, finance, legal, and language experts",
  "Freelancers and independent contractors",
  "Remote professionals",
];

export default function AboutPage() {
  return (
    <div className="container-page max-w-2xl space-y-10">
      <header>
        <p className="eyebrow">About</p>
        <h1 className="page-title mt-1">What is Happy Tasking?</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          Happy Tasking is an independent community, reputation, matching, and
          market-intelligence platform for the AI work economy.
        </p>
        <p className="mt-3 text-sm font-medium text-subtle">
          Know before you task.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="section-title">Who it is for</h2>
        <p className="text-sm leading-relaxed text-muted">
          The people building and evaluating AI systems are not a footnote. They
          are a global labor market:
        </p>
        <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
          {WHO.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-subtle">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-muted">
          AI companies belong here too. Contributors and companies need each
          other. The problem Happy Tasking addresses is information asymmetry,
          not a fight between sides.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">The problem</h2>
        <p className="text-sm leading-relaxed text-muted">
          Useful information about AI work is fragmented across Reddit, Discord,
          WhatsApp, forums, private groups, and individual experience. People
          looking at the same platforms still cannot see the same picture.
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Happy Tasking helps structure that knowledge into community
          intelligence: companies, TaskScore, TaskPulse, TaskRate, TaskMatch, a
          Resolution Center, and a professional community — without asking anyone
          to publish confidential work.
        </p>
        <p className="rounded-[var(--radius)] bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
          Share your experience, not confidential work.
        </p>
      </section>

      <IndependenceStatement />

      <section className="space-y-3">
        <h2 className="section-title">How to go deeper</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/manifesto" className="font-semibold text-accent hover:underline">
              Manifesto
            </Link>
            <span className="text-muted"> — why we exist</span>
          </li>
          <li>
            <Link href="/methodology" className="font-semibold text-accent hover:underline">
              Methodology
            </Link>
            <span className="text-muted"> — what the numbers mean</span>
          </li>
          <li>
            <Link href="/governance" className="font-semibold text-accent hover:underline">
              Governance
            </Link>
            <span className="text-muted"> — who decides, and what cannot be sold</span>
          </li>
          <li>
            <Link href="/open-source" className="font-semibold text-accent hover:underline">
              Open source
            </Link>
            <span className="text-muted"> — inspect and improve the community platform</span>
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/community" className="btn btn-accent min-h-11">
          Join the community
        </Link>
        <ContributeCta className="btn btn-secondary min-h-11" />
        <GitHubLink>View on GitHub</GitHubLink>
      </div>
    </div>
  );
}
