import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { countryByCode } from "../lib/countries.js";
import { TENURE_BUCKETS } from "../lib/onboarding.js";
import { hasMeaningfulContribution } from "./analytics.service.js";
import { getFoundingTaskerSetting } from "./badge.service.js";

const visibilityEnum = z.enum(["PRIVATE", "PUBLIC", "AGGREGATE_ONLY"]);

export const visibilitySchema = z.object({
  country: visibilityEnum.optional(),
  domains: visibilityEnum.optional(),
  skills: visibilityEnum.optional(),
  companyExperience: visibilityEnum.optional(),
});

export const confirmExperienceSchema = z.object({
  currentlyActive: z.boolean(),
});

function completion(user: {
  countryCode: string | null;
  domains: unknown[];
  skills: unknown[];
  experiences: unknown[];
  reviews: unknown[];
  availabilityReports: unknown[];
}) {
  const items = [
    { key: "country", label: "Country", done: Boolean(user.countryCode) },
    { key: "domains", label: "Domain", done: user.domains.length > 0 },
    { key: "skills", label: "Skills", done: user.skills.length > 0 },
    {
      key: "companies",
      label: "Platform experience",
      done: user.experiences.length > 0,
    },
    {
      key: "experience",
      label: "Share first experience",
      done: user.reviews.length > 0 || user.availabilityReports.length > 0,
    },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return {
    percent: Math.round((doneCount / items.length) * 100),
    items,
  };
}

export async function getContributorProfile(userId: string) {
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
        orderBy: [{ currentlyActive: "desc" }, { createdAt: "asc" }],
      },
      reviews: { select: { id: true }, take: 1 },
      availabilityReports: { select: { id: true }, take: 1 },
      payReports: { select: { id: true }, take: 1 },
      complaints: { select: { id: true }, take: 1 },
      discussions: { select: { id: true }, take: 1 },
      comments: { select: { id: true }, take: 1 },
      badges: true,
      profileVisibility: true,
      onboardingProgress: true,
    },
  });
  if (!user) throw new ApiError(404, "User not found");

  const contributed = await hasMeaningfulContribution(userId);
  const founding = await getFoundingTaskerSetting();

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    country: user.country,
    countryCode: user.countryCode,
    role: user.role,
    contributionScore: user.contributionScore,
    trustLevel: user.trustLevel,
    publicProfileEnabled: user.publicProfileEnabled,
    createdAt: user.createdAt,
    onboarding: {
      startedAt: user.onboardingStartedAt,
      completedAt: user.onboardingCompletedAt,
      version: user.onboardingVersion,
      currentStep: user.onboardingProgress?.currentStep ?? null,
      skippedSections: user.onboardingProgress?.skippedSections ?? [],
      needsOnboarding: !user.onboardingCompletedAt && user.role === "USER",
    },
    activatedAt: user.activatedAt,
    isActivated: Boolean(user.activatedAt) || contributed,
    completion: completion(user),
    visibility: user.profileVisibility ?? {
      country: "AGGREGATE_ONLY",
      domains: "AGGREGATE_ONLY",
      skills: "AGGREGATE_ONLY",
      companyExperience: "AGGREGATE_ONLY",
    },
    domains: user.domains.map((d) => d.domain),
    skills: user.skills.map((s) => s.skill),
    experiences: user.experiences.map((exp) => ({
      id: exp.id,
      currentlyActive: exp.currentlyActive,
      tenureBucket: exp.tenureBucket,
      tenureLabel:
        TENURE_BUCKETS.find((t) => t.value === exp.tenureBucket)?.label ?? null,
      company: exp.company,
      domain: exp.domain,
      updatedAt: exp.updatedAt,
      confirmTenure: shouldConfirmTenure(exp.currentlyActive, exp.updatedAt),
    })),
    badges: user.badges.map((b) => ({
      type: b.type,
      awardedAt: b.awardedAt,
      label: b.type === "FOUNDING_TASKER" ? "Founding Tasker" : b.type,
      tooltip:
        b.type === "FOUNDING_TASKER"
          ? "Joined and contributed during the early Happy Tasking community."
          : null,
    })),
    foundingPeriodOpen: founding.open,
  };
}

function shouldConfirmTenure(currentlyActive: boolean, updatedAt: Date) {
  if (!currentlyActive) return false;
  const days = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 30;
}

export async function updateVisibility(
  userId: string,
  input: z.infer<typeof visibilitySchema>,
) {
  const data = {
    ...(input.country ? { country: input.country } : {}),
    ...(input.domains ? { domains: input.domains } : {}),
    ...(input.skills ? { skills: input.skills } : {}),
    ...(input.companyExperience
      ? { companyExperience: input.companyExperience }
      : {}),
  };
  const row = await prisma.profileVisibility.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  return row;
}

export async function confirmExperience(
  userId: string,
  experienceId: string,
  input: z.infer<typeof confirmExperienceSchema>,
) {
  const experience = await prisma.workerExperience.findFirst({
    where: { id: experienceId, userId },
  });
  if (!experience) throw new ApiError(404, "Experience not found");
  return prisma.workerExperience.update({
    where: { id: experienceId },
    data: {
      currentlyActive: input.currentlyActive,
      endMonth: input.currentlyActive ? null : experience.endMonth ?? new Date(),
    },
    include: {
      company: { select: { id: true, name: true, slug: true, logoUrl: true } },
      domain: true,
    },
  });
}

export function resolveCountryLabel(country?: string | null, code?: string | null) {
  const fromCode = countryByCode(code);
  return fromCode?.name ?? country ?? null;
}
