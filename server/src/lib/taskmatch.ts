export const TASKMATCH_WEIGHTS_KEY = "taskmatchWeights";

export type MatchWeights = {
  skills: number;
  experience: number;
  language: number;
  country: number;
  availability: number;
  rate: number;
};

export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  skills: 0.4,
  experience: 0.2,
  language: 0.1,
  country: 0.1,
  availability: 0.1,
  rate: 0.1,
};

export const PROFICIENCY_RANK: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

export type MatchDimension = {
  key: string;
  label: string;
  score: number | null;
  weight: number;
};

export type MatchReason = { kind: "match" | "gap"; text: string };

export type CandidateMatch = {
  score: number | null;
  dimensions: MatchDimension[];
  reasons: MatchReason[];
  availableDimensions: number;
};

export type CandidateProfileInput = {
  countryCode?: string | null;
  domainIds: string[];
  skills: { skillId: string; slug: string; name: string; proficiency?: string | null }[];
  languages: { code: string; proficiency: string }[];
  professionalExperienceYears?: number | null;
  aiWorkExperienceYears?: number | null;
  lookingStatus?: string | null;
  workload?: string | null;
  desiredRate?: number | null;
  desiredRateUnit?: string | null;
  companyIds: string[];
};

export type OpportunityInput = {
  domainIds: string[];
  skills: {
    skillId: string;
    slug: string;
    name: string;
    required: boolean;
    preferredLevel?: string | null;
  }[];
  countryRestrictions: string[];
  languageRequirements: string[];
  experienceYearsMin?: number | null;
  experienceYearsPreferred?: number | null;
  weeklyHoursMin?: number | null;
  weeklyHoursMax?: number | null;
  minRate?: number | null;
  maxRate?: number | null;
  rateUnit?: string | null;
};

export type QualityInput = {
  taskScore?: number | null;
  taskAvailability?: "HIGH" | "MODERATE" | "LOW" | "NO_TASKS" | null;
  pay?: number | null;
  stability?: number | null;
  paymentReliability?: number | null;
  reviewerFairness?: number | null;
  sentiment?: number | null;
  resolution?: number | null;
};

export type OpportunityQuality = {
  score: number | null;
  dimensions: { key: string; label: string; score: number | null; source: string }[];
  insufficient: boolean;
};

export type Recommendation =
  | "STRONG_MATCH"
  | "GOOD_FIT_WEAK_CONDITIONS"
  | "GOOD_OPPORTUNITY_SKILL_GAPS"
  | "LOW_PRIORITY";

export function band(score: number | null): "HIGH" | "MEDIUM" | "LOW" | "NONE" {
  if (score == null) return "NONE";
  if (score >= 80) return "HIGH";
  if (score >= 55) return "MEDIUM";
  return "LOW";
}

export function recommendationLabel(
  candidate: number | null,
  quality: number | null,
): Recommendation {
  const c = band(candidate);
  const q = band(quality);
  if (c === "HIGH" && (q === "HIGH" || q === "NONE")) return "STRONG_MATCH";
  if (c === "HIGH" && q !== "HIGH") return "GOOD_FIT_WEAK_CONDITIONS";
  if (c !== "HIGH" && (q === "HIGH" || q === "NONE")) {
    return c === "NONE" ? "LOW_PRIORITY" : "GOOD_OPPORTUNITY_SKILL_GAPS";
  }
  if (c === "MEDIUM" && q === "MEDIUM") return "GOOD_OPPORTUNITY_SKILL_GAPS";
  return "LOW_PRIORITY";
}

export function humanRecommendation(code: Recommendation): string {
  switch (code) {
    case "STRONG_MATCH":
      return "High match · strong opportunity";
    case "GOOD_FIT_WEAK_CONDITIONS":
      return "Good fit, weak current conditions";
    case "GOOD_OPPORTUNITY_SKILL_GAPS":
      return "Good opportunity, skill gaps";
    default:
      return "Low priority";
  }
}

