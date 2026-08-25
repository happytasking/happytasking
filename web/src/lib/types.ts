export type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type User = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  country: string | null;
  countryCode?: string | null;
  role: string;
  contributionScore: number;
  trustLevel: number;
  publicProfileEnabled: boolean;
  createdAt: string;
  companies?: CompanyMembership[];
  onboardingCompletedAt?: string | null;
  onboardingStartedAt?: string | null;
  onboardingVersion?: number | null;
  activatedAt?: string | null;
  needsOnboarding?: boolean;
};

export type AuthPayload = {
  user: User;
  token: string;
};

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

export type TaskScoreResult = {
  taskScore: number | null;
  dimensions: DimensionAverages;
  sampleSize: number;
  verifiedPct: number;
  period: string;
  confidence: {
    score: number;
    tier: "LOW" | "MEDIUM" | "HIGH";
    verifiedCount: number;
    communityCount: number;
    countryCount: number;
    recentCount: number;
  };
};

export type TaskPulse = {
  availability: "HIGH" | "MODERATE" | "LOW" | "NO_TASKS" | null;
  trend: "up" | "down" | "flat";
  sampleSize: number;
  last7Pct: number | null;
  previous7Pct: number | null;
  period: string;
};

export type LiveMarketRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  isDemo?: boolean;
  taskScore: number | null;
  sampleSize: number;
  insufficientData: boolean;
  confidence: TaskScoreResult["confidence"];
  pulse: TaskPulse;
  payStars: number | null;
  stabilityStars: number | null;
  medianEffectiveRate: number | null;
};

export type LiveMarket = {
  period: string;
  source: string;
  updatedAt: string;
  items: LiveMarketRow[];
};

export type PayByDomain = {
  domain: string;
  advertisedRate: number | null;
  effectiveRate: number | null;
  sampleSize: number;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string | null;
  logoUrl: string | null;
  headquarters: string | null;
  country: string | null;
  claimStatus?: string;
  companyStatus?: string;
  isDemo?: boolean;
  createdAt?: string;
  score?: TaskScoreResult;
  pulse?: TaskPulse;
  payByDomain?: PayByDomain[];
  topIssues?: { category: string; count: number }[];
  /** Weekly sentiment index for list-view sparklines. */
  scoreTrend?: (number | null)[];
};

/** Lightweight company reference embedded in reviews, discussions and issues. */
export type CompanyRef = {
  id?: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  claimStatus?: string;
};

/** A company profile the signed-in user is authorised to speak for. */
export type CompanyMembership = {
  slug: string;
  name: string;
  logoUrl: string | null;
  claimStatus: string;
  title: string | null;
  approved: boolean;
};

export type Domain = {
  id: string;
  name: string;
  slug: string;
  skills?: Skill[];
};

export type Skill = {
  id: string;
  name: string;
  slug: string;
  domainId?: string;
  domain?: Domain;
};

export type Review = {
  id: string;
  title: string;
  body: string;
  overallExperience: number;
  paySatisfaction: number;
  paymentReliability: number;
  taskAvailability: number;
  projectStability: number;
  reviewerFairness: number;
  guidelineClarity: number;
  supportQuality: number;
  transparency: number;
  flexibility?: number | null;
  wouldWorkAgain: boolean;
  identityMode: "ANONYMOUS" | "USERNAME";
  displayName: string | null;
  authorLabel: string;
  currentlyActive?: boolean | null;
  country?: string | null;
  isDemo?: boolean;
  createdAt: string;
  company?: CompanyRef;
  domain?: Domain | null;
  skills?: { skill: Skill }[];
};

export type Discussion = {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  isDemo?: boolean;
  voteScore?: number;
  company?: CompanyRef | null;
  domain?: Domain | null;
  skill?: Skill | null;
  author?: { username: string; displayName: string | null } | null;
  _count?: { comments: number };
  comments?: Comment[];
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author?: { username: string; displayName: string | null } | null;
  replies?: Comment[];
};

export type IssueReply = {
  id: string;
  role: "COMPANY" | "CONTRIBUTOR" | "MODERATOR";
  authorLabel: string;
  authorTitle: string | null;
  authorLogoUrl: string | null;
  isOfficial: boolean;
  isReporter: boolean;
  identityProtected: boolean;
  body: string;
  createdAt: string;
};

