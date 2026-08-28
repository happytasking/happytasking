import { z } from "zod";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { trackEvent } from "./analytics.service.js";
import {
  getOpportunityQualityMap,
  type CompanyIntelligence,
} from "./opportunityQuality.service.js";
import {
  DEFAULT_MATCH_WEIGHTS,
  TASKMATCH_WEIGHTS_KEY,
  computeCandidateMatch,
  humanRecommendation,
  matchConfidence,
  profileStrengthItems,
  recommendationLabel,
  type CandidateProfileInput,
  type MatchWeights,
} from "../lib/taskmatch.js";
import {
  hasPublicCommunityIntelligence,
  isPublicOpportunityCatalogItem,
  publicOpportunityCatalogWhere,
} from "../lib/taskmatchPublic.js";
import { resolveApplicationDestination } from "../opportunities/referrals.js";
import { brazilEligibleLabel } from "../opportunities/country.js";

const lookingEnum = z.enum(["READY", "OPEN_TO_OFFERS", "NOT_LOOKING"]);
const workloadEnum = z.enum([
  "UNDER_10",
  "TEN_TO_TWENTY",
  "TWENTY_TO_THIRTY",
  "THIRTY_TO_FORTY",
  "FORTY_PLUS",
]);
const startEnum = z.enum([
  "IMMEDIATELY",
  "WITHIN_1_WEEK",
  "WITHIN_2_WEEKS",
  "WITHIN_1_MONTH",
  "EXPLORING",
]);
const proficiencyEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]);
const languageProfEnum = z.enum([
  "BASIC",
  "CONVERSATIONAL",
  "PROFESSIONAL",
  "NATIVE",
]);

export const taskmatchProfileSchema = z.object({
  lookingStatus: lookingEnum.optional().nullable(),
  workload: workloadEnum.optional().nullable(),
  startTiming: startEnum.optional().nullable(),
  professionalExperienceYears: z.number().min(0).max(60).optional().nullable(),
  aiWorkExperienceYears: z.number().min(0).max(40).optional().nullable(),
  desiredRate: z.number().positive().max(10000).optional().nullable(),
  desiredRateCurrency: z.string().min(3).max(8).optional(),
  desiredRateUnit: z.enum(["HOURLY", "PER_TASK", "MILESTONE"]).optional().nullable(),
  paymentModelPreference: z
    .enum(["HOURLY", "PER_TASK", "MILESTONE", "MIXED"])
    .optional()
    .nullable(),
  linkedinUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
  githubUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
  portfolioUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
  resumeUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
  summary: z.string().max(2000).optional().nullable(),
  openToRecruiterContact: z.boolean().optional(),
  languages: z
    .array(
      z.object({
        code: z.string().min(2).max(8),
        proficiency: languageProfEnum,
      }),
    )
    .max(12)
    .optional(),
  skillProficiency: z
    .array(
      z.object({
        skillId: z.string(),
        proficiency: proficiencyEnum,
      }),
    )
    .max(30)
    .optional(),
});

