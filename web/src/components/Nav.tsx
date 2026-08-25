"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { BrandLockup } from "./Logo";

const links = [
  { href: "/companies", label: "Companies" },
  { href: "/compare", label: "Compare" },
  { href: "/community", label: "Community" },
  { href: "/taskmatch", label: "TaskMatch" },
  { href: "/market", label: "Market" },
  { href: "/issues", label: "Issues" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  // Verified company reps get their issue inbox in place of the contributor CTA.
  const managed = user?.companies?.find((c) => c.approved);
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/65 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <BrandLockup priority />

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-[0.875rem] font-medium transition-colors ${
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
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isModerator ? (
            <Link href="/moderation/insights" className="btn btn-accent">
              Insights
            </Link>
          ) : managed ? (
            <Link
              href={`/issues?company=${managed.slug}`}
              className="btn btn-accent"
            >
              {managed.name} inbox
            </Link>
          ) : (
            <Link href="/reviews/new" className="btn btn-accent">
              Share experience
            </Link>
          )}
          {loading ? (
            <span className="skeleton h-9 w-24" />
          ) : user ? (
            <>
              <Link href="/profile" className="btn btn-secondary">
                {user.displayName || user.username}
              </Link>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Join
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d={open ? "M3 3l10 10M13 3L3 13" : "M2 4h12M2 8h12M2 12h12"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-surface-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {isModerator ? (
              <Link href="/moderation/insights" className="btn btn-accent my-1">
                Insights
              </Link>
            ) : managed ? (
              <Link
                href={`/issues?company=${managed.slug}`}
                className="btn btn-accent my-1"
              >
                {managed.name} inbox
              </Link>
            ) : (
              <Link href="/reviews/new" className="btn btn-accent my-1">
                Share experience
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-surface-2"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  className="rounded-md px-2 py-2.5 text-left text-sm font-medium hover:bg-surface-2"
                  onClick={logout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-surface-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-surface-2"
                >
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
