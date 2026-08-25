"use client";

import Link from "next/link";
import { GitHubIcon } from "./GitHubIcon";
import { GITHUB } from "@/lib/github";
import { track } from "@/lib/track";

const TRUST_ITEMS = [
  {
    title: "Open source",
    body: "Inspect the code and contribute improvements.",
  },
  {
    title: "Transparent methodology",
    body: "Understand how Happy Tasking measures the AI-work economy.",
  },
  {
    title: "Community-driven",
    body: "Suggest features, improve data, and help shape the roadmap.",
  },
  {
    title: "Independent",
    body: "Commercial relationships cannot purchase better community scores.",
  },
];

export function CommunityTrustSection() {
  return (
    <section
      aria-labelledby="community-trust-heading"
      className="panel overflow-hidden px-5 py-6 md:px-8 md:py-8"
      style={{
        background:
          "linear-gradient(165deg, rgba(24, 136, 244, 0.07) 0%, rgba(15, 188, 204, 0.05) 40%, var(--surface) 78%)",
      }}
    >
      <p className="eyebrow">Built with the community</p>
      <h2
        id="community-trust-heading"
        className="page-title mt-2 max-w-xl text-[1.75rem] leading-tight md:text-[2rem]"
      >
        Open source. Independent by design.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-[0.9375rem]">
        Happy Tasking is being built with the people who participate in the AI
        work economy. Inspect the code, challenge our methodology, suggest
        features, or contribute improvements.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        You don&apos;t need to write code to contribute. Share experience,
        correct public data, suggest features, discuss methodology, translate
        content, or contribute code.
      </p>
      <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-foreground">
        Companies may work with Happy Tasking. They cannot buy better community
        scores.
      </p>

      <ul className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <li key={item.title}>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-subtle">
              {item.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          href={GITHUB.repo}
          className="btn btn-primary inline-flex min-h-11 items-center justify-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("homepage_github_clicked")}
        >
          <GitHubIcon className="h-4 w-4" />
          View on GitHub
        </a>
        <Link
          href="/manifesto"
          className="btn btn-secondary min-h-11"
          onClick={() => track("homepage_manifesto_clicked")}
        >
          Read our Manifesto
        </Link>
      </div>
    </section>
  );
}