export const matchQuerySchema = z.object({
  domain: z.string().optional(),
  skill: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  remote: z.enum(["true", "false"]).optional(),
  pulse: z.enum(["HIGH", "MODERATE", "LOW", "NO_TASKS"]).optional(),
  minTaskScore: z.coerce.number().min(0).max(100).optional(),
  minQuality: z.coerce.number().min(0).max(100).optional(),
  minRate: z.coerce.number().min(0).optional(),
  paymentModel: z.enum(["HOURLY", "PER_TASK", "MILESTONE", "MIXED"]).optional(),
  workload: workloadEnum.optional(),
  includeWorkedWith: z.enum(["true", "false"]).optional(),
  sort: z
    .enum([
      "recommended",
      "match",
      "quality",
      "pay",
      "taskscore",
      "newest",
      "recent",
      "verified",
    ])
    .optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export const journeySchema = z.object({
  status: z.enum([
    "SAVED",
    "APPLIED",
    "SCREENING",
    "QUALIFIED",
    "MATCHED",
    "WORKING",
    "REJECTED",
    "WITHDRAWN",
  ]),
  note: z.string().max(500).optional(),
});

async function getWeights(): Promise<MatchWeights> {
  const row = await prisma.platformSetting.findUnique({
    where: { key: TASKMATCH_WEIGHTS_KEY },
  });
  if (!row || typeof row.value !== "object" || row.value === null) {
    return DEFAULT_MATCH_WEIGHTS;
  }
  return { ...DEFAULT_MATCH_WEIGHTS, ...(row.value as Partial<MatchWeights>) };
}

export const opportunityAdminSchema = z.object({
  companySlug: z.string().min(1),
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(180).optional(),
  description: z.string().max(8000).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED", "EXPIRED", "UNKNOWN"]).optional(),
  sourceType: z
    .enum(["ADMIN", "PUBLIC_LISTING", "COMPANY_SUBMITTED", "COMMUNITY_REPORTED"])
    .optional(),
  sourceUrl: z.string().url().max(500).optional().nullable(),
  countryRestrictions: z.array(z.string().min(2).max(8)).max(80).optional(),
  remoteType: z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
  paymentModel: z.enum(["HOURLY", "PER_TASK", "MILESTONE", "MIXED"]).optional(),
  currency: z.string().min(3).max(8).optional(),
  minRate: z.number().min(0).max(10000).optional().nullable(),
  maxRate: z.number().min(0).max(10000).optional().nullable(),
  rateUnit: z.enum(["HOURLY", "PER_TASK", "MILESTONE"]).optional(),
  weeklyHoursMin: z.number().int().min(0).max(80).optional().nullable(),
  weeklyHoursMax: z.number().int().min(0).max(80).optional().nullable(),
  experienceYearsMin: z.number().min(0).max(40).optional().nullable(),
  experienceYearsPreferred: z.number().min(0).max(40).optional().nullable(),
  languageRequirements: z.array(z.string().min(2).max(8)).max(12).optional(),
  applicationUrl: z.string().url().max(500).optional().nullable(),
  screeningType: z.string().max(80).optional().nullable(),
  estimatedProcessMinutes: z.number().int().min(0).max(2000).optional().nullable(),
  isDemo: z.boolean().optional(),
  featured: z.boolean().optional(),
  skillSlugs: z
    .array(
      z.object({
        slug: z.string(),
        required: z.boolean().optional(),
        preferredLevel: proficiencyEnum.optional().nullable(),
      }),
    )
    .max(30)
    .optional(),
  domainSlugs: z.array(z.string()).max(12).optional(),
});

export async function loadCandidateProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      domains: true,
      skills: { include: { skill: true } },
      languages: true,
      workPreference: true,
      experiences: { select: { companyId: true } },
    },
  });
  if (!user) throw new ApiError(404, "User not found");
  const pref = user.workPreference;
  const input: CandidateProfileInput = {
    countryCode: user.countryCode,
    domainIds: user.domains.map((d) => d.domainId),
    skills: user.skills.map((s) => ({
      skillId: s.skillId,
      slug: s.skill.slug,
      name: s.skill.name,
      proficiency: s.proficiency,
    })),
    languages: user.languages.map((l) => ({
      code: l.code,
      proficiency: l.proficiency,
    })),
    professionalExperienceYears: pref?.professionalExperienceYears ?? null,
    aiWorkExperienceYears: pref?.aiWorkExperienceYears ?? null,
    lookingStatus: pref?.lookingStatus ?? null,
    workload: pref?.workload ?? null,
    desiredRate: pref?.desiredRate ?? null,
    desiredRateUnit: pref?.desiredRateUnit ?? null,
    companyIds: user.experiences.map((e) => e.companyId),
  };
  const strength = profileStrengthItems({
    country: Boolean(user.countryCode),
    domains: user.domains.length > 0,
    skills: user.skills.length > 0,
    companies: user.experiences.length > 0,
    availability: Boolean(pref?.lookingStatus),
    desiredRate: pref?.desiredRate != null,
    languages: user.languages.length > 0,
    experience:
      pref?.professionalExperienceYears != null ||
      pref?.aiWorkExperienceYears != null,
    github: Boolean(pref?.githubUrl),
    links: Boolean(pref?.linkedinUrl || pref?.portfolioUrl),
  });
  return {
    input,
    strength,
    preference: user.workPreference,
    country: user.country,
    countryCode: user.countryCode,
  };
}

function emptyToNull(value?: string | null) {
  if (value === "" || value == null) return null;
  return value;
}

