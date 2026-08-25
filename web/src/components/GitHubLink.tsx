"use client";

import { GitHubIcon } from "./GitHubIcon";
import { GITHUB } from "@/lib/github";
import { track } from "@/lib/track";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function GitHubLink({
  className = "btn btn-secondary min-h-11 inline-flex items-center gap-2",
  children = "View on GitHub",
}: Props) {
  return (
    <a
      href={GITHUB.repo}
      className={className}
      target="_blank"
      rel="noreferrer"
      onClick={() => track("github_clicked")}
    >
      <GitHubIcon className="h-4 w-4" />
      {children}
    </a>
  );
}

export function TrackedExternalLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  event:
    | "github_clicked"
    | "contribute_clicked"
    | "feature_request_clicked"
    | "report_bug_clicked";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer"
      onClick={() => track(event)}
    >
      {children}
    </a>
  );
}
