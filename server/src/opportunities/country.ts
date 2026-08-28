import {
  ISO_COUNTRIES,
  ISO_COUNTRY_BY_CODE,
  countryFlagEmoji,
  countryName,
  isIsoCountryCode,
} from "./isoCountries.js";
import type { CountryParse } from "./types.js";

export {
  ISO_COUNTRIES,
  ISO_COUNTRY_BY_CODE,
  countryFlagEmoji,
  countryName,
  isIsoCountryCode,
};

const GLOBAL_MARKERS =
  /\b(worldwide|global|anywhere|any country|all countries|open to all|remote international|international remote|open internationally)\b/i;

const US_MARKERS =
  /\b(united states|u\.s\.a\.|u\.s\.|usa|us-only|us only|u\.s only)\b/i;

const ALIASES: Record<string, string> = {
  uk: "GB",
  "u.k.": "GB",
  britain: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "great britain": "GB",
  "united kingdom": "GB",
  usa: "US",
  "u.s.": "US",
  "u.s.a.": "US",
  "united states": "US",
  "united states of america": "US",
  brasil: "BR",
  brazil: "BR",
  holland: "NL",
  "the netherlands": "NL",
  "south korea": "KR",
  korea: "KR",
  "viet nam": "VN",
  vietnam: "VN",
  "czech republic": "CZ",
  czechia: "CZ",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  "côte d'ivoire": "CI",
  russia: "RU",
  "russian federation": "RU",
  turkey: "TR",
  türkiye: "TR",
  palestine: "PS",
  "syrian arab republic": "SY",
  "macedonia": "MK",
  "north macedonia": "MK",
  "cape verde": "CV",
  "east timor": "TL",
  "timor-leste": "TL",
  "swaziland": "SZ",
  eswatini: "SZ",
  burma: "MM",
  myanmar: "MM",
};

const CITY_ALIASES: Record<string, string> = {
  london: "GB",
  manchester: "GB",
  paris: "FR",
  berlin: "DE",
  munich: "DE",
  "palo alto": "US",
  california: "US",
  "new york": "US",
  "san francisco": "US",
  "los angeles": "US",
  chicago: "US",
  austin: "US",
  seattle: "US",
  toronto: "CA",
  vancouver: "CA",
  sydney: "AU",
  melbourne: "AU",
  tokyo: "JP",
  singapore: "SG",
  dubai: "AE",
  lagos: "NG",
  nairobi: "KE",
  "são paulo": "BR",
  "sao paulo": "BR",
  "rio de janeiro": "BR",
  "belo horizonte": "BR",
};

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const NAME_PATTERNS: Array<{ code: string; re: RegExp }> = [
  ...ISO_COUNTRIES
    .slice()
    .sort((a, b) => b.name.length - a.name.length)
    .map((c) => ({
      code: c.code,
      re: new RegExp(`\\b${escapeRe(c.name)}\\b`, "i"),
    })),
  ...Object.entries(ALIASES).map(([name, code]) => ({
    code,
    re: new RegExp(`\\b${escapeRe(name)}\\b`, "i"),
  })),
  ...Object.entries(CITY_ALIASES).map(([name, code]) => ({
    code,
    re: new RegExp(`\\b${escapeRe(name)}\\b`, "i"),
  })),
];

export function parseCountryLocation(
  locationText: string | null | undefined,
  remote: boolean,
): CountryParse {
  const text = (locationText || "").trim();
  if (!text) {
    return { eligibility: "UNSPECIFIED", codes: [] };
  }
  if (GLOBAL_MARKERS.test(text)) {
    return { eligibility: "GLOBAL", codes: [] };
  }

  const codes = new Set<string>();
  let remaining = text;
  for (const { code, re } of NAME_PATTERNS) {
    if (re.test(remaining)) {
      codes.add(code);
      remaining = remaining.replace(re, " ");
    }
  }
  const iso = remaining.match(/\b([A-Z]{2})\b/g) || [];
  for (const code of iso) {
    if (code === "UK") codes.add("GB");
    else if (isIsoCountryCode(code) && code !== "AI" && code !== "ML") {
      codes.add(code);
    }
  }
  if (US_MARKERS.test(text)) codes.add("US");

  if (codes.size > 0) {
    return { eligibility: "EXPLICIT", codes: [...codes].sort() };
  }

  void remote;
  return { eligibility: "UNSPECIFIED", codes: [] };
}

export function matchesCountryFilter(
  country: CountryParse,
  requested: string | undefined,
  opts: { includeUnspecified?: boolean } = {},
): boolean {
  if (!requested) return true;
  const code = requested.trim().toUpperCase();
  if (!code) return true;
  if (!isIsoCountryCode(code)) return true;
  if (country.eligibility === "GLOBAL") return true;
  if (country.eligibility === "UNSPECIFIED") {
    return opts.includeUnspecified === true;
  }
  return country.codes.includes(code);
}

export function countryEligibleLabel(
  country: CountryParse,
  requested?: string | null,
): string | null {
  if (country.eligibility === "GLOBAL") return "Worldwide";
  if (country.eligibility !== "EXPLICIT" || country.codes.length === 0) {
    return null;
  }
  const wanted = requested?.trim().toUpperCase();
  if (wanted && country.codes.includes(wanted)) {
    const name = countryName(wanted);
    return name ? `${name} eligible` : `${wanted} eligible`;
  }
  if (country.codes.length === 1) {
    const name = countryName(country.codes[0]);
    return name ? `${name} eligible` : country.codes[0];
  }
  return `${country.codes.length} countries`;
}

/** Brazil-specific label used by Sprint 4.6.1 tests and copy. */
export function brazilEligibleLabel(country: CountryParse): string | null {
  if (country.eligibility === "GLOBAL") return "Worldwide";
  if (country.eligibility === "EXPLICIT" && country.codes.includes("BR")) {
    return "Brazil eligible";
  }
  return null;
}

export const POPULAR_COUNTRY_CODES = [
  "US",
  "BR",
  "GB",
  "CA",
  "DE",
  "FR",
  "IN",
  "DZ",
  "AU",
  "MX",
  "NG",
  "PH",
  "JP",
  "ZA",
  "PT",
  "ES",
] as const;