export async function updateTaskmatchProfile(
  userId: string,
  input: z.infer<typeof taskmatchProfileSchema>,
) {
  await prisma.userWorkPreference.upsert({
    where: { userId },
    create: {
      userId,
      lookingStatus: input.lookingStatus ?? undefined,
      workload: input.workload ?? undefined,
      startTiming: input.startTiming ?? undefined,
      professionalExperienceYears: input.professionalExperienceYears ?? undefined,
      aiWorkExperienceYears: input.aiWorkExperienceYears ?? undefined,
      desiredRate: input.desiredRate ?? undefined,
      desiredRateCurrency: input.desiredRateCurrency,
      desiredRateUnit: input.desiredRateUnit ?? undefined,
      paymentModelPreference: input.paymentModelPreference ?? undefined,
      linkedinUrl: emptyToNull(input.linkedinUrl),
      githubUrl: emptyToNull(input.githubUrl),
      portfolioUrl: emptyToNull(input.portfolioUrl),
      resumeUrl: emptyToNull(input.resumeUrl),
      summary: input.summary ?? undefined,
      openToRecruiterContact: input.openToRecruiterContact ?? false,
    },
    update: {
      lookingStatus: input.lookingStatus === undefined ? undefined : input.lookingStatus,
      workload: input.workload === undefined ? undefined : input.workload,
      startTiming: input.startTiming === undefined ? undefined : input.startTiming,
      professionalExperienceYears:
        input.professionalExperienceYears === undefined
          ? undefined
          : input.professionalExperienceYears,
      aiWorkExperienceYears:
        input.aiWorkExperienceYears === undefined
          ? undefined
          : input.aiWorkExperienceYears,
      desiredRate: input.desiredRate === undefined ? undefined : input.desiredRate,
      desiredRateCurrency: input.desiredRateCurrency,
      desiredRateUnit:
        input.desiredRateUnit === undefined ? undefined : input.desiredRateUnit,
      paymentModelPreference:
        input.paymentModelPreference === undefined
          ? undefined
          : input.paymentModelPreference,
      linkedinUrl:
        input.linkedinUrl === undefined ? undefined : emptyToNull(input.linkedinUrl),
      githubUrl: input.githubUrl === undefined ? undefined : emptyToNull(input.githubUrl),
      portfolioUrl:
        input.portfolioUrl === undefined ? undefined : emptyToNull(input.portfolioUrl),
      resumeUrl: input.resumeUrl === undefined ? undefined : emptyToNull(input.resumeUrl),
      summary: input.summary === undefined ? undefined : input.summary,
      openToRecruiterContact: input.openToRecruiterContact,
    },
  });

  if (input.languages) {
    await prisma.$transaction([
      prisma.userLanguage.deleteMany({ where: { userId } }),
      ...(input.languages.length
        ? [
            prisma.userLanguage.createMany({
              data: input.languages.map((l) => ({
                userId,
                code: l.code.toLowerCase(),
                proficiency: l.proficiency,
              })),
            }),
          ]
        : []),
    ]);
  }

  if (input.skillProficiency?.length) {
    await Promise.all(
      input.skillProficiency.map((row) =>
        prisma.userSkill.updateMany({
          where: { userId, skillId: row.skillId },
          data: { proficiency: row.proficiency },
        }),
      ),
    );
  }

  await trackEvent("profile_improvement_completed", { userId });
  return getTaskmatchProfile(userId);
}

export async function getTaskmatchProfile(userId: string) {
  const { input, strength, preference, country, countryCode } =
    await loadCandidateProfile(userId);
  return {
    country,
    countryCode,
    domains: input.domainIds,
    skills: input.skills,
    languages: input.languages,
    preference,
    strength,
    openToRecruiterContact: preference?.openToRecruiterContact ?? false,
  };
}

const opportunityInclude = {
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      isDemo: true,
      companyStatus: true,
    },
  },
  skills: { include: { skill: true } },
  domains: { include: { domain: true } },
} as const;

type OpportunityRow = Awaited<
  ReturnType<typeof prisma.opportunity.findFirst<{ include: typeof opportunityInclude }>>
>;

function daysAgo(date?: Date | null) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function sourceLabel(type: string, discoverySource?: string | null) {
  switch (type) {
    case "PUBLIC_LISTING":
      return "Official public listing";
    case "AUTHORIZED_AGGREGATOR":
      return discoverySource
        ? `Discovered through ${discoverySource}`
        : "Discovered through a public aggregator";
    case "PUBLIC_FEED":
    case "PUBLIC_API":
    case "PUBLIC_PAGE":
      return "Public listing";
    case "COMPANY_SUBMITTED":
      return "Company-submitted";
    case "COMMUNITY_REPORTED":
      return "Community reported";
    default:
      return "Happy Tasking curated";
  }
}

