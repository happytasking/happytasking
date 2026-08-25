import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const FUNNEL_EVENTS = [
  "signup_completed",
  "onboarding_started",
  "onboarding_country_completed",
  "onboarding_domain_completed",
  "onboarding_skills_completed",
  "onboarding_company_completed",
  "onboarding_taskpulse_submitted",
  "onboarding_completed",
  "onboarding_skipped",
  "review_prompt_shown",
  "review_started_after_onboarding",
  "review_completed_after_onboarding",
  "contributor_activated",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number] | string;

export async function trackEvent(
  name: FunnelEvent,
  opts: {
    userId?: string | null;
    properties?: Prisma.InputJsonValue;
  } = {},
) {
  await prisma.analyticsEvent.create({
    data: {
      name,
      userId: opts.userId || null,
      properties: opts.properties ?? undefined,
    },
  });
}

export async function hasMeaningfulContribution(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      OR: [
        { reviews: { some: {} } },
        { availabilityReports: { some: {} } },
        { payReports: { some: {} } },
        { complaints: { some: {} } },
        { discussions: { some: {} } },
        { comments: { some: {} } },
      ],
    },
    select: { id: true },
  });
  return Boolean(user);
}

export async function recordActivationIfNeeded(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activatedAt: true, onboardingCompletedAt: true },
  });
  if (!user || user.activatedAt) return false;
  const contributed = await hasMeaningfulContribution(userId);
  if (!contributed) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { activatedAt: new Date() },
  });
  await trackEvent("contributor_activated", {
    userId,
    properties: {
      onboarded: Boolean(user.onboardingCompletedAt),
    },
  });
  return true;
}
