"use client";

import { useRouter } from "next/navigation";
import {
  KeyboardEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { api, qs } from "@/lib/api";
import type { Company, Pagination } from "@/lib/types";
import { CompanyLogo } from "./CompanyLogo";
import { TaskScoreBadge } from "./TaskScoreBadge";

const DEBOUNCE_MS = 180;
const LIMIT = 6;
/** Below this a query matches most of the directory, which is noise rather than a suggestion. */
const MIN_QUERY = 2;

type Props = {
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
};

export function CompanySearch({
  placeholder = "Search Outlier, Mercor, Turing…",
  buttonLabel = "Search companies",
  className = "",
}: Props) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = query.trim();
  const isSuggesting = term.length < MIN_QUERY;

  useEffect(() => {
    // An empty field falls back to the leaderboard so focusing is never a dead end.
    // Between 1 and MIN_QUERY characters we show nothing rather than everything.
    if (term.length > 0 && term.length < MIN_QUERY) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const path = term
      ? `/companies${qs({ search: term, limit: LIMIT })}`
      : `/companies${qs({ sort: "score", limit: LIMIT })}`;

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(() => {
      api<{ items: Company[]; pagination: Pagination }>(path, {
        signal: controller.signal,
      })
        .then((res) => {
          setResults(res.items);
          setTotal(res.pagination.total);
          setActive(-1);
        })
        .catch(() => {
          // Aborts are the common case here; a real failure just yields no suggestions.
          if (!controller.signal.aborted) {
            setResults([]);
            setTotal(0);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const goToCompany = useCallback(
    (company: Company) => {
      setOpen(false);
      setActive(-1);
      router.push(`/companies/${company.slug}`);
    },
    [router],
  );

  /** Shared by the form's submit and the "see all results" row. */
  function runFullSearch(e: SyntheticEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(term ? `/companies?search=${encodeURIComponent(term)}` : "/companies");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (!results.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
      return;
    }

    // Enter with a highlighted suggestion jumps straight to that company;
    // otherwise the form submits and runs a full directory search.
    if (e.key === "Enter" && open && active >= 0 && results[active]) {
      e.preventDefault();
      goToCompany(results[active]);
    }
  }

  const showPanel = open && (loading || results.length > 0 || term.length >= MIN_QUERY);
  const activeId = active >= 0 ? `${listId}-option-${active}` : undefined;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={runFullSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.75" stroke="var(--subtle)" strokeWidth="1.5" />
            <path
              d="M10.5 10.5L14 14"
              stroke="var(--subtle)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="input min-h-11 pl-9"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-label="Search companies"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={showPanel && results.length > 0 ? listId : undefined}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn btn-accent min-h-11 shrink-0">
          {buttonLabel}
        </button>
      </form>

      {showPanel && (
        <div className="panel absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden text-left shadow-[var(--shadow-lg)]">
          <p className="border-b border-border bg-surface-2 px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-subtle">
            {isSuggesting ? "Top companies" : `Matches for “${term}”`}
          </p>

          {loading && results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">
              No companies match “{term}”.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Company suggestions">
              {results.map((c, i) => (
                <li key={c.id} id={`${listId}-option-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    // mousedown would blur the input and close the panel before click lands
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => goToCompany(c)}
                    className={`flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 ${
                      i === active ? "bg-surface-2" : "bg-surface"
                    }`}
                  >
                    <CompanyLogo name={c.name} logoUrl={c.logoUrl} size="sm" fit="slot" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {c.name}
                      </span>
                      <span className="block truncate text-xs text-subtle">
                        {c.headquarters || c.country || "AI work platform"}
                      </span>
                    </span>
                    <TaskScoreBadge score={c.score?.taskScore} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isSuggesting && total > results.length && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={runFullSearch}
              className="block w-full border-t border-border bg-surface-2 px-3 py-2.5 text-left text-[0.8125rem] font-semibold text-accent hover:underline"
            >
              See all {total} results for “{term}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