function scoreOpportunity(
  opp: NonNullable<OpportunityRow>,
  intel: CompanyIntelligence,
  profile: Awaited<ReturnType<typeof loadCandidateProfile>> | null,
  weights: MatchWeights,
  savedIds: Set<string>,
) {
  const candidate = profile
    ? computeCandidateMatch(
        profile.input,
        {
          domainIds: opp.domains.map((d) => d.domainId),
          skills: opp.skills.map((s) => ({
            skillId: s.skillId,
            slug: s.skill.slug,
            name: s.skill.name,
            required: s.required,
            preferredLevel: s.preferredLevel,
          })),
          countryRestrictions: opp.countryRestrictions,
          languageRequirements: opp.languageRequirements,
          experienceYearsMin: opp.experienceYearsMin,
          experienceYearsPreferred: opp.experienceYearsPreferred,
          weeklyHoursMin: opp.weeklyHoursMin,
          weeklyHoursMax: opp.weeklyHoursMax,
          minRate: opp.minRate,
          maxRate: opp.maxRate,
          rateUnit: opp.rateUnit,
        },
        weights,
      )
    : null;

  const rec = recommendationLabel(candidate?.score ?? null, intel.quality.score);
  const confidence = profile
    ? matchConfidence({
        profileFieldsFilled: profile.strength.items.filter((i) => i.done).length,
        profileFieldsTotal: profile.strength.items.length,
        opportunityComplete: Boolean(opp.description && opp.applicationUrl),
        verifiedDaysAgo: daysAgo(opp.lastVerifiedAt),
        availableDimensions: candidate?.availableDimensions ?? 0,
      })
    : "LOW";

  return {
    id: opp.id,
    slug: opp.slug,
    title: opp.title,
    description: opp.description,
    company: opp.company,
    isDemo: opp.isDemo,
    featured: opp.featured,
    status: opp.status,
    sourceType: opp.sourceType,
    sourceLabel: sourceLabel(opp.sourceType, opp.discoverySource),
    sourceUrl: opp.sourceUrl,
    primarySource: opp.primarySource,
    primarySourceUrl: opp.primarySourceUrl,
    discoverySource: opp.discoverySource,
    discoveryUrl: opp.discoveryUrl,
    discoveryNote:
      opp.sourceType === "PUBLIC_LISTING" && opp.discoverySource
        ? `Discovered through ${opp.discoverySource}.`
        : null,
    lastVerifiedAt: opp.lastVerifiedAt,
    firstSeenAt: opp.firstSeenAt,
    publishedAt: opp.publishedAt,
    verifiedDaysAgo: daysAgo(opp.lastVerifiedAt),
    stale: opp.status === "STALE" || (daysAgo(opp.lastVerifiedAt) ?? 99) > 14,
    currency: opp.currency,
    minRate: opp.minRate,
    maxRate: opp.maxRate,
    rateUnit: opp.rateUnit,
    paymentModel: opp.paymentModel,
    remoteType: opp.remoteType,
    locationText: opp.locationText,
    countryRestrictions: opp.countryRestrictions,
    countryEligibility: opp.countryEligibility,
    countryLabel: brazilEligibleLabel({
      eligibility: opp.countryEligibility,
      codes: opp.countryRestrictions,
    }),
    workType: opp.workType,
    domains: opp.domains.map((d) => d.domain),
    skills: opp.skills.map((s) => ({
      ...s.skill,
      required: s.required,
    })),
    candidateMatch: candidate
      ? {
          score: candidate.score,
          dimensions: candidate.dimensions,
          reasons: candidate.reasons,
        }
      : null,
    opportunityQuality: {
      score: intel.quality.score,
      insufficient: intel.quality.insufficient,
      dimensions: intel.quality.dimensions,
      companyLevel: true,
    },
    taskScore: intel.taskScore,
    pulse: intel.pulse,
    recommendation: rec,
    recommendationLabel: humanRecommendation(rec),
    confidence,
    saved: savedIds.has(opp.id),
  };
}

