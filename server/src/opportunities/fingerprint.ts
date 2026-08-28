import { createHash } from "node:crypto";
import { hostOf } from "./urls.js";

export function opportunityFingerprint(input: {
  companySlug: string;
  title: string;
  locationText?: string | null;
  workType?: string | null;
}): string {
  const base = [
    input.companySlug.trim().toLowerCase(),
    input.title.trim().toLowerCase().replace(/\s+/g, " "),
    (input.locationText || "").trim().toLowerCase(),
    (input.workType || "").trim().toLowerCase(),
  ].join("|");
  return createHash("sha256").update(base).digest("hex").slice(0, 32);
}

export function canonicalApplicationKey(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return `${parsed.origin}${parsed.pathname}`.toLowerCase();
  } catch {
    return null;
  }
}

export function applicationHost(url: string | null | undefined) {
  return hostOf(url);
}
