"use client";

import { useEffect, useRef, useState } from "react";
import type { TaskMatchFacets } from "@/lib/types";
import { CountryPicker } from "./CountryPicker";
import { CompanyLogo } from "@/components/CompanyLogo";
import { countryName, isIsoCountryCode } from "@/lib/countries";
import { SOURCE_WORK_TYPES } from "@/lib/workTypes";
import { useSoftQuery } from "@/lib/useSoftQuery";
import { track } from "@/lib/track";

function resultCopy(input: {
  shown: number;
  total: number;
  country: string;
  workType: string;
  companyName?: string | null;
  includeUnspecified: boolean;
}) {
  const total = input.total.toLocaleString();
  const shown = input.shown.toLocaleString();
  const countryLabel = isIsoCountryCode(input.country)
    ? countryName(input.country)
    : null;
  const work = SOURCE_WORK_TYPES.find((row) => row.key === input.workType);
  let noun = `${total} tracked active opportunities`;
  if (countryLabel) {
    noun = `${total} confirmed opportunities for ${countryLabel}`;
    if (input.includeUnspecified) {
      noun += ", including unspecified location";
    }
  } else if (work) {
    noun = `${total} ${work.chip} opportunities`;
  } else if (input.companyName) {
    noun = `${total} opportunities at ${input.companyName}`;
  }
  if (input.shown < input.total) return `${shown} shown of ${noun}`;
  return noun;
}

export function TaskMatchFilters({
  shown,
  total,
  facets,
  extra,
  personalized = false,
  hasIntel = false,
}: {
  shown: number;
  total: number;
  facets?: TaskMatchFacets | null;
  extra?: React.ReactNode;
  personalized?: boolean;
  hasIntel?: boolean;
}) {
  const { searchParams, setQuery } = useSoftQuery();
  const country = searchParams.get("country") || "";
  const workType = searchParams.get("workType") || "";
  const company = searchParams.get("company") || "";
  const sort = searchParams.get("sort") || "newest";
  const remote = searchParams.get("remote") === "true";
  const includeUnspecified = searchParams.get("includeUnspecified") === "true";
  const qParam = searchParams.get("q") || "";
  const [search, setSearch] = useState(qParam);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const companyName =
    facets?.companies.find((row) => row.slug === company)?.name ?? null;
  const workTypes = (facets?.workTypes?.length
    ? facets.workTypes
    : SOURCE_WORK_TYPES.map((row) => ({
        key: row.key,
        label: row.label,
        chip: row.chip,
        count: 0,
      }))
  ).filter((row) => row.count > 0 || row.key === workType || !facets?.workTypes);

  function setSearchDebounced(value: string) {
    setSearch(value);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      const next = value.trim();
      if ((searchParams.get("q") || "") === next) return;
      setQuery({ q: next || null });
      if (next) track("taskmatch_search_used");
    }, 300);
  }

  return (
    <div className="space-y-4">
      <div className="discovery-sticky space-y-3">
        <label className="block space-y-1" htmlFor="taskmatch-search">
          <span className="label">Search</span>
          <input
            id="taskmatch-search"
            className="input min-h-11"
            type="search"
            autoComplete="off"
            placeholder="Search roles, skills, companies, or locations..."
            value={search}
            onChange={(e) => setSearchDebounced(e.target.value)}
          />
        </label>
        <p className="text-sm text-muted">
          {`${resultCopy({
            shown,
            total,
            country,
            workType,
            companyName,
            includeUnspecified,
          })}. Open jobs are not TaskPulse.`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <CountryPicker
          id="taskmatch-country"
          value={country}
          counts={facets?.countries}
          onChange={(code) => {
            setQuery({
              country: code || null,
              includeUnspecified: code ? searchParams.get("includeUnspecified") : null,
            });
            track("taskmatch_country_changed");
          }}
        />
        <label className="flex items-center gap-2 pb-2 text-sm" htmlFor="taskmatch-remote">
          <input
            id="taskmatch-remote"
            type="checkbox"
            checked={remote}
            onChange={(e) => {
              setQuery({ remote: e.target.checked ? "true" : null });
              track("taskmatch_remote_toggled");
            }}
          />
          Remote listed
        </label>
        <label className="space-y-1" htmlFor="taskmatch-sort">
          <span className="label">Sort</span>
          <select
            id="taskmatch-sort"
            className="select min-h-11"
            value={sort}
            onChange={(e) => {
              setQuery({ sort: e.target.value });
              track("taskmatch_sort_changed");
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest</option>
            <option value="pay">Top pay (hourly)</option>
            {personalized ? <option value="match">Best match</option> : null}
            {hasIntel ? <option value="quality">Best opportunity quality</option> : null}
            {hasIntel ? <option value="taskscore">Best TaskScore</option> : null}
            <option value="verified">Recently verified</option>
          </select>
        </label>
      </div>

      {country ? (
        <label className="flex items-center gap-2 text-sm" htmlFor="taskmatch-unspecified">
          <input
            id="taskmatch-unspecified"
            type="checkbox"
            checked={includeUnspecified}
            onChange={(e) =>
              setQuery({
                includeUnspecified: e.target.checked ? "true" : null,
              })
            }
          />
          Include listings with unspecified location
        </label>
      ) : null}

      <div>
        <p className="label mb-2">Work type</p>
        <div className="filter-scroll" role="group" aria-label="Work type">
          <button
            type="button"
            className={`chip ${!workType ? "chip-accent" : ""}`}
            aria-pressed={!workType}
            onClick={() => {
              setQuery({ workType: null, domain: null });
              track("taskmatch_category_changed");
            }}
          >
            All work
          </button>
          {workTypes.map((row) => (
            <button
              key={row.key}
              type="button"
              className={`chip ${workType === row.key ? "chip-accent" : ""}`}
              aria-pressed={workType === row.key}
              onClick={() => {
                setQuery({
                  workType: workType === row.key ? null : row.key,
                  domain: null,
                });
                track("taskmatch_category_changed");
              }}
            >
              {row.chip}
              {row.count > 0 ? (
                <span className="num text-subtle">{row.count}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {facets?.companies?.length ? (
        <div>
          <p className="label mb-2">Platforms with active opportunities</p>
          <div className="filter-scroll" role="group" aria-label="Platforms with active opportunities">
            {facets.companies.map((row) => (
              <button
                key={row.slug}
                type="button"
                className={`chip ${company === row.slug ? "chip-accent" : ""}`}
                aria-pressed={company === row.slug}
                onClick={() => {
                  setQuery({ company: company === row.slug ? null : row.slug });
                  track("taskmatch_company_changed");
                }}
              >
                <CompanyLogo
                  name={row.name}
                  logoUrl={row.logoUrl}
                  size="xs"
                  fit="mark"
                />
                {row.name}
                <span className="num text-subtle">{row.count}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {extra}

      <p className="text-xs text-muted">
        Remote does not automatically mean a country is eligible. Default
        country results are confirmed worldwide or explicitly listed countries.
        Unspecified location is opt-in and is never labeled eligible.
      </p>
    </div>
  );
}
