import Link from "next/link";
import { BrandFull } from "./Logo";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/companies", label: "Company directory" },
      { href: "/community", label: "Community" },
      { href: "/taskmatch", label: "TaskMatch" },
      { href: "/market", label: "Market intelligence" },
      { href: "/issues", label: "Issues & resolution" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { href: "/reviews/new", label: "Share an experience" },
      { href: "/issues/new", label: "Report an issue" },
      { href: "/privacy-for-contributors", label: "Privacy for contributors" },
      { href: "/register", label: "Create an account" },
      { href: "/for-companies", label: "For companies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex" aria-label="Happy Tasking home">
            <BrandFull height={52} />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted">
            Independent reputation and intelligence for the AI work economy.
            Built on structured contributor experience, not confidential work.
          </p>
          <Link
            href="/privacy-for-contributors"
            className="mt-4 inline-flex rounded-md bg-accent-soft px-2.5 py-1.5 text-xs font-semibold text-accent hover:underline"
          >
            Share your experience, not confidential work.
          </Link>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="rule-gradient opacity-40" />
      <div className="container-page flex flex-col gap-2 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <span>The community for AI work.</span>
        <Link
          href="/privacy-for-contributors"
          className="hover:text-accent"
        >
          Privacy for contributors
        </Link>
      </div>
    </footer>
  );
}