export async function listMatches(
  userId: string | undefined,
  query: z.infer<typeof matchQuerySchema>,
  opts: { track?: boolean } = {},
) {
  const weights = await getWeights();
  const profile = userId ? await loadCandidateProfile(userId) : null;

  const country = query.country?.trim().toUpperCase();
  const catalogWhere = {
    ...publicOpportunityCatalogWhere(query.company),
    relevanceStatus: "ACCEPTED" as const,
    ...(query.domain
      ? { domains: { some: { domain: { slug: query.domain } } } }
      : {}),
    ...(query.skill
      ? { skills: { some: { skill: { slug: query.skill } } } }
      : {}),
    ...(query.paymentModel ? { paymentModel: query.paymentModel } : {}),
    ...(query.minRate != null ? { maxRate: { gte: query.minRate } } : {}),
    ...(query.remote === "true" ? { remoteType: "REMOTE" as const } : {}),
    ...(country
      ? {
          OR: [
            { countryEligibility: "GLOBAL" as const },
            { countryEligibility: "UNSPECIFIED" as const },
            {
              countryEligibility: "EXPLICIT" as const,
              countryRestrictions: { has: country },
            },
          ],
        }
      : {}),
  };

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where: catalogWhere,
      include: opportunityInclude,
      orderBy: { lastVerifiedAt: "desc" },
      take: 250,
    }),
    prisma.opportunity.count({ where: catalogWhere }),
  ]);

  const saved = userId
    ? await prisma.savedOpportunity.findMany({
        where: { userId },
        select: { opportunityId: true },
      })
    : [];
  const savedIds = new Set(saved.map((s) => s.opportunityId));
  const intelMap = await getOpportunityQualityMap(
    opportunities.map((o) => o.companyId),
  );

  const rows: ReturnType<typeof scoreOpportunity>[] = [];
  for (const opp of opportunities) {
    if (
      profile &&
      query.includeWorkedWith === "false" &&
      profile.input.companyIds.includes(opp.companyId)
    ) {
      continue;
    }
    const intel = intelMap.get(opp.companyId);
    if (!intel) continue;
    if (query.pulse && intel.pulse.availability !== query.pulse) continue;
    if (query.minTaskScore != null && (intel.taskScore ?? 0) < query.minTaskScore) {
      continue;
    }
    if (query.minQuality != null && (intel.quality.score ?? 0) < query.minQuality) {
      continue;
    }
    rows.push(scoreOpportunity(opp, intel, profile, weights, savedIds));
  }

  const sort = query.sort === "recent" ? "newest" : query.sort || "recommended";
  rows.sort((a, b) => {
    const recency = (r: (typeof rows)[number]) =>
      new Date(r.publishedAt ?? r.lastVerifiedAt ?? 0).getTime();
    if (sort === "match") return (b.candidateMatch?.score ?? -1) - (a.candidateMatch?.score ?? -1);
    if (sort === "quality") return (b.opportunityQuality.score ?? -1) - (a.opportunityQuality.score ?? -1);
    if (sort === "pay") return (b.maxRate ?? -1) - (a.maxRate ?? -1);
    if (sort === "taskscore") return (b.taskScore ?? -1) - (a.taskScore ?? -1);
    if (sort === "newest") return recency(b) - recency(a);
    if (sort === "verified") return (a.verifiedDaysAgo ?? 99) - (b.verifiedDaysAgo ?? 99);
    const recRank = (r: (typeof rows)[number]) =>
      (r.candidateMatch?.score ?? 40) * 0.6 + (r.opportunityQuality.score ?? 40) * 0.4;
    const ranked = recRank(b) - recRank(a);
    return ranked !== 0 ? ranked : recency(b) - recency(a);
  });

  if (userId && opts.track !== false) {
    await trackEvent("taskmatch_opened", { userId });
  }

  return {
    items: rows.slice(0, query.limit ?? 20),
    total,
    strength: profile?.strength ?? null,
    personalized: Boolean(profile),
    hasCommunityIntelligence: rows.some((row) =>
      hasPublicCommunityIntelligence({
        taskScore: row.taskScore,
        pulseAvailability: row.pulse.availability,
        qualityScore: row.opportunityQuality.score,
        qualityInsufficient: row.opportunityQuality.insufficient,
      }),
    ),
  };
}

