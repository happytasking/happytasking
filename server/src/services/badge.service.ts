import { prisma } from "../lib/prisma.js";
import {
  DEFAULT_FOUNDING_TASKER,
  FOUNDING_TASKER_SETTING_KEY,
  type FoundingTaskerSetting,
} from "../lib/onboarding.js";
import { hasMeaningfulContribution } from "./analytics.service.js";

export async function getFoundingTaskerSetting(): Promise<FoundingTaskerSetting> {
  const row = await prisma.platformSetting.findUnique({
    where: { key: FOUNDING_TASKER_SETTING_KEY },
  });
  if (!row || typeof row.value !== "object" || row.value === null) {
    return DEFAULT_FOUNDING_TASKER;
  }
  const value = row.value as Partial<FoundingTaskerSetting>;
  return {
    ...DEFAULT_FOUNDING_TASKER,
    ...value,
  };
}

export async function isFoundingPeriodOpen(setting?: FoundingTaskerSetting) {
  const config = setting ?? (await getFoundingTaskerSetting());
  if (!config.open) return false;
  if (config.endsAt && new Date(config.endsAt).getTime() < Date.now()) {
    return false;
  }
  return true;
}

export async function maybeAwardFoundingTasker(userId: string) {
  const setting = await getFoundingTaskerSetting();
  if (!(await isFoundingPeriodOpen(setting))) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompletedAt: true },
  });
  if (!user) return null;
  if (setting.requireOnboarding && !user.onboardingCompletedAt) return null;
  if (setting.requireContribution) {
    const contributed = await hasMeaningfulContribution(userId);
    if (!contributed) return null;
  }

  return prisma.userBadge.upsert({
    where: { userId_type: { userId, type: "FOUNDING_TASKER" } },
    create: {
      userId,
      type: "FOUNDING_TASKER",
      metadata: { source: "founding_period" },
    },
    update: {},
  });
}
