"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Item = { id: string; label: string; hint?: string };

export function SearchableSelect({
  id,
  label,
  placeholder,
  items,
  value,
  onChange,
  onQuery,
  emptyText = "No matches",
}: {
  id: string;
  label: string;
  placeholder: string;
  items: Item[];
  value: string;
  onChange: (id: string) => void;
  onQuery?: (q: string) => void;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = items.find((i) => i.id === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (onQuery) return items;
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 40);
    return items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 40);
  }, [items, query, onQuery]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input min-h-12"
        placeholder={placeholder}
        value={open ? query : selected?.label || query}
        autoComplete="off"
        onFocus={() => {
          setOpen(true);
          setQuery(selected?.label || "");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onQuery?.(e.target.value);
        }}
      />
      {open && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[var(--radius)] border border-border bg-surface shadow-lg">
          {filtered.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted">{emptyText}</li>
          )}
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`flex min-h-11 w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-2 ${
                  item.id === value ? "bg-accent-soft text-accent" : ""
                }`}
                onClick={() => {
                  onChange(item.id);
                  setQuery(item.label);
                  setOpen(false);
                }}
              >
                <span>{item.label}</span>
                {item.hint && (
                  <span className="text-xs text-subtle">{item.hint}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