export type Issue = {
  publicId: string;
  category: string;
  title: string;
  body: string;
  desiredOutcome: string | null;
  verificationStatus: string;
  identity: string;
  identityProtected?: boolean;
  author?: { username: string; displayName: string | null } | null;
  status: string;
  resolutionStatus: string | null;
  resolutionSatisfaction: number | null;
  submittedAt: string;
  resolvedAt: string | null;
  isDemo: boolean;
  company: CompanyRef;
  replies?: IssueReply[];
  replyCount?: number;
  companyReplied?: boolean;
  /** False while the report is still in triage — only the reporter and company see it. */
  isPublic?: boolean;
  /** Present only when the request carried a session. */
  viewer?: {
    canReply: boolean;
    isReporter: boolean;
    isCompany: boolean;
    isModerator: boolean;
    /** The next workflow step this moderator may take, if any. */
    moderatorNextStatus?: "VERIFIED" | "PUBLISHED" | null;
    canProposeResolution?: boolean;
    canConfirmResolution?: boolean;
    /** A moderator closing out a report filed without an account. */
    confirmingForAbsentReporter?: boolean;
  } | null;
};

export type ResolutionOutcome = "RESOLVED" | "PARTIALLY_RESOLVED" | "UNRESOLVED";

export type MarketDashboard = {
  isDemo: boolean;
  label: string;
  pulse: {
    taskAvailability: string | null;
    medianEffectiveRate: number | null;
    workerSentiment: number | null;
    marketStability: string;
  };
  medianEffectiveByDomain: {
    domain: string;
    slug: string;
    medianEffectiveRate: number | null;
    sampleSize: number;
  }[];
  demand: {
    domain: string;
    slug: string;
    signal: "up" | "down" | "flat";
    recentReports: number;
  }[];
  stability: {
    company: string;
    slug: string;
    logoUrl?: string | null;
    stability: number | null;
    taskScore: number | null;
    availability: string | null;
    trend: "up" | "down" | "flat";
  }[];
  workerSentiment: number | null;
};

export type TrendPoint = {
  date: string;
  label: string;
  value: number | null;
  sampleSize: number;
};

export type AvailabilityDayPoint = {
  date: string;
  label: string;
  counts: {
    HIGH: number;
    MODERATE: number;
    LOW: number;
    NO_TASKS: number;
  };
  index: number | null;
  sampleSize: number;
};

export type PayTrendPoint = {
  label: string;
  date: string;
  advertised: number | null;
  effective: number | null;
  sampleSize: number;
};

export type CompanyTrends = {
  company: { name: string; slug: string; isDemo: boolean };
  taskScore: TrendPoint[];
  sentiment: TrendPoint[];
  reviewVolume: TrendPoint[];
  availability: AvailabilityDayPoint[];
  pay: PayTrendPoint[];
  dimensions: DimensionAverages;
};

export type MarketTrends = {
  isDemo: boolean;
  label: string;
  sentiment: TrendPoint[];
  reputation: TrendPoint[];
  availability: AvailabilityDayPoint[];
  payByDomainOverTime: {
    domain: string;
    slug: string;
    points: PayTrendPoint[];
    sampleSize: number;
  }[];
};

export type CreateReviewInput = {
  companySlug: string;
  domainId?: string;
  skillIds?: string[];
  country?: string;
  currentlyActive?: boolean;
  overallExperience: number;
  paySatisfaction: number;
  paymentReliability: number;
  taskAvailability: number;
  projectStability: number;
  reviewerFairness: number;
  guidelineClarity: number;
  supportQuality: number;
  transparency: number;
  flexibility?: number;
  wouldWorkAgain: boolean;
  title: string;
  body: string;
  identityMode: "ANONYMOUS" | "USERNAME";
  displayName?: string;
};

export type CreateIssueInput = {
  companySlug: string;
  category: string;
  title: string;
  body: string;
  desiredOutcome?: string;
  publicIdentityMode?: "ANONYMOUS" | "USERNAME";
};

export type CreateDiscussionInput = {
  title: string;
  body: string;
  category?: string;
  companySlug?: string;
  domainId?: string;
  skillId?: string;
};

export type Country = {
  code: string;
  name: string;
  flag: string;
};

export type TenureBucket = {
  value: string;
  label: string;
};

export type FieldVisibility = "PRIVATE" | "PUBLIC" | "AGGREGATE_ONLY";

export type OnboardingCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country?: string | null;
};

export type OnboardingExperienceDraft = {
  id?: string;
  companyId: string;
  company: OnboardingCompany;
  currentlyActive: boolean;
  tenureBucket: string | null;
  primaryDomainId: string | null;
  domain?: Domain | null;
  availabilityStatus?: "HIGH" | "MODERATE" | "LOW" | "NO_TASKS" | "SKIP" | null;
};

export type OnboardingState = {
  version: number;
  currentStep: string;
  skippedSections: string[];
  completed: boolean;
  startedAt: string | null;
  completedAt: string | null;
  catalog: {
    countries: Country[];
    domains: Domain[];
    skills: Skill[];
    allSkills: Skill[];
    tenureBuckets: TenureBucket[];
  };
  draft: {
    countryCode: string | null;
    country: string | null;
    domainIds: string[];
    skillIds: string[];
    experiences: OnboardingExperienceDraft[];
  };
};

