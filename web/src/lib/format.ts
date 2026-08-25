export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Date plus wall-clock time. Conversation threads can hold several entries on the
 * same day, where a date alone makes the ordering look arbitrary.
 */
export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Short relative age ("just now", "12 min ago") for recent activity, falling back
 * to an absolute date once the exact time stops mattering.
 */
export function formatRelativeTime(value?: string | null) {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 0) return formatDateTime(value);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
}

export function formatScore(value: number | null | undefined, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function formatMoney(value: number | null | undefined, currency = "USD") {
  if (value == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function scoreTone(score: number | null | undefined): "good" | "mid" | "low" | "none" {
  if (score == null) return "none";
  if (score >= 70) return "good";
  if (score >= 50) return "mid";
  return "low";
}

/**
 * Maps a 0–100 TaskScore onto a five-point mood face. The emoji is decoration on
 * top of the number, so every band carries a text label for screen readers.
 */
export function scoreMood(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) {
    return { emoji: "", label: "No data yet" };
  }
  if (score >= 80) return { emoji: "😍", label: "Very happy" };
  if (score >= 65) return { emoji: "😃", label: "Happy" };
  if (score >= 50) return { emoji: "😐", label: "OK" };
  if (score >= 35) return { emoji: "🙁", label: "Not happy" };
  return { emoji: "😞", label: "Not happy at all" };
}

export function dimTone(value: number | null | undefined): "good" | "mid" | "low" | "none" {
  if (value == null) return "none";
  if (value >= 4) return "good";
  if (value >= 3) return "mid";
  return "low";
}

export function afterAuthPath(user: {
  role?: string;
  needsOnboarding?: boolean;
}) {
  if (user.role === "MODERATOR" || user.role === "ADMIN") {
    return "/moderation/insights";
  }
  if (user.needsOnboarding) return "/onboarding";
  return "/taskmatch";
}

export function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Turns API windows like "7d" / "90d" / "all" into "Last 7 days". */
export function formatPeriodLabel(period?: string | null) {
  if (!period || period === "all") return "All time";
  const days = period.match(/^(\d+)d$/i)?.[1];
  if (!days) return period;
  return `Last ${days} ${days === "1" ? "day" : "days"}`;
}

export const DIMENSION_LABELS: Record<string, string> = {
  overallExperience: "Overall experience",
  pay: "Pay",
  paymentReliability: "Payment reliability",
  taskAvailability: "Task availability",
  projectStability: "Project stability",
  reviewerFairness: "Reviewer fairness",
  guidelineClarity: "Guideline clarity",
  supportQuality: "Support",
  transparency: "Transparency",
  wouldWorkAgainRate: "Would work again",
};

/** Shorter labels so radar axes stay readable at small sizes. */
export const RADAR_DIMENSION_LABELS: Record<string, string> = {
  overallExperience: "Overall",
  pay: "Pay",
  paymentReliability: "Payments",
  taskAvailability: "Availability",
  projectStability: "Stability",
  reviewerFairness: "Fairness",
  guidelineClarity: "Clarity",
  supportQuality: "Support",
  transparency: "Transparency",
  wouldWorkAgainRate: "Rehire",
};

export const ISSUE_CATEGORIES = [
  "PAYMENT",
  "REVIEWER_DISPUTE",
  "PROJECT_REMOVAL",
  "ACCOUNT_SUSPENSION",
  "SUPPORT",
  "RATE_CHANGE",
  "UNPAID_ONBOARDING",
  "GUIDELINES",
  "TASK_AVAILABILITY",
  "REIMBURSEMENT",
  "THROTTLE_TASK_LIMIT",
  "PLATFORM_ERROR",
  "OTHER",
] as const;

export const DISCUSSION_CATEGORIES = [
  "GENERAL",
  "PAY",
  "TASK_AVAILABILITY",
  "ONBOARDING",
  "REVIEWERS",
  "SUPPORT",
  "SKILLS",
  "PLATFORM",
] as const;