export async function getOpportunityMatch(slug: string, userId?: string) {
  const opp = await prisma.opportunity.findUnique({
    where: { slug },
    include: {
      ...opportunityInclude,
      tips: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });
  if (!opp || !isPublicOpportunityCatalogItem(opp)) {
    throw new ApiError(404, "Opportunity not found");
  }

  const weights = await getWeights();
  const profile = userId ? await loadCandidateProfile(userId) : null;
  const intelMap = await getOpportunityQualityMap([opp.companyId]);
  const intel = intelMap.get(opp.companyId);
  if (!intel) throw new ApiError(500, "Could not load opportunity quality");

  const saved = userId
    ? await prisma.savedOpportunity.findUnique({
        where: { userId_opportunityId: { userId, opportunityId: opp.id } },
      })
    : null;
  const card = scoreOpportunity(
    opp,
    intel,
    profile,
    weights,
    new Set(saved ? [opp.id] : []),
  );

  const [guide, screening, journey, readiness] = await Promise.all([
    prisma.companyApplicationGuide.findUnique({
      where: { companyId: opp.companyId },
    }),
    prisma.screeningReport.aggregate({
      where: { companyId: opp.companyId },
      _avg: { difficulty: true },
      _count: { id: true },
    }),
    userId
      ? prisma.userOpportunityStatus.findUnique({
          where: { userId_opportunityId: { userId, opportunityId: opp.id } },
        })
      : null,
    profile ? readinessAdvice(profile, card) : null,
  ]);

  if (userId) {
    await prisma.matchSnapshot.create({
      data: {
        userId,
        opportunityId: opp.id,
        candidateMatchScore: card.candidateMatch?.score ?? 0,
        opportunityQualityScore: card.opportunityQuality.score,
        confidence: card.confidence,
        recommendation: card.recommendation,
        components: {
          schema: "taskmatch.v1",
          candidate: card.candidateMatch,
          quality: card.opportunityQuality,
        },
      },
    });
    await trackEvent("opportunity_viewed", {
      userId,
      properties: {
        slug,
        match: card.candidateMatch?.score ?? null,
        quality: card.opportunityQuality.score,
      },
    });
  }

  const referral = await resolveApplicationDestination({
    companyId: opp.companyId,
    opportunityId: opp.id,
    originalApplicationUrl: opp.originalApplicationUrl || opp.applicationUrl,
  });

  return {
    ...card,
    applicationUrl: referral.url,
    originalApplicationUrl: referral.originalApplicationUrl,
    referral: referral.usedReferral
      ? {
          used: true,
          programName: referral.programName,
          campaign: referral.campaign,
          disclosure: referral.disclosure,
        }
      : { used: false, programName: null, campaign: null, disclosure: null },
    applicationProcess: opp.applicationProcess,
    screeningType: opp.screeningType,
    estimatedProcessMinutes: opp.estimatedProcessMinutes,
    countryRestrictions: opp.countryRestrictions,
    languageRequirements: opp.languageRequirements,
    weeklyHoursMin: opp.weeklyHoursMin,
    weeklyHoursMax: opp.weeklyHoursMax,
    experienceYearsMin: opp.experienceYearsMin,
    experienceYearsPreferred: opp.experienceYearsPreferred,
    guide,
    communityTips: opp.tips.map((t) => ({
      id: t.id,
      body: t.body,
      isDemo: t.isDemo,
    })),
    screening: {
      sampleSize: screening._count.id,
      averageDifficulty: screening._avg.difficulty,
    },
    journey: journey?.status ?? null,
    readiness,
  };
}

function readinessAdvice(
  profile: Awaited<ReturnType<typeof loadCandidateProfile>>,
  card: ReturnType<typeof scoreOpportunity>,
) {
  const have = (card.candidateMatch?.reasons ?? [])
    .filter((r) => r.kind === "match")
    .map((r) => r.text);
  const before = [...(card.candidateMatch?.reasons ?? [])]
    .filter((r) => r.kind === "gap")
    .map((r) => r.text);
  if (!profile.strength.items.find((i) => i.key === "github")?.done) {
    before.push("Add GitHub");
  }
  if (!profile.preference?.summary) {
    before.push("Complete professional summary");
  }
  const score = card.candidateMatch?.score ?? null;
  return {
    have: have.slice(0, 6),
    before: before.slice(0, 6),
    estimatedReadiness: score,
  };
}

export async function skillGaps(userId: string) {
  const { items, strength } = await listMatches(userId, { limit: 50 }, { track: false });
  const missing = new Map<string, { name: string; slug: string; count: number; rates: number[] }>();
  for (const row of items) {
    const gaps = row.candidateMatch?.reasons.filter((r) => r.kind === "gap") ?? [];
    for (const skill of row.skills) {
      const mentioned = gaps.some((g) => g.text.toLowerCase().includes(skill.name.toLowerCase()));
      const has = !mentioned ? true : false;
      if (has) continue;
      const cur = missing.get(skill.slug) ?? {
        name: skill.name,
        slug: skill.slug,
        count: 0,
        rates: [],
      };
      cur.count += 1;
      if (row.maxRate) cur.rates.push(row.maxRate);
      missing.set(skill.slug, cur);
    }
  }
  const suggestions = [...missing.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((s) => ({
      name: s.name,
      slug: s.slug,
      opportunities: s.count,
      averageMaxRate: s.rates.length
        ? Math.round(s.rates.reduce((a, b) => a + b, 0) / s.rates.length)
        : null,
    }));
  await trackEvent("profile_gap_viewed", { userId });
  return { strength, suggestions };
}

export async function saveOpportunity(userId: string, opportunityIdOrSlug: string, save: boolean) {
  const opp = await prisma.opportunity.findFirst({
    where: {
      OR: [{ id: opportunityIdOrSlug }, { slug: opportunityIdOrSlug }],
    },
  });
  if (!opp) throw new ApiError(404, "Opportunity not found");
  if (save) {
    await prisma.savedOpportunity.upsert({
      where: { userId_opportunityId: { userId, opportunityId: opp.id } },
      create: { userId, opportunityId: opp.id },
      update: {},
    });
    await trackEvent("opportunity_saved", { userId, properties: { slug: opp.slug } });
  } else {
    await prisma.savedOpportunity.deleteMany({
      where: { userId, opportunityId: opp.id },
    });
  }
  return { saved: save, slug: opp.slug };
}

export async function setJourney(
  userId: string,
  opportunityIdOrSlug: string,
  input: z.infer<typeof journeySchema>,
) {
  const opp = await prisma.opportunity.findFirst({
    where: {
      OR: [{ id: opportunityIdOrSlug }, { slug: opportunityIdOrSlug }],
    },
  });
  if (!opp) throw new ApiError(404, "Opportunity not found");
  const row = await prisma.userOpportunityStatus.upsert({
    where: { userId_opportunityId: { userId, opportunityId: opp.id } },
    create: {
      userId,
      opportunityId: opp.id,
      status: input.status,
      note: input.note,
    },
    update: { status: input.status, note: input.note },
  });
  await trackEvent("application_status_updated", {
    userId,
    properties: { slug: opp.slug, status: input.status },
  });
  return row;
}

export async function listSaved(userId: string) {
  const saved = await prisma.savedOpportunity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { opportunity: { include: opportunityInclude } },
  });
  const matches = await listMatches(userId, { limit: 50 }, { track: false });
  const bySlug = new Map(matches.items.map((i) => [i.slug, i]));
  return saved.map((s) => bySlug.get(s.opportunity.slug)).filter(Boolean);
}