const WORKLOAD_HOURS: Record<string, [number, number]> = {
  UNDER_10: [0, 10],
  TEN_TO_TWENTY: [10, 20],
  TWENTY_TO_THIRTY: [20, 30],
  THIRTY_TO_FORTY: [30, 40],
  FORTY_PLUS: [40, 80],
};

function weightedAverage(dims: MatchDimension[]): number | null {
  const usable = dims.filter((d) => d.score != null && d.weight > 0);
  if (!usable.length) return null;
  const weightSum = usable.reduce((s, d) => s + d.weight, 0);
  if (weightSum <= 0) return null;
  const total = usable.reduce((s, d) => s + (d.score as number) * d.weight, 0);
  return Math.round(total / weightSum);
}

function skillScore(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  reasons: MatchReason[],
): number | null {
  const required = opportunity.skills.filter((s) => s.required);
  const preferred = opportunity.skills.filter((s) => !s.required);
  if (!required.length && !preferred.length) return null;
  if (!profile.skills.length && required.length) {
    reasons.push({ kind: "gap", text: "Add skills to see a real skill match" });
    return 25;
  }

  const have = new Map(profile.skills.map((s) => [s.skillId, s]));
  let requiredPts = 0;
  for (const skill of required) {
    const user = have.get(skill.skillId);
    if (!user) {
      reasons.push({ kind: "gap", text: skill.name });
      continue;
    }
    let pts = 1;
    if (skill.preferredLevel && user.proficiency) {
      const need = PROFICIENCY_RANK[skill.preferredLevel] ?? 3;
      const got = PROFICIENCY_RANK[user.proficiency] ?? 2;
      if (got < need) {
        pts = 0.7;
        reasons.push({
          kind: "gap",
          text: `${skill.name} proficiency below preferred level`,
        });
      } else {
        reasons.push({ kind: "match", text: skill.name });
      }
    } else {
      reasons.push({ kind: "match", text: skill.name });
    }
    requiredPts += pts;
  }
  const requiredScore = required.length ? (requiredPts / required.length) * 100 : 100;

  let preferredScore = 100;
  if (preferred.length) {
    const hit = preferred.filter((s) => have.has(s.skillId)).length;
    preferredScore = (hit / preferred.length) * 100;
    for (const skill of preferred) {
      if (have.has(skill.skillId)) {
        reasons.push({ kind: "match", text: `${skill.name} (preferred)` });
      } else {
        reasons.push({ kind: "gap", text: `${skill.name} preferred` });
      }
    }
  }

  const domainBoost =
    opportunity.domainIds.length &&
    opportunity.domainIds.some((id) => profile.domainIds.includes(id))
      ? 4
      : 0;
  if (domainBoost) reasons.push({ kind: "match", text: "Relevant domain" });

  return Math.max(0, Math.min(100, Math.round(requiredScore * 0.85 + preferredScore * 0.15 + domainBoost)));
}

function experienceScore(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  reasons: MatchReason[],
): number | null {
  const years = profile.aiWorkExperienceYears ?? profile.professionalExperienceYears;
  if (years == null && !profile.companyIds.length) return null;
  const min = opportunity.experienceYearsMin;
  const preferred = opportunity.experienceYearsPreferred ?? min;
  if (min == null && preferred == null) {
    if ((years ?? 0) > 0 || profile.companyIds.length) {
      reasons.push({ kind: "match", text: "AI-work platform experience" });
      return years != null ? Math.min(100, 55 + years * 8) : 70;
    }
    return null;
  }
  const have = years ?? (profile.companyIds.length ? 1 : 0);
  if (have >= (preferred ?? min ?? 0)) {
    reasons.push({
      kind: "match",
      text: `${have}+ years relevant experience`,
    });
    return 100;
  }
  if (min != null && have >= min) {
    reasons.push({ kind: "match", text: "Meets minimum experience" });
    return 80;
  }
  if (min != null && have < min) {
    reasons.push({
      kind: "gap",
      text: `About ${min}+ years preferred`,
    });
    return Math.max(15, Math.round((have / min) * 70));
  }
  return 60;
}