export type ContributorProfile = User & {
  onboarding: {
    startedAt: string | null;
    completedAt: string | null;
    version: number | null;
    currentStep: string | null;
    skippedSections: string[];
    needsOnboarding: boolean;
  };
  isActivated: boolean;
  completion: {
    percent: number;
    items: { key: string; label: string; done: boolean }[];
  };
  visibility: {
    country: FieldVisibility;
    domains: FieldVisibility;
    skills: FieldVisibility;
    companyExperience: FieldVisibility;
  };
  domains: Domain[];
  skills: Skill[];
  experiences: {
    id: string;
    currentlyActive: boolean;
    tenureBucket: string | null;
    tenureLabel: string | null;
    company: OnboardingCompany;
    domain: Domain | null;
    updatedAt: string;
    confirmTenure: boolean;
  }[];
  badges: {
    type: string;
    awardedAt: string;
    label: string;
    tooltip: string | null;
  }[];
  foundingPeriodOpen: boolean;
};

export type MatchReason = { kind: "match" | "gap"; text: string };

export type MatchDimension = {
  key: string;
  label: string;
  score: number | null;
  weight?: number;
  source?: string;
};

export type OpportunityCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isDemo: boolean;
  };
  isDemo: boolean;
  featured: boolean;
  status: string;
  sourceType: string;
  sourceLabel: string;
  sourceUrl?: string | null;
  lastVerifiedAt: string | null;
  verifiedDaysAgo: number | null;
  stale: boolean;
  currency: string;
  minRate: number | null;
  maxRate: number | null;
  rateUnit: string | null;
  paymentModel: string;
  remoteType: string;
  domains: Domain[];
  skills: (Skill & { required: boolean })[];
  candidateMatch: {
    score: number | null;
    dimensions: MatchDimension[];
    reasons: MatchReason[];
  } | null;
  opportunityQuality: {
    score: number | null;
    insufficient: boolean;
    dimensions: MatchDimension[];
    companyLevel: boolean;
  };
  taskScore: number | null;
  pulse: TaskPulse;
  recommendation: string;
  recommendationLabel: string;
  confidence: "LOW" | "MODERATE" | "HIGH";
  saved: boolean;
};

export type TaskMatchList = {
  items: OpportunityCard[];
  strength: {
    percent: number;
    items: { key: string; label: string; done: boolean }[];
  } | null;
  personalized: boolean;
};

export type OpportunityDetail = OpportunityCard & {
  applicationUrl: string | null;
  applicationProcess: unknown;
  screeningType: string | null;
  estimatedProcessMinutes: number | null;
  countryRestrictions: string[];
  languageRequirements: string[];
  weeklyHoursMin: number | null;
  weeklyHoursMax: number | null;
  experienceYearsMin: number | null;
  experienceYearsPreferred: number | null;
  guide: {
    steps: { title: string; source: string }[];
    estimatedTime: string | null;
    difficulty: number | null;
    officialSourceUrl: string | null;
    officialSummary: string | null;
    communitySummary: string | null;
  } | null;
  communityTips: { id: string; body: string; isDemo: boolean }[];
  screening: { sampleSize: number; averageDifficulty: number | null };
  journey: string | null;
  readiness: {
    have: string[];
    before: string[];
    estimatedReadiness: number | null;
  } | null;
};

export type TaskMatchProfile = {
  country: string | null;
  countryCode: string | null;
  domains: string[];
  skills: {
    skillId: string;
    slug: string;
    name: string;
    proficiency?: string | null;
  }[];
  languages: { code: string; proficiency: string }[];
  preference: {
    lookingStatus: string | null;
    workload: string | null;
    startTiming: string | null;
    professionalExperienceYears: number | null;
    aiWorkExperienceYears: number | null;
    desiredRate: number | null;
    desiredRateCurrency: string;
    desiredRateUnit: string | null;
    paymentModelPreference: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    resumeUrl: string | null;
    summary: string | null;
    openToRecruiterContact: boolean;
  } | null;
  strength: {
    percent: number;
    items: { key: string; label: string; done: boolean }[];
  };
  openToRecruiterContact: boolean;
};

export type SkillGapResult = {
  strength: TaskMatchList["strength"];
  suggestions: {
    name: string;
    slug: string;
    opportunities: number;
    averageMaxRate: number | null;
  }[];
};

export type QuickPulseResult = {
  report: {
    availabilityStatus: string;
    company: { name: string; slug: string };
    domain: Domain | null;
  };
  pulse: TaskPulse;
};
