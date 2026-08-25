import type { Metadata } from "next";
import Link from "next/link";
import { GitHubLink } from "@/components/GitHubLink";
import { ContributeCta } from "@/components/ContributeCta";
import { ManifestoBody, readManifestoMarkdown } from "@/lib/manifesto";

export const metadata: Metadata = {
  title: "The Happy Tasking Manifesto",
  description:
    "Know before you task. Why Happy Tasking exists, what the community believes, and the AI-work ecosystem we want to help build.",
};

export default async function ManifestoPage() {
  const markdown = await readManifestoMarkdown();

  return (
    <article className="container-page max-w-2xl space-y-10">
      <header>
        <p className="eyebrow">Manifesto</p>
        <h1 className="page-title mt-1">The Happy Tasking Manifesto</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          AI is being built by more people than most people see.
        </p>
      </header>

      <ManifestoBody markdown={markdown} />

      <footer className="space-y-4 border-t border-border pt-8">
        <p className="font-display text-xl leading-snug">
          Built with the community.
          <br />
          Independent by design.
        </p>
        <p className="text-sm font-semibold text-accent">Know before you task.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/community" className="btn btn-accent min-h-11">
            Join the community
          </Link>
          <GitHubLink>Contribute on GitHub</GitHubLink>
          <ContributeCta className="btn btn-ghost min-h-11" />
        </div>
      </footer>
    </article>
  );
}