export async function companyMatches(userId: string, companySlug: string) {
  const result = await listMatches(
    userId,
    { company: companySlug, limit: 5 },
    { track: false },
  );
  return {
    company: companySlug,
    items: result.items,
  };
}

async function resolveSkills(rows?: z.infer<typeof opportunityAdminSchema>["skillSlugs"]) {
  if (!rows?.length) return [];
  const skills = await prisma.skill.findMany({
    where: { slug: { in: rows.map((r) => r.slug) } },
  });
  const bySlug = new Map(skills.map((s) => [s.slug, s]));
  return rows
    .map((row) => {
      const skill = bySlug.get(row.slug);
      if (!skill) return null;
      return {
        skillId: skill.id,
        required: row.required ?? true,
        preferredLevel: row.preferredLevel ?? null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

async function resolveDomains(slugs?: string[]) {
  if (!slugs?.length) return [];
  const domains = await prisma.domain.findMany({ where: { slug: { in: slugs } } });
  return domains.map((d) => ({ domainId: d.id }));
}

export async function listAdminOpportunities() {
  return prisma.opportunity.findMany({
    include: opportunityInclude,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function createOpportunity(input: z.infer<typeof opportunityAdminSchema>) {
  const company = await prisma.company.findUnique({
    where: { slug: input.companySlug },
  });
  if (!company) throw new ApiError(404, "Company not found");
  const slug =
    input.slug ||
    slugify(`${company.slug}-${input.title}`, { lower: true, strict: true });
  const existing = await prisma.opportunity.findUnique({ where: { slug } });
  if (existing) throw new ApiError(409, "An opportunity with this slug already exists");

  const [skills, domains] = await Promise.all([
    resolveSkills(input.skillSlugs),
    resolveDomains(input.domainSlugs),
  ]);

  return prisma.opportunity.create({
    data: {
      companyId: company.id,
      title: input.title,
      slug,
      description: input.description ?? "",
      status: input.status ?? "ACTIVE",
      sourceType: input.sourceType ?? "ADMIN",
      sourceUrl: input.sourceUrl,
      countryRestrictions: input.countryRestrictions ?? [],
      remoteType: input.remoteType ?? "REMOTE",
      paymentModel: input.paymentModel ?? "HOURLY",
      currency: input.currency ?? "USD",
      minRate: input.minRate,
      maxRate: input.maxRate,
      rateUnit: input.rateUnit ?? "HOURLY",
      weeklyHoursMin: input.weeklyHoursMin,
      weeklyHoursMax: input.weeklyHoursMax,
      experienceYearsMin: input.experienceYearsMin,
      experienceYearsPreferred: input.experienceYearsPreferred,
      languageRequirements: input.languageRequirements ?? [],
      applicationUrl: input.applicationUrl,
      screeningType: input.screeningType,
      estimatedProcessMinutes: input.estimatedProcessMinutes,
      isDemo: input.isDemo ?? false,
      featured: input.featured ?? false,
      publishedAt: new Date(),
      lastVerifiedAt: new Date(),
      skills: { create: skills },
      domains: { create: domains },
    },
    include: opportunityInclude,
  });
}

export const opportunityAdminUpdateSchema = opportunityAdminSchema.partial();

export async function updateOpportunity(
  id: string,
  input: z.infer<typeof opportunityAdminUpdateSchema>,
) {
  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "Opportunity not found");
  const company = input.companySlug
    ? await prisma.company.findUnique({ where: { slug: input.companySlug } })
    : null;
  if (input.companySlug && !company) throw new ApiError(404, "Company not found");

  const [skills, domains] = await Promise.all([
    resolveSkills(input.skillSlugs),
    resolveDomains(input.domainSlugs),
  ]);

  return prisma.$transaction(async (tx) => {
    if (input.skillSlugs) {
      await tx.opportunitySkill.deleteMany({ where: { opportunityId: id } });
    }
    if (input.domainSlugs) {
      await tx.opportunityDomain.deleteMany({ where: { opportunityId: id } });
    }
    return tx.opportunity.update({
      where: { id },
      data: {
        companyId: company?.id,
        title: input.title,
        slug: input.slug,
        description: input.description,
        status: input.status,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        countryRestrictions: input.countryRestrictions,
        remoteType: input.remoteType,
        paymentModel: input.paymentModel,
        currency: input.currency,
        minRate: input.minRate,
        maxRate: input.maxRate,
        rateUnit: input.rateUnit,
        weeklyHoursMin: input.weeklyHoursMin,
        weeklyHoursMax: input.weeklyHoursMax,
        experienceYearsMin: input.experienceYearsMin,
        experienceYearsPreferred: input.experienceYearsPreferred,
        languageRequirements: input.languageRequirements,
        applicationUrl: input.applicationUrl,
        screeningType: input.screeningType,
        estimatedProcessMinutes: input.estimatedProcessMinutes,
        isDemo: input.isDemo,
        featured: input.featured,
        ...(input.skillSlugs ? { skills: { create: skills } } : {}),
        ...(input.domainSlugs ? { domains: { create: domains } } : {}),
      },
      include: opportunityInclude,
    });
  });
}

export async function verifyOpportunity(id: string) {
  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "Opportunity not found");
  return prisma.opportunity.update({
    where: { id },
    data: { lastVerifiedAt: new Date(), status: "ACTIVE" },
    include: opportunityInclude,
  });
}

export async function closeOpportunity(id: string) {
  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "Opportunity not found");
  return prisma.opportunity.update({
    where: { id },
    data: { status: "CLOSED" },
    include: opportunityInclude,
  });
}
