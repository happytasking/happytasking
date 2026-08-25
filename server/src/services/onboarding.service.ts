import slugify from "slugify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { COUNTRIES, countryByCode } from "../lib/countries.js";
import {
  CURRENT_ONBOARDING_VERSION,
  TENURE_BUCKETS,
  type OnboardingStep,
} from "../lib/onboarding.js";
import { trackEvent } from "./analytics.service.js";
import { maybeAwardFoundingTasker } from "./badge.service.js";

const tenureEnum = z.enum([
  "LESS_THAN_1_MONTH",
  "ONE_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "SIX_TO_TWELVE_MONTHS",
  "ONE_TO_TWO_YEARS",
  "TWO_PLUS_YEARS",
]);

export const countryStepSchema = z.object({
  countryCode: z.string().length(2),
});

export const domainsStepSchema = z.object({
  domainIds: z.array(z.string()).max(20).default([]),
  skipped: z.boolean().optional(),
});

export const skillsStepSchema = z.object({
  skillIds: z.array(z.string()).max(30).default([]),
  customNames: z.array(z.string().min(1).max(80)).max(10).default([]),
  skipped: z.boolean().optional(),
});

export const experienceItemSchema = z.object({
  companyId: z.string().min(1),
  currentlyActive: z.boolean(),
  tenureBucket: tenureEnum,
  primaryDomainId: z.string().optional(),
});

export const experiencesStepSchema = z.object({
  experiences: z.array(experienceItemSchema).max(12).default([]),
  skipped: z.boolean().optional(),
});

export const completeSchema = z.object({
  skipped: z.boolean().optional(),
});

const SUGGESTION_LIMIT = 12;

async function ensureProgress(userId: string) {
  return prisma.onboardingProgress.upsert({
    where: { userId },
    create: {
      userId,
      version: CURRENT_ONBOARDING_VERSION,
      currentStep: "welcome",
    },
    update: {},
  });
}

async function setStep(
  userId: string,
  currentStep: OnboardingStep,
  extra: { skipped?: string } = {},
) {
  const progress = await ensureProgress(userId);
  const skipped = extra.skipped
    ? Array.from(new Set([...progress.skippedSections, extra.skipped]))
    : progress.skippedSections;
  return prisma.onboardingProgress.update({
    where: { userId },
    data: { currentStep, skippedSections: skipped },
  });
}

export async function startOnboarding(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const now = new Date();
  if (!user.onboardingStartedAt) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStartedAt: now,
        onboardingVersion: CURRENT_ONBOARDING_VERSION,
      },
    });
    await trackEvent("onboarding_started", {
      userId,
      properties: { version: CURRENT_ONBOARDING_VERSION },
    });
  }

  await prisma.onboardingProgress.upsert({
    where: { userId },
    create: {
      userId,
      version: CURRENT_ONBOARDING_VERSION,
      currentStep: "welcome",
      startedAt: now,
    },
    update: {
      startedAt: user.onboardingStartedAt ? undefined : now,
    },
  });

  await prisma.profileVisibility.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  return getOnboardingState(userId);
}