function languageScore(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  reasons: MatchReason[],
): number | null {
  const needed = opportunity.languageRequirements;
  if (!needed.length) return null;
  if (!profile.languages.length) {
    reasons.push({ kind: "gap", text: "Add languages to confirm eligibility" });
    return 40;
  }
  const have = new Set(profile.languages.map((l) => l.code.toLowerCase()));
  let hit = 0;
  for (const code of needed) {
    if (have.has(code.toLowerCase())) {
      hit += 1;
      reasons.push({ kind: "match", text: code.toUpperCase() });
    } else {
      reasons.push({ kind: "gap", text: `${code.toUpperCase()} required` });
    }
  }
  return Math.round((hit / needed.length) * 100);
}

function countryScore(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  reasons: MatchReason[],
): number | null {
  const allowed = opportunity.countryRestrictions.map((c) => c.toUpperCase());
  if (!allowed.length) {
    reasons.push({ kind: "match", text: "Open to most markets" });
    return 100;
  }
  if (!profile.countryCode) {
    reasons.push({ kind: "gap", text: "Add your country to confirm eligibility" });
    return 45;
  }
  if (allowed.includes(profile.countryCode.toUpperCase())) {
    reasons.push({ kind: "match", text: "Country eligible" });
    return 100;
  }
  reasons.push({ kind: "gap", text: "Country may not be eligible" });
  return 0;
}

function availabilityScore(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  reasons: MatchReason[],
): number | null {
  if (!profile.lookingStatus && !profile.workload) return null;
  let score = 70;
  if (profile.lookingStatus === "READY") {
    score = 100;
    reasons.push({ kind: "match", text: "Ready for new AI work" });
  } else if (profile.lookingStatus === "OPEN_TO_OFFERS") {
    score = 80;
    reasons.push({ kind: "match", text: "Open to good opportunities" });
  } else if (profile.lookingStatus === "NOT_LOOKING") {
    score = 20;
    reasons.push({ kind: "gap", text: "Marked as not looking right now" });
  }

  if (profile.workload && (opportunity.weeklyHoursMin || opportunity.weeklyHoursMax)) {
    const [lo, hi] = WORKLOAD_HOURS[profile.workload] ?? [0, 40];
    const oppLo = opportunity.weeklyHoursMin ?? 0;
    const oppHi = opportunity.weeklyHoursMax ?? 80;
    const overlap = Math.min(hi, oppHi) - Math.max(lo, oppLo);
    if (overlap < 0) {
      score = Math.min(score, 45);
      reasons.push({ kind: "gap", text: "Preferred hours may not overlap" });
    }
  }
  return score;
}

function rateScore(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  reasons: MatchReason[],
): number | null {
  if (profile.desiredRate == null) return null;
  if (opportunity.minRate == null && opportunity.maxRate == null) return null;
  const want = profile.desiredRate;
  const min = opportunity.minRate ?? opportunity.maxRate ?? want;
  const max = opportunity.maxRate ?? opportunity.minRate ?? want;
  if (want <= max && want >= min * 0.7) {
    reasons.push({ kind: "match", text: "Rate range overlaps your target" });
    return 95;
  }
  if (want <= max * 1.15) {
    reasons.push({ kind: "match", text: "Rate is close to your target" });
    return 75;
  }
  if (want > max) {
    reasons.push({ kind: "gap", text: "Listed pay is below your target" });
    const ratio = max / want;
    return Math.max(10, Math.round(ratio * 70));
  }
  return 70;
}

export function computeCandidateMatch(
  profile: CandidateProfileInput,
  opportunity: OpportunityInput,
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS,
): CandidateMatch {
  const reasons: MatchReason[] = [];
  const dimensions: MatchDimension[] = [
    {
      key: "skills",
      label: "Skills",
      score: skillScore(profile, opportunity, reasons),
      weight: weights.skills,
    },
    {
      key: "experience",
      label: "Experience",
      score: experienceScore(profile, opportunity, reasons),
      weight: weights.experience,
    },
    {
      key: "language",
      label: "Language",
      score: languageScore(profile, opportunity, reasons),
      weight: weights.language,
    },
    {
      key: "country",
      label: "Country",
      score: countryScore(profile, opportunity, reasons),
      weight: weights.country,
    },
    {
      key: "availability",
      label: "Availability",
      score: availabilityScore(profile, opportunity, reasons),
      weight: weights.availability,
    },
    {
      key: "rate",
      label: "Rate fit",
      score: rateScore(profile, opportunity, reasons),
      weight: weights.rate,
    },
  ];

  return {
    score: weightedAverage(dimensions),
    dimensions,
    reasons,
    availableDimensions: dimensions.filter((d) => d.score != null).length,
  };
}

