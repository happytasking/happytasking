"use client";

import { GitHubLink } from "./GitHubLink";
import { GITHUB } from "@/lib/github";
import { track } from "@/lib/track";
import { GitHubIcon } from "./GitHubIcon";

export function GitHubHelpCta() {
  return (
    <section className="panel-gradient panel-pad rounded-[var(--radius-lg)]">
      <p className="eyebrow">Community</p>
      <h2 className="section-title mt-1">Help build Happy Tasking</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Found a bug? Have an idea? Want to improve the platform? Happy Tasking is
        built with its community — in code, in data corrections, and in
        conversation.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <GitHubLink>View on GitHub</GitHubLink>
        <a
          href={GITHUB.contributing}
          className="btn btn-secondary min-h-11 inline-flex items-center gap-2"
          target="_blank"
          rel="noreferrer"
          onClick={() => track("contribute_clicked")}
        >
          <GitHubIcon className="h-4 w-4" />
          Read contributing guide
        </a>
      </div>
    </section>
  );
}
