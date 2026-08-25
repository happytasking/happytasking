export const CURRENT_ONBOARDING_VERSION = 1;

export const ONBOARDING_STEPS = [
  "welcome",
  "country",
  "domains",
  "skills",
  "companies",
  "done",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const TENURE_BUCKETS = [
  { value: "LESS_THAN_1_MONTH", label: "Less than 1 month" },
  { value: "ONE_TO_THREE_MONTHS", label: "1–3 months" },
  { value: "THREE_TO_SIX_MONTHS", label: "3–6 months" },
  { value: "SIX_TO_TWELVE_MONTHS", label: "6–12 months" },
  { value: "ONE_TO_TWO_YEARS", label: "1–2 years" },
  { value: "TWO_PLUS_YEARS", label: "2+ years" },
] as const;

export const FOUNDING_TASKER_SETTING_KEY = "foundingTasker";

export type FoundingTaskerSetting = {
  open: boolean;
  endsAt: string | null;
  requireContribution: boolean;
  requireOnboarding: boolean;
};

export const DEFAULT_FOUNDING_TASKER: FoundingTaskerSetting = {
  open: true,
  endsAt: null,
  requireContribution: true,
  requireOnboarding: true,
};
