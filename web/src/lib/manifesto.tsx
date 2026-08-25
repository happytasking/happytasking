import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";

export async function readManifestoMarkdown(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "..", "MANIFESTO.md"),
    path.join(process.cwd(), "MANIFESTO.md"),
  ];
  for (const file of candidates) {
    try {
      return await readFile(file, "utf8");
    } catch {
      /* try next */
    }
  }
  throw new Error("MANIFESTO.md was not found next to the web app.");
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1].startsWith("**")) {
      parts.push(<strong key={key++}>{match[1].slice(2, -2)}</strong>);
    } else {
      const href = rewriteHref(match[3]);
      const label = rewriteLabel(match[2]);
      const external = href.startsWith("http");
      parts.push(
        <a
          key={key++}
          href={href}
          className="font-semibold text-accent hover:underline"
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {label}
        </a>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function rewriteLabel(label: string) {
  if (label === "CONTRIBUTING.md") return "Contributing guide";
  if (label === "GOVERNANCE.md") return "Governance";
  if (label === "ROADMAP.md") return "Roadmap";
  return label;
}

function rewriteHref(href: string) {
  if (href === "CONTRIBUTING.md") return "/open-source";
  if (href === "GOVERNANCE.md") return "/governance";
  if (href === "ROADMAP.md") return "/open-source";
  return href;
}

const CALLOUTS = new Set([
  "Know before you task.",
  "Share your experience, not confidential work.",
  "Reputation should be earned.",
  "Problems deserve resolution, not just complaints.",
  "Matching should work both ways.",
  "Your data should work for you.",
  "Built with the community.",
  "Independence matters.",
]);

export function ManifestoBody({ markdown }: { markdown: string }) {
  const blocks = markdown.trim().split(/\n{2,}/);
  const nodes: ReactNode[] = [];
  let i = 0;

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    i += 1;

    if (block === "---" || /^[-*]{3,}$/.test(block)) continue;

    if (block === "AI is being built by more people than most people see.") continue;

    if (block.startsWith("# The Happy Tasking Manifesto")) continue;

    if (block === "## Know before you task.") {
      nodes.push(
        <p key={i} className="font-display text-2xl leading-snug text-foreground md:text-[1.75rem]">
          Know before you task.
        </p>,
      );
      continue;
    }

    if (block.startsWith("# ")) {
      nodes.push(
        <h2 key={i} className="page-title mt-4 text-[1.75rem] md:text-[2.125rem]">
          {block.replace(/^#\s+/, "")}
        </h2>,
      );
      continue;
    }

    if (block.startsWith("## ")) {
      const title = block.replace(/^##\s+/, "");
      const emphasize = CALLOUTS.has(title);
      nodes.push(
        <h2
          key={i}
          className={
            emphasize
              ? "mt-2 font-display text-[1.5rem] leading-snug text-foreground md:text-[1.75rem]"
              : "section-title mt-2"
          }
        >
          {title}
        </h2>,
      );
      continue;
    }

    if (block.startsWith("> ")) {
      const quote = block.replace(/^>\s+/gm, "");
      nodes.push(
        <blockquote
          key={i}
          className="rounded-[var(--radius)] bg-accent-soft px-4 py-3 text-sm font-semibold leading-relaxed text-accent md:text-[0.9375rem]"
        >
          {inline(quote)}
        </blockquote>,
      );
      continue;
    }

    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      nodes.push(
        <ul key={i} className="space-y-2 text-sm leading-relaxed text-muted md:text-[0.9375rem]">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-subtle">
                —
              </span>
              <span>{inline(item.slice(2))}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (block.includes("\n↓\n") || block.startsWith("More contributors")) {
      nodes.push(
        <p
          key={i}
          className="text-center text-sm font-medium leading-loose text-foreground"
        >
          {block.split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < block.split("\n").length - 1 ? <br /> : null}
            </span>
          ))}
        </p>,
      );
      continue;
    }

    if (block.startsWith("**") && block.endsWith("**") && !block.includes("\n")) {
      nodes.push(
        <p key={i} className="text-sm font-semibold leading-relaxed text-foreground md:text-[0.9375rem]">
          {block.slice(2, -2)}
        </p>,
      );
      continue;
    }

    nodes.push(
      <p key={i} className="text-sm leading-relaxed text-muted md:text-[0.9375rem]">
        {block.split("\n").map((line, idx, arr) => (
          <span key={idx}>
            {inline(line)}
            {idx < arr.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>,
    );
  }

  return <div className="space-y-5">{nodes}</div>;
}
