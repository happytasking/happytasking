import Link from "next/link";

const links = [
  { href: "/moderation/insights", label: "Insights" },
  { href: "/moderation", label: "Triage" },
  { href: "/moderation/opportunities", label: "Opportunities" },
];

export function ModeratorNav({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Moderator sections">
      {links.map((link) => {
        const active =
          link.href === "/moderation"
            ? current === "/moderation"
            : current.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-[rgba(11,26,45,0.045)] hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
