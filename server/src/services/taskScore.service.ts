export type TaskScoreWeights = {
  overallExperience: number;
  paySatisfaction: number;
  paymentReliability: number;
  taskAvailability: number;
  projectStability: number;
  reviewerFairness: number;
  guidelineClarity: number;
  supportQuality: number;
  transparency: number;
  wouldWorkAgain: number;
};

/** Configurable weights — do not hardcode in UI. Scale inputs 1–5 → 0–100. */
export const DEFAULT_TASKSCORE_WEIGHTS: TaskScoreWeights = {
  overallExperience: 0.15,
  paySatisfaction: 0.12,
  paymentReliability: 0.14,
  taskAvailability: 0.12,
  projectStability: 0.12,
  reviewerFairness: 0.1,
  guidelineClarity: 0.08,
  supportQuality: 0.07,
  transparency: 0.05,
  wouldWorkAgain: 0.05,
};

export type ReviewDimensions = {
  overallExperience: number;
  paySatisfaction: number;
  paymentReliability: number;
  taskAvailability: number;
  projectStability: number;
  reviewerFairness: number;
  guidelineClarity: number;
  supportQuality: number;
  transparency: number;
  wouldWorkAgain: boolean;
  verificationStatus?: string;
  countryCode?: string | null;
  country?: string | null;
  createdAt?: Date | string;
};

export const TASK_SCORE_REVIEW_SELECT = {
  overallExperience: true,
  paySatisfaction: true,
  paymentReliability: true,
  taskAvailability: true,
  projectStability: true,
  reviewerFairness: true,
  guidelineClarity: true,
  supportQuality: true,
  transparency: true,
  wouldWorkAgain: true,
  verificationStatus: true,
  countryCode: true,
  country: true,
  createdAt: true,
} as const;

export type DimensionAverages = {
  overallExperience: number | null;
  pay: number | null;
  paymentReliability: number | null;
  taskAvailability: number | null;
  projectStability: number | null;
  reviewerFairness: number | null;
  guidelineClarity: number | null;
  supportQuality: number | null;
  transparency: number | null;
  wouldWorkAgainRate: number | null;
};

export const MIN_PUBLIC_SAMPLE_SIZE = 5;
export const CONFIDENCE_RECENCY_DAYS = 90;

export type ConfidenceTier = "LOW" | "MEDIUM" | "HIGH";

export type AggregateConfidence = {
  score: number;
  tier: ConfidenceTier;
  verifiedCount: number;
  communityCount: number;
  countryCount: number;
  recentCount: number;
};

export type TaskScoreResult = {
  taskScore: number | null;
  dimensions: DimensionAverages;
  sampleSize: number;
  verifiedPct: number;
  period: string;
  confidence: AggregateConfidence;
};

