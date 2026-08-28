import type { CountryParse } from "./types.js";

const GLOBAL_MARKERS =
  /\b(worldwide|global|anywhere|any country|all countries|open to all)\b/i;

const US_MARKERS = /\b(united states|u\.s\.a\.|u\.s\.|usa|us-only|us only)\b/i;

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  brazil: "BR",
  brasil: "BR",
  germany: "DE",
  france: "FR",
  india: "IN",
  canada: "CA",
  mexico: "MX",
  portugal: "PT",
  spain: "ES",
  "united kingdom": "GB",
  uk: "GB",
  england: "GB",
  philippines: "PH",
  nigeria: "NG",
  kenya: "KE",
  argentina: "AR",
  colombia: "CO",
  australia: "AU",
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  "united states": "US",
  usa: "US",
};

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
  const iso = text.match(/\b([A-Z]{2})\b/g) || [];
  for (const code of iso) {
    if (code === "UK") codes.add("GB");
    else if (code !== "AI" && code !== "ML") codes.add(code);
  }
  const lower = text.toLowerCase();
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (lower.includes(name)) codes.add(code);
  }
  if (US_MARKERS.test(text)) codes.add("US");

  if (codes.size > 0) {
    return { eligibility: "EXPLICIT", codes: [...codes].sort() };
  }

  // Remote is not worldwide and is not a country.
  void remote;
  return { eligibility: "UNSPECIFIED", codes: [] };
}

export function matchesCountryFilter(
  country: CountryParse,
  requested: string | undefined,
): boolean {
  if (!requested) return true;
  const code = requested.trim().toUpperCase();
  if (!code) return true;
  if (country.eligibility === "GLOBAL") return true;
  if (country.eligibility === "UNSPECIFIED") return true;
  return country.codes.includes(code);
}

export function brazilEligibleLabel(country: CountryParse): string | null {
  if (country.eligibility === "GLOBAL") return "Worldwide";
  if (country.eligibility === "EXPLICIT" && country.codes.includes("BR")) {
    return "Brazil eligible";
  }
  return null;
}
