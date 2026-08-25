import Link from "next/link";
import { GitHubIcon } from "./GitHubIcon";
import { GITHUB } from "@/lib/github";

type Props = {
  /** compact = inline strip; default = panel for About / Methodology / Governance */
  compact?: boolean;
};

export function IndependenceStatement({ compact = false }: Props) {
  if (compact) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Happy Tasking may work commercially with companies. Those relationships
        cannot purchase better TaskScore, TaskRate, TaskPulse, Resolution Score,
        or community reviews.
      </p>
    );
  }

  return (
    <aside className="panel panel-pad">
      <p className="eyebrow">Our independence</p>
      <h2 className="section-title mt-1">
        Companies may work with Happy Tasking. They cannot buy a better
        reputation.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Advertising, recruiting seats, research, or other commercial work must
        not change TaskScore, TaskRate, TaskPulse, Resolution Score, or
        independent community reviews. Claiming a profile buys a verified voice
        — not a number.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/governance" className="font-semibold text-accent hover:underline">
          How governance protects this
        </Link>
        <span className="text-subtle"> · </span>
        <a
          href={GITHUB.governance}
          className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon className="h-3.5 w-3.5" />
          Source document
        </a>
      </p>
    </aside>
  );
}
