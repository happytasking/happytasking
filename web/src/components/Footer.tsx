import Link from "next/link";
import { BrandFull } from "./Logo";
import { GitHubIcon } from "./GitHubIcon";
import { GITHUB } from "@/lib/github";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/companies", label: "Companies" },
      { href: "/compare", label: "Compare" },
      { href: "/taskmatch", label: "TaskMatch" },
      { href: "/market", label: "Market" },
      { href: "/community", label: "Community" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About Happy Tasking" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/methodology", label: "Methodology" },
      { href: "/governance", label: "Governance" },
      { href: "/open-source", label: "Open source" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: GITHUB.repo, label: "GitHub", external: true },
      { href: "/open-source", label: "Contribute" },
      { href: GITHUB.roadmap, label: "Roadmap", external: true },
      { href: GITHUB.conduct, label: "Code of Conduct", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-for-contributors", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: GITHUB.security, label: "Security", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-10 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <div>
          <Link href="/" className="inline-flex" aria-label="Happy Tasking home">
            <BrandFull height={48} />
          </Link>
          <p className="mt-3 text-sm font-medium text-foreground">
            Know before you task.
          </p>
          <p className="mt-1 text-xs text-subtle">
            Community-driven · Open source · Independent
          </p>
          <a
            href={GITHUB.repo}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon className="h-4 w-4" />
            Open source on GitHub
          </a>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="eyebrow">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      className="text-muted hover:text-accent"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-muted hover:text-accent">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="rule-gradient opacity-40" />
      <div className="container-page flex flex-col gap-2 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <span>The community for AI work.</span>
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/manifesto" className="hover:text-accent">
            Manifesto
          </Link>
          <Link href="/methodology" className="hover:text-accent">
            Methodology
          </Link>
          <Link href="/governance" className="hover:text-accent">
            Governance
          </Link>
          <Link href="/open-source" className="hover:text-accent">
            Open source
          </Link>
        </p>
      </div>
    </footer>
  );
}
