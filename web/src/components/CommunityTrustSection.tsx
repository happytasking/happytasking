import Link from "next/link";
import { GitHubLink } from "./GitHubLink";
import { ContributeCta } from "./ContributeCta";

export function CommunityTrustSection() {
  return (
    <section className="panel panel-pad">
      <p className="eyebrow">Built with the community</p>
      <h2 className="page-title mt-2 max-w-xl text-[1.75rem] leading-tight md:text-[2rem]">
        Independent by design.
        <br />
        Open by default.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-[0.9375rem]">
        Happy Tasking is a community-driven platform built for the people
        participating in the AI work economy. Our community platform is open
        source, our public methodologies are documented as they mature, and
        contributors can help shape how Happy Tasking evolves.
      </p>
      <p className="mt-3 text-xs font-medium tracking-wide text-subtle">
        Open source · Community-driven · Independent
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          {
            title: "Open source",
            body: "Inspect the code, report issues, and contribute improvements.",
          },
          {
            title: "Transparent methodology",
            body: "Understand what public metrics measure — and where the data is still thin.",
          },
          {
            title: "Independent reputation",
            body: "Commercial relationships cannot purchase better community scores.",
          },
          {
            title: "Community governance",
            body: "Propose features, discuss methodology, and help shape the roadmap.",
          },
        ].map((item) => (
          <li key={item.title} className="rounded-[var(--radius)] bg-surface-2 px-4 py-3">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <GitHubLink>View on GitHub</GitHubLink>
        <Link href="/manifesto" className="btn btn-secondary min-h-11">
          Read our Manifesto
        </Link>
        <ContributeCta className="btn btn-ghost min-h-11" />
      </div>
    </section>
  );
}
