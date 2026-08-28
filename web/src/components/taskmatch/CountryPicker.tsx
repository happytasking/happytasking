"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ISO_COUNTRIES,
  POPULAR_COUNTRY_CODES,
  countryFlagEmoji,
  countryName,
  isIsoCountryCode,
} from "@/lib/countries";

type CountryCount = { code: string; count: number };

export function CountryPicker({
  id,
  value,
  onChange,
  counts,
}: {
  id: string;
  value: string;
  onChange: (code: string) => void;
  counts?: CountryCount[];
}) {
  const listId = useId();
  const activeId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const selected = isIsoCountryCode(value) ? value : "";
  const countByCode = useMemo(
    () => new Map((counts ?? []).map((row) => [row.code, row.count])),
    [counts],
  );

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const popular = POPULAR_COUNTRY_CODES.map((code) =>
      ISO_COUNTRIES.find((c) => c.code === code),
    ).filter(Boolean) as typeof ISO_COUNTRIES;
    const rest = ISO_COUNTRIES.filter(
      (c) => !POPULAR_COUNTRY_CODES.includes(c.code as (typeof POPULAR_COUNTRY_CODES)[number]),
    );
    const all = [{ code: "", name: "All countries" }, ...popular, ...rest];
    if (!q || !open) return all.slice(0, open ? all.length : 1);
    return all.filter((c) => {
      if (!c.code) return "all countries".includes(q);
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [query, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const display = selected
    ? `${countryFlagEmoji(selected)} ${countryName(selected) ?? selected}`
    : "All countries";

  function choose(code: string) {
    onChange(code);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(0, options.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, options.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = options[active];
      if (hit) choose(hit.code);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapRef} className="relative min-w-[12rem]">
      <label className="label" htmlFor={id}>
        Country
      </label>
      <input
        ref={inputRef}
        id={id}
        className="input min-h-11"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${activeId}-${active}` : undefined}
        aria-haspopup="listbox"
        autoComplete="off"
        placeholder="Search countries..."
        value={open ? query : display}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-[var(--radius)] border border-border bg-surface shadow-lg"
        >
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted">No countries match</li>
          )}
          {options.map((item, index) => {
            const count = item.code ? countByCode.get(item.code) : undefined;
            const selectedItem = item.code === selected;
            return (
              <li key={item.code || "all"} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={`${activeId}-${index}`}
                  aria-selected={selectedItem}
                  className={`flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2 ${
                    index === active ? "bg-surface-2" : ""
                  } ${selectedItem ? "text-accent" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item.code)}
                >
                  <span>
                    {item.code ? `${countryFlagEmoji(item.code)} ` : "🌍 "}
                    {item.name}
                    {item.code ? (
                      <span className="ml-2 text-xs text-subtle">{item.code}</span>
                    ) : null}
                  </span>
                  {count != null && count > 0 ? (
                    <span className="num text-xs text-muted">{count}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
