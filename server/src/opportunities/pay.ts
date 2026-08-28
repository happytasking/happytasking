const ALLOWED_UNITS = new Set(["HOURLY", "PER_TASK", "MILESTONE"]);

/**
 * Listing pay is parsed from the listing's compensation text only.
 * Platform-level typical pay must never be used as a listing rate.
 */
export function parseCompensationText(
  raw: string | null | undefined,
): {
  minRate: number | null;
  maxRate: number | null;
  currency: string;
  unit: "HOURLY" | "PER_TASK" | "MILESTONE" | null;
  rawText: string | null;
} {
  const text = (raw || "").replace(/\u00a0/g, " ").trim();
  if (!text) {
    return { minRate: null, maxRate: null, currency: "USD", unit: null, rawText: null };
  }
  const collapsed = text.replace(/\$\$+/g, "$");
  const numbers = [...collapsed.matchAll(/\$?\s*(\d+(?:\.\d+)?)\s*(k\b)?/gi)]
    .map((m) => {
      const n = Number(m[1]);
      if (!Number.isFinite(n) || n <= 0) return null;
      return m[2] ? n * 1000 : n;
    })
    .filter((n): n is number => n != null && n < 10000);

  let minRate: number | null = null;
  let maxRate: number | null = null;
  if (numbers.length === 1) {
    minRate = numbers[0];
    maxRate = numbers[0];
  } else if (numbers.length >= 2) {
    minRate = Math.min(numbers[0], numbers[1]);
    maxRate = Math.max(numbers[0], numbers[1]);
  }

  const lower = collapsed.toLowerCase();
  let unit: "HOURLY" | "PER_TASK" | "MILESTONE" | null = null;
  if (/\bper[\s-]?task\b|\btask\b/.test(lower) && !/\/\s*h|hour/.test(lower)) {
    unit = "PER_TASK";
  } else if (/milestone/.test(lower)) {
    unit = "MILESTONE";
  } else if (/\/\s*h\b|hour|\bhr\b|hourly/.test(lower)) {
    unit = "HOURLY";
  }

  return {
    minRate,
    maxRate,
    currency: "USD",
    unit,
    rawText: collapsed.slice(0, 120),
  };
}

export function listingPayFromSource(input: {
  compensationText?: string | null;
  platformPayLow?: number | null;
  platformPayHigh?: number | null;
}): ReturnType<typeof parseCompensationText> {
  const parsed = parseCompensationText(input.compensationText);
  if (parsed.minRate == null && parsed.maxRate == null) {
    return parsed;
  }
  return parsed;
}

export function assertPayIsNotZeroFilled(
  pay: { minRate: number | null; maxRate: number | null },
) {
  return pay.minRate == null && pay.maxRate == null;
}

export function isAllowedUnit(unit: string | null) {
  return unit == null || ALLOWED_UNITS.has(unit);
}