const PULSE_SCORE = {
  HIGH: 95,
  MODERATE: 70,
  LOW: 40,
  NO_TASKS: 15,
} as const;

export function computeOpportunityQuality(input: QualityInput): OpportunityQuality {
  const dimensions = [
    {
      key: "taskScore",
      label: "TaskScore",
      score: input.taskScore ?? null,
      source: "Company-level community data",
    },
    {
      key: "availability",
      label: "Task availability",
      score: input.taskAvailability ? PULSE_SCORE[input.taskAvailability] : null,
      source: "TaskPulse · last 7 days",
    },
    {
      key: "pay",
      label: "Pay",
      score: input.pay ?? null,
      source: "Company-level community data",
    },
    {
      key: "stability",
      label: "Stability",
      score: input.stability ?? null,
      source: "Company-level community data",
    },
    {
      key: "paymentReliability",
      label: "Payment reliability",
      score: input.paymentReliability ?? null,
      source: "Company-level community data",
    },
    {
      key: "reviewerFairness",
      label: "Reviewer fairness",
      score: input.reviewerFairness ?? null,
      source: "Company-level community data",
    },
    {
      key: "sentiment",
      label: "Worker sentiment",
      score: input.sentiment ?? null,
      source: "Company-level community data",
    },
    {
      key: "resolution",
      label: "Resolution",
      score: input.resolution ?? null,
      source: "Company-level community data",
    },
  ];
  const usable = dimensions.filter((d) => d.score != null);
  if (!usable.length) {
    return { score: null, dimensions, insufficient: true };
  }
  const score = Math.round(usable.reduce((s, d) => s + (d.score as number), 0) / usable.length);
  return { score, dimensions, insufficient: usable.length < 2 };
}

export function matchConfidence(opts: {
  profileFieldsFilled: number;
  profileFieldsTotal: number;
  opportunityComplete: boolean;
  verifiedDaysAgo: number | null;
  availableDimensions: number;
}): "LOW" | "MODERATE" | "HIGH" {
  const completeness = opts.profileFieldsFilled / Math.max(1, opts.profileFieldsTotal);
  let points = completeness * 40;
  points += Math.min(opts.availableDimensions / 6, 1) * 30;
  if (opts.opportunityComplete) points += 15;
  if (opts.verifiedDaysAgo != null) {
    if (opts.verifiedDaysAgo <= 7) points += 15;
    else if (opts.verifiedDaysAgo <= 30) points += 8;
    else points -= 15;
  } else {
    points -= 5;
  }
  // A high score from 1–2 profile fields should not look highly confident.
  if (completeness < 0.3) points = Math.min(points, 39);
  if (points >= 70) return "HIGH";
  if (points >= 40) return "MODERATE";
  return "LOW";
}

export function profileStrengthItems(input: {
  country: boolean;
  domains: boolean;
  skills: boolean;
  companies: boolean;
  availability: boolean;
  desiredRate: boolean;
  languages: boolean;
  experience: boolean;
  github: boolean;
  links: boolean;
}) {
  const items = [
    { key: "country", label: "Country", done: input.country },
    { key: "domains", label: "Domains", done: input.domains },
    { key: "skills", label: "Skills", done: input.skills },
    { key: "companies", label: "Platform experience", done: input.companies },
    { key: "availability", label: "Availability", done: input.availability },
    { key: "desiredRate", label: "Desired rate", done: input.desiredRate },
    { key: "languages", label: "Languages", done: input.languages },
    { key: "experience", label: "Professional experience", done: input.experience },
    { key: "github", label: "GitHub", done: input.github },
    { key: "links", label: "LinkedIn / portfolio", done: input.links },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return { percent, items };
}
