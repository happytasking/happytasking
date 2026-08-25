import type { Metadata } from "next";
import Link from "next/link";
import { GitHubLink, TrackedExternalLink } from "@/components/GitHubLink";
import { GitHubHelpCta } from "@/components/GitHubHelpCta";
import { GitHubIcon } from "@/components/GitHubIcon";
import { GITHUB } from "@/lib/github";

export const metadata: Metadata = {
  title: "Happy Tasking Open Source — Built with the AI Work Community",
  description:
    "Happy Tasking is a community-driven open-source platform helping AI workers understand companies, opportunities, reputation and the AI work economy.",
};

const PRINCIPLES = [
  {
    title: "Transparency",
    body: "A platform that helps people evaluate work opportunities should itself be open to scrutiny.",
  },
  {
    title: "Community",
    body: "The people participating in AI work often understand its problems better than anyone else.",
  },
  {
    title: "Collaboration",
    body: "Developers can improve features, accessibility, translations, tooling, and community infrastructure.",
  },
  {
    title: "Trust",
    body: "Open development makes it easier for the community to understand how the platform evolves.",
  },
];

const WAYS = [
  {
    title: "Build",
    body: "Contribute code, fix bugs, and improve performance.",
    href: GITHUB.issues,
    event: "github_clicked" as const,
  },
  {
    title: "Design",
    body: "Improve usability, accessibility, and product experience.",
    href: GITHUB.feature,
    event: "feature_request_clicked" as const,
  },
  {
    title: "Data",
    body: "Report incorrect public company or opportunity information.",
    href: GITHUB.dataCorrection,
    event: "feature_request_clicked" as const,
  },
  {
    title: "Translate",
    body: "Help Happy Tasking support AI workers around the world.",
    href: GITHUB.feature,
    event: "feature_request_clicked" as const,
  },
  {
    title: "Ideas",
    body: "Propose features and participate in product discussions.",
    href: GITHUB.feature,
    event: "feature_request_clicked" as const,
  },
  {
    title: "Methodology",
    body: "Discuss how Happy Tasking should responsibly measure the AI work economy.",
    href: "/methodology",
    event: null,
  },
];

export default function OpenSourcePage() {
  return (
    <div className="container-page max-w-3xl space-y-12">
      <header>
        <p className="eyebrow">Open source</p>
        <h1 className="page-title mt-1">
          Built openly.
          <br />
          Improved together.
        </h1>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          Happy Tasking is a community-driven platform for the AI work economy.
          Our community platform is open source so developers and AI workers can
          inspect it, improve it, challenge assumptions, and help shape its
          future.
        </p>
        <p className="mt-3 text-xs font-medium tracking-wide text-subtle">
          Open source · Community-driven · Independent
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <GitHubLink>View Happy Tasking on GitHub</GitHubLink>
          <a href="#ways-to-contribute" className="btn btn-secondary min-h-11">
            Contribute
          </a>
        </div>
      </header>

      <section>
        <h2 className="section-title">Why open source?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <article key={item.title} className="panel panel-pad">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ways-to-contribute" className="scroll-mt-24">
        <p className="mt-2 text-sm text-muted">
          Pick the path that fits how you work. Every useful contribution is
          welcome.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WAYS.map((item) => {
            const className =
              "panel panel-hover panel-pad block text-left no-underline";
            const inner = (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </>
            );
            if (item.event) {
              return (
                <TrackedExternalLink
                  key={item.title}
                  href={item.href}
                  event={item.event}
                  className={className}
                >
                  {inner}
                </TrackedExternalLink>
              );
            }
            return (
              <Link key={item.title} href={item.href} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <TrackedExternalLink
            href={GITHUB.issues}
            event="github_clicked"
            className="btn btn-secondary min-h-11"
          >
            Browse issues
          </TrackedExternalLink>
          <TrackedExternalLink
            href={GITHUB.feature}
            event="feature_request_clicked"
            className="btn btn-secondary min-h-11"
          >
            Suggest a feature
          </TrackedExternalLink>
          <TrackedExternalLink
            href={GITHUB.contributing}
            event="contribute_clicked"
            className="btn btn-secondary min-h-11 inline-flex items-center gap-2"
          >
            <GitHubIcon className="h-4 w-4" />
            Read contributing guide
          </TrackedExternalLink>
        </div>
      </section>

      <section className="panel panel-pad">
        <h2 className="section-title">You don&apos;t need to write code to contribute.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Happy Tasking is a community project, not merely a software repository.
          The platform improves when people:
        </p>
        <ul className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
          {[
            "share legitimate work experiences",
            "report inaccurate information",
            "suggest features",
            "discuss methodology",
            "translate content",
            "report bugs",
            "improve documentation",
            "participate in community discussions",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-good">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/reviews/new" className="btn btn-accent min-h-11">
            Share an experience
          </Link>
          <Link href="/community" className="btn btn-secondary min-h-11">
            Join the community
          </Link>
          <TrackedExternalLink
            href={GITHUB.bug}
            event="report_bug_clicked"
            className="btn btn-ghost min-h-11"
          >
            Report a bug
          </TrackedExternalLink>
        </div>
      </section>

      <section>
        <h2 className="section-title">Open source & open core</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The Happy Tasking community platform is open source. Certain commercial
          services — such as proprietary datasets, enterprise intelligence,
          recruiting, screening, workforce products, and custom research — may be
          developed separately.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Commercial services do not control independent community reputation.
          Paid relationships cannot change TaskScore, TaskRate, TaskPulse,
          Resolution Score, or independent reviews.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/governance" className="font-semibold text-accent hover:underline">
            Governance details
          </Link>
        </p>
      </section>

      <section>
        <h2 className="section-title">License</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The community source is licensed under Apache-2.0. That license applies
          to the source code published in the repository. Happy Tasking branding,
          hosted datasets, and proprietary services are separate from the
          software license.
        </p>
        <p className="mt-3 text-sm">
          <TrackedExternalLink
            href={GITHUB.license}
            event="github_clicked"
            className="font-semibold text-accent hover:underline"
          >
            Licensed under Apache-2.0
          </TrackedExternalLink>
        </p>
      </section>

      <GitHubHelpCta />
    </div>
  );
}