function avg(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function scaleTo100(score1to5: number | null): number | null {
  if (score1to5 == null) return null;
  return Math.round(((score1to5 - 1) / 4) * 100);
}

export function hasMinimumPublicSample(sampleSize: number): boolean {
  return sampleSize >= MIN_PUBLIC_SAMPLE_SIZE;
}

/**
 * Confidence (0–100) is the rounded sum of:
 * - sample size: up to 40 points, saturating at 20 contributions;
 * - verification: up to 25 points from the verified share;
 * - country diversity: up to 15 points, saturating at 5 countries;
 * - recency: up to 20 points from the share submitted in the last 90 days.
 *
 * Tiers are LOW < 40, MEDIUM < 70, and HIGH >= 70. The calculation is
 * deterministic for the supplied reviews and `asOf` timestamp.
 */
export function computeAggregateConfidence(
  reviews: Pick<
    ReviewDimensions,
    "verificationStatus" | "countryCode" | "country" | "createdAt"
  >[],
  asOf: Date = new Date(),
): AggregateConfidence {
  const sampleSize = reviews.length;
  const verifiedCount = reviews.filter(
    (review) => review.verificationStatus === "VERIFIED",
  ).length;
  const communityCount = sampleSize - verifiedCount;
  const countries = new Set(
    reviews
      .map((review) => review.countryCode ?? review.country)
      .filter((country): country is string => Boolean(country?.trim()))
      .map((country) => country.trim().toUpperCase()),
  );
  const recentThreshold = new Date(asOf);
  recentThreshold.setUTCDate(
    recentThreshold.getUTCDate() - CONFIDENCE_RECENCY_DAYS,
  );
  const recentCount = reviews.filter((review) => {
    if (review.createdAt == null) return false;
    const createdAt = new Date(review.createdAt);
    return (
      !Number.isNaN(createdAt.getTime()) &&
      createdAt >= recentThreshold &&
      createdAt <= asOf
    );
  }).length;

  const samplePoints = Math.min(sampleSize / 20, 1) * 40;
  const verificationPoints =
    sampleSize === 0 ? 0 : (verifiedCount / sampleSize) * 25;
  const countryPoints = Math.min(countries.size / 5, 1) * 15;
  const recencyPoints =
    sampleSize === 0 ? 0 : (recentCount / sampleSize) * 20;
  const score = Math.round(
    samplePoints + verificationPoints + countryPoints + recencyPoints,
  );
  const tier: ConfidenceTier =
    score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";

  return {
    score,
    tier,
    verifiedCount,
    communityCount,
    countryCount: countries.size,
    recentCount,
  };
}

export function computeTaskScore(
  reviews: ReviewDimensions[],
  period: string,
  weights: TaskScoreWeights = DEFAULT_TASKSCORE_WEIGHTS,
  asOf: Date = new Date(),
): TaskScoreResult {
  const sampleSize = reviews.length;
  const confidence = computeAggregateConfidence(reviews, asOf);
  if (sampleSize === 0) {
    return {
      taskScore: null,
      dimensions: {
        overallExperience: null,
        pay: null,
        paymentReliability: null,
        taskAvailability: null,
        projectStability: null,
        reviewerFairness: null,
        guidelineClarity: null,
        supportQuality: null,
        transparency: null,
        wouldWorkAgainRate: null,
      },
      sampleSize: 0,
      verifiedPct: 0,
      period,
      confidence,
    };
  }

  const verifiedCount = reviews.filter(
    (r) => r.verificationStatus === "VERIFIED",
  ).length;
  const verifiedPct = Math.round((verifiedCount / sampleSize) * 1000) / 10;

  const dimensions: DimensionAverages = {
    overallExperience: scaleTo100(avg(reviews.map((r) => r.overallExperience))),
    pay: scaleTo100(avg(reviews.map((r) => r.paySatisfaction))),
    paymentReliability: scaleTo100(
      avg(reviews.map((r) => r.paymentReliability)),
    ),
    taskAvailability: scaleTo100(avg(reviews.map((r) => r.taskAvailability))),
    projectStability: scaleTo100(avg(reviews.map((r) => r.projectStability))),
    reviewerFairness: scaleTo100(avg(reviews.map((r) => r.reviewerFairness))),
    guidelineClarity: scaleTo100(avg(reviews.map((r) => r.guidelineClarity))),
    supportQuality: scaleTo100(avg(reviews.map((r) => r.supportQuality))),
    transparency: scaleTo100(avg(reviews.map((r) => r.transparency))),
    wouldWorkAgainRate:
      Math.round(
        (reviews.filter((r) => r.wouldWorkAgain).length / sampleSize) * 1000,
      ) / 10,
  };

  const weighted =
    (dimensions.overallExperience ?? 0) * weights.overallExperience +
    (dimensions.pay ?? 0) * weights.paySatisfaction +
    (dimensions.paymentReliability ?? 0) * weights.paymentReliability +
    (dimensions.taskAvailability ?? 0) * weights.taskAvailability +
    (dimensions.projectStability ?? 0) * weights.projectStability +
    (dimensions.reviewerFairness ?? 0) * weights.reviewerFairness +
    (dimensions.guidelineClarity ?? 0) * weights.guidelineClarity +
    (dimensions.supportQuality ?? 0) * weights.supportQuality +
    (dimensions.transparency ?? 0) * weights.transparency +
    (dimensions.wouldWorkAgainRate ?? 0) * weights.wouldWorkAgain;

  return {
    taskScore: Math.round(weighted),
    dimensions,
    sampleSize,
    verifiedPct,
    period,
    confidence,
  };
}

export function periodStartDate(period: string, now = new Date()): Date | null {
  const d = new Date(now);
  switch (period) {
    case "7d":
      d.setDate(d.getDate() - 7);
      return d;
    case "30d":
      d.setDate(d.getDate() - 30);
      return d;
    case "90d":
      d.setDate(d.getDate() - 90);
      return d;
    case "all":
    default:
      return null;
  }
}
