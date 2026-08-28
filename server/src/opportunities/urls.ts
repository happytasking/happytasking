const AITRAINING_REFERRAL_PARAMS = new Set([
  "referralcode",
  "referral_code",
  "ref",
  "via",
  "affiliate",
  "aff",
  "referred_by",
  "referral",
]);

const AITRAINING_REFERRAL_UTM = {
  utm_source: "referral",
  utm_medium: "share",
  utm_campaign: "job_referral",
} as const;

export function safeHttpUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url;
  } catch {
    return null;
  }
}

export function canonicalizeUrl(value: string | null | undefined): string | null {
  const url = safeHttpUrl(value);
  if (!url) return null;
  url.hash = "";
  return url.toString();
}

/**
 * Explicit normalization: keep the destination job, drop known AITraining.jobs
 * referral/share parameters. Do not strip arbitrary query strings.
 */
export function stripKnownAggregatorReferralParams(
  value: string | null | undefined,
): string | null {
  const url = safeHttpUrl(value);
  if (!url) return canonicalizeUrl(value);
  const drop: string[] = [];
  url.searchParams.forEach((v, key) => {
    const k = key.toLowerCase();
    if (AITRAINING_REFERRAL_PARAMS.has(k)) {
      drop.push(key);
      return;
    }
    if (k === "utm_source" && v.toLowerCase() === AITRAINING_REFERRAL_UTM.utm_source) {
      drop.push(key);
    }
    if (k === "utm_medium" && v.toLowerCase() === AITRAINING_REFERRAL_UTM.utm_medium) {
      drop.push(key);
    }
    if (
      k === "utm_campaign" &&
      v.toLowerCase() === AITRAINING_REFERRAL_UTM.utm_campaign
    ) {
      drop.push(key);
    }
  });
  for (const key of drop) url.searchParams.delete(key);
  return url.toString();
}

export function hostOf(value: string | null | undefined): string | null {
  return safeHttpUrl(value)?.hostname.replace(/^www\./, "") ?? null;
}

export function isPrivateHostname(host: string) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return true;
  if (/^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) {
    return true;
  }
  return false;
}

export function assertAllowedHost(url: string, allowedHosts: string[]) {
  const parsed = safeHttpUrl(url);
  if (!parsed) throw new Error("Invalid URL");
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (isPrivateHostname(host)) throw new Error("Blocked private host");
  const ok = allowedHosts.some((allowed) => {
    const a = allowed.toLowerCase().replace(/^www\./, "");
    return host === a || host.endsWith(`.${a}`);
  });
  if (!ok) throw new Error(`Host not in allowlist: ${host}`);
  return parsed;
}