export async function getOnboardingState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      domains: { include: { domain: true } },
      skills: { include: { skill: true } },
      experiences: {
        include: {
          company: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          domain: true,
        },
        orderBy: { createdAt: "asc" },
      },
      onboardingProgress: true,
    },
  });
  if (!user) throw new ApiError(404, "User not found");

  const [domains, skills] = await Promise.all([
    prisma.domain.findMany({ orderBy: { name: "asc" } }),
    prisma.skill.findMany({
      where: { userSuggested: false },
      include: { domain: { select: { slug: true, name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const progress = user.onboardingProgress;
  const selectedDomainIds = user.domains.map((d) => d.domainId);
  const suggestedSkills = suggestSkills(skills, selectedDomainIds);

  return {
    version: CURRENT_ONBOARDING_VERSION,
    currentStep: progress?.currentStep ?? "welcome",
    skippedSections: progress?.skippedSections ?? [],
    completed: Boolean(user.onboardingCompletedAt),
    startedAt: user.onboardingStartedAt,
    completedAt: user.onboardingCompletedAt,
    catalog: {
      countries: COUNTRIES,
      domains,
      skills: suggestedSkills,
      allSkills: skills,
      tenureBuckets: TENURE_BUCKETS,
    },
    draft: {
      countryCode: user.countryCode,
      country: user.country,
      domainIds: selectedDomainIds,
      skillIds: user.skills.map((s) => s.skillId),
      experiences: user.experiences.map((exp) => ({
        id: exp.id,
        companyId: exp.companyId,
        company: exp.company,
        currentlyActive: exp.currentlyActive,
        tenureBucket: exp.tenureBucket,
        primaryDomainId: exp.domainId,
        domain: exp.domain,
      })),
    },
  };
}

function suggestSkills(
  skills: Array<{
    id: string;
    name: string;
    slug: string;
    domainId: string | null;
    domain: { slug: string; name: string } | null;
  }>,
  selectedDomainIds: string[],
) {
  const selected = new Set(selectedDomainIds);
  const matching = skills.filter(
    (s) => !s.domainId || selected.size === 0 || selected.has(s.domainId),
  );
  const crossCutting = skills.filter((s) => !s.domainId);
  const merged = [...matching];
  for (const skill of crossCutting) {
    if (!merged.some((s) => s.id === skill.id)) merged.push(skill);
  }
  return merged.slice(0, SUGGESTION_LIMIT);
}

export async function saveCountry(
  userId: string,
  input: z.infer<typeof countryStepSchema>,
) {
  const country = countryByCode(input.countryCode);
  if (!country) throw new ApiError(400, "Unknown country");

  await prisma.user.update({
    where: { id: userId },
    data: { country: country.name, countryCode: country.code },
  });
  await setStep(userId, "domains");
  await trackEvent("onboarding_country_completed", {
    userId,
    properties: { countryCode: country.code },
  });
  return getOnboardingState(userId);
}

export async function saveDomains(
  userId: string,
  input: z.infer<typeof domainsStepSchema>,
) {
  if (!input.skipped) {
    if (input.domainIds.length) {
      const found = await prisma.domain.findMany({
        where: { id: { in: input.domainIds } },
      });
      if (found.length !== input.domainIds.length) {
        throw new ApiError(400, "Invalid domain");
      }
    }
    await prisma.$transaction([
      prisma.userDomain.deleteMany({ where: { userId } }),
      ...(input.domainIds.length
        ? [
            prisma.userDomain.createMany({
              data: input.domainIds.map((domainId) => ({ userId, domainId })),
            }),
          ]
        : []),
    ]);
  }
  await setStep(userId, "skills", {
    skipped: input.skipped ? "domains" : undefined,
  });
  if (!input.skipped) {
    await trackEvent("onboarding_domain_completed", {
      userId,
      properties: { count: input.domainIds.length },
    });
  }
  return getOnboardingState(userId);
}

async function resolveCustomSkills(names: string[]) {
  const ids: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name, { lower: true, strict: true }).slice(0, 60);
    if (!slug) continue;
    const skill = await prisma.skill.upsert({
      where: { slug },
      create: { name, slug, userSuggested: true },
      update: {},
    });
    ids.push(skill.id);
  }
  return ids;
}

export async function saveSkills(
  userId: string,
  input: z.infer<typeof skillsStepSchema>,
) {
  if (!input.skipped) {
    const customIds = await resolveCustomSkills(input.customNames);
    const skillIds = Array.from(new Set([...input.skillIds, ...customIds]));
    if (skillIds.length) {
      const found = await prisma.skill.findMany({
        where: { id: { in: skillIds } },
      });
      if (found.length !== skillIds.length) {
        throw new ApiError(400, "Invalid skill");
      }
    }
    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId } }),
      ...(skillIds.length
        ? [
            prisma.userSkill.createMany({
              data: skillIds.map((skillId) => ({ userId, skillId })),
            }),
          ]
        : []),
    ]);
  }
  await setStep(userId, "companies", {
    skipped: input.skipped ? "skills" : undefined,
  });
  if (!input.skipped) {
    await trackEvent("onboarding_skills_completed", {
      userId,
      properties: { count: input.skillIds.length },
    });
  }
  return getOnboardingState(userId);
}

export async function saveExperiences(
  userId: string,
  input: z.infer<typeof experiencesStepSchema>,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  if (!input.skipped) {
    const companyIds = input.experiences.map((e) => e.companyId);
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
    });
    if (companies.length !== new Set(companyIds).size) {
      throw new ApiError(400, "Invalid company");
    }
    const domainIds = input.experiences
      .map((e) => e.primaryDomainId)
      .filter((id): id is string => Boolean(id));
    if (domainIds.length) {
      const domains = await prisma.domain.findMany({
        where: { id: { in: domainIds } },
      });
      if (domains.length !== new Set(domainIds).size) {
        throw new ApiError(400, "Invalid domain");
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const exp of input.experiences) {
        await tx.workerExperience.upsert({
          where: {
            userId_companyId: { userId, companyId: exp.companyId },
          },
          create: {
            userId,
            companyId: exp.companyId,
            currentlyActive: exp.currentlyActive,
            tenureBucket: exp.tenureBucket,
            domainId: exp.primaryDomainId || null,
            country: user.country,
            countryCode: user.countryCode,
          },
          update: {
            currentlyActive: exp.currentlyActive,
            tenureBucket: exp.tenureBucket,
            domainId: exp.primaryDomainId || null,
            country: user.country,
            countryCode: user.countryCode,
          },
        });
      }
    });
  }

  await setStep(userId, "done", {
    skipped: input.skipped ? "companies" : undefined,
  });
  if (!input.skipped) {
    await trackEvent("onboarding_company_completed", {
      userId,
      properties: { count: input.experiences.length },
    });
  }
  return getOnboardingState(userId);
}

export async function completeOnboarding(
  userId: string,
  input: z.infer<typeof completeSchema>,
) {
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompletedAt: now,
        onboardingVersion: CURRENT_ONBOARDING_VERSION,
      },
    }),
    prisma.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        version: CURRENT_ONBOARDING_VERSION,
        currentStep: "done",
        completedAt: now,
        startedAt: now,
        skippedSections: input.skipped ? ["onboarding"] : [],
      },
      update: {
        currentStep: "done",
        completedAt: now,
        skippedSections: input.skipped
          ? { push: "onboarding" }
          : undefined,
      },
    }),
  ]);

  await trackEvent(
    input.skipped ? "onboarding_skipped" : "onboarding_completed",
    { userId, properties: { version: CURRENT_ONBOARDING_VERSION } },
  );
  await maybeAwardFoundingTasker(userId);
  return getOnboardingState(userId);
}

export async function searchCompanies(query: string) {
  const q = query.trim();
  return prisma.company.findMany({
    where: {
      companyStatus: "ACTIVE",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, slug: true, logoUrl: true, country: true },
    orderBy: { name: "asc" },
    take: 20,
  });
}
