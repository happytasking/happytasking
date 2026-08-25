import { PrismaClient } from "@prisma/client";

type SeedClient = PrismaClient;

const now = new Date();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const opportunities = [
  {
    company: "mercor",
    slug: "mercor-ai-coding-expert",
    title: "AI Coding Expert",
    description:
      "Public listing for experienced software contributors who evaluate and improve coding models. DEMO listing assembled from public company information — not a job offer.",
    sourceType: "PUBLIC_LISTING" as const,
    sourceUrl: "https://mercor.com",
    countryRestrictions: ["US", "BR", "IN", "CA", "GB", "DE", "AU"],
    minRate: 50,
    maxRate: 70,
    weeklyHoursMin: 10,
    weeklyHoursMax: 30,
    experienceYearsMin: 3,
    experienceYearsPreferred: 6,
    languageRequirements: ["en"],
    applicationUrl: "https://mercor.com",
    screeningType: "Skills interview + evaluation",
    estimatedProcessMinutes: 45,
    lastVerifiedAt: daysAgo(1),
    domains: ["coding"],
    skills: [
      { slug: "typescript", required: true, preferredLevel: "ADVANCED" as const },
      { slug: "python", required: true, preferredLevel: "ADVANCED" as const },
      { slug: "llm-evaluation", required: true, preferredLevel: "ADVANCED" as const },
      { slug: "agent-evaluation", required: false, preferredLevel: "INTERMEDIATE" as const },
    ],
  },
  {
    company: "outlier",
    slug: "outlier-coding-ai-evaluation",
    title: "Coding / AI Evaluation",
    description:
      "Public-facing coding and LLM evaluation work. DEMO listing for TaskMatch — status may change.",
    sourceType: "PUBLIC_LISTING" as const,
    sourceUrl: "https://outlier.ai",
    countryRestrictions: ["US", "BR", "IN", "CA", "GB", "KE", "NG", "PH"],
    minRate: 38,
    maxRate: 48,
    weeklyHoursMin: 8,
    weeklyHoursMax: 25,
    experienceYearsMin: 1,
    experienceYearsPreferred: 3,
    languageRequirements: ["en"],
    applicationUrl: "https://outlier.ai",
    screeningType: "Staged skill assessments",
    estimatedProcessMinutes: 90,
    lastVerifiedAt: daysAgo(3),
    domains: ["coding", "generalist"],
    skills: [
      { slug: "python", required: true, preferredLevel: "INTERMEDIATE" as const },
      { slug: "typescript", required: true, preferredLevel: "INTERMEDIATE" as const },
      { slug: "llm-evaluation", required: true, preferredLevel: "INTERMEDIATE" as const },
      { slug: "code-evaluation", required: false },
    ],
  },
  {
    company: "turing",
    slug: "turing-llm-software-evaluator",
    title: "LLM Software Evaluator",
    description:
      "Public software-evaluation opportunity for AI training work. DEMO listing.",
    sourceType: "PUBLIC_LISTING" as const,
    sourceUrl: "https://www.turing.com",
    countryRestrictions: [],
    minRate: 40,
    maxRate: 65,
    weeklyHoursMin: 15,
    weeklyHoursMax: 40,
    experienceYearsMin: 4,
    experienceYearsPreferred: 8,
    languageRequirements: ["en"],
    applicationUrl: "https://www.turing.com",
    screeningType: "Technical screen",
    estimatedProcessMinutes: 60,
    lastVerifiedAt: daysAgo(5),
    domains: ["coding"],
    skills: [
      { slug: "python", required: true, preferredLevel: "ADVANCED" as const },
      { slug: "javascript", required: true },
      { slug: "llm-evaluation", required: true },
    ],
  },
  {
    company: "alignerr",
    slug: "alignerr-ai-agent-evaluator",
    title: "AI Agent Evaluator",
    description:
      "Public expert-network listing focused on agent workflows. DEMO listing.",
    sourceType: "PUBLIC_LISTING" as const,
    sourceUrl: "https://alignerr.com",
    countryRestrictions: ["US", "CA", "GB", "DE"],
    minRate: 45,
    maxRate: 75,
    weeklyHoursMin: 10,
    weeklyHoursMax: 25,
    experienceYearsMin: 2,
    experienceYearsPreferred: 5,
    languageRequirements: ["en"],
    applicationUrl: "https://alignerr.com",
    screeningType: "Domain interview",
    estimatedProcessMinutes: 40,
    lastVerifiedAt: daysAgo(2),
    domains: ["coding", "research"],
    skills: [
      { slug: "agent-evaluation", required: true, preferredLevel: "ADVANCED" as const },
      { slug: "tool-calling", required: true },
      { slug: "python", required: false },
    ],
  },
  {
    company: "surge-ai",
    slug: "surge-ai-preference-data-specialist",
    title: "Preference Data Specialist",
    description:
      "Public RLHF / preference-data work. DEMO listing assembled from public information.",
    sourceType: "COMMUNITY_REPORTED" as const,
    sourceUrl: "https://surgehq.ai",
    countryRestrictions: ["US", "CA", "GB"],
    minRate: 28,
    maxRate: 42,
    weeklyHoursMin: 5,
    weeklyHoursMax: 20,
    experienceYearsMin: 0,
    experienceYearsPreferred: 2,
    languageRequirements: ["en"],
    applicationUrl: "https://surgehq.ai",
    screeningType: "Writing sample + onboarding",
    estimatedProcessMinutes: 50,
    lastVerifiedAt: daysAgo(8),
    domains: ["writing", "generalist"],
    skills: [
      { slug: "rlhf", required: true },
      { slug: "prompt-evaluation", required: true },
      { slug: "research", required: false },
    ],
  },
  {
    company: "dataannotation",
    slug: "dataannotation-generalist-evaluation",
    title: "Generalist Evaluation",
    description:
      "Public generalist evaluation listing. DEMO data — last verified recently.",
    sourceType: "PUBLIC_LISTING" as const,
    sourceUrl: "https://www.dataannotation.tech",
    countryRestrictions: [],
    minRate: 20,
    maxRate: 40,
    weeklyHoursMin: 5,
    weeklyHoursMax: 30,
    experienceYearsMin: 0,
    experienceYearsPreferred: 2,
    languageRequirements: ["en"],
    applicationUrl: "https://www.dataannotation.tech",
    screeningType: "Staged assessments",
    estimatedProcessMinutes: 75,
    lastVerifiedAt: daysAgo(4),
    domains: ["generalist", "data-annotation"],
    skills: [
      { slug: "data-annotation", required: true },
      { slug: "llm-evaluation", required: false },
    ],
  },
];

const guides: Record<
  string,
  {
    estimatedTime: string;
    difficulty: number;
    officialSourceUrl: string;
    officialSummary: string;
    communitySummary: string;
    steps: { title: string; source: string }[];
  }
> = {
  mercor: {
    estimatedTime: "30–60 minutes",
    difficulty: 4,
    officialSourceUrl: "https://mercor.com",
    officialSummary:
      "Create a professional profile, complete the required evaluation, then become eligible for relevant opportunities.",
    communitySummary:
      "Contributors commonly mention a skills interview, clear examples from real work, and a stable audio setup.",
    steps: [
      { title: "Create a professional profile", source: "Official / public information" },
      { title: "Complete required evaluation or interview", source: "Official / public information" },
      { title: "Complete skill-specific screening", source: "Community-reported experience" },
      { title: "Become eligible for relevant opportunities", source: "Official / public information" },
      { title: "Receive or apply to matches", source: "Official / public information" },
    ],
  },
  outlier: {
    estimatedTime: "1–2 hours",
    difficulty: 3,
    officialSourceUrl: "https://outlier.ai",
    officialSummary:
      "Apply on the public site, complete staged assessments, then wait for project eligibility.",
    communitySummary:
      "Contributors often mention multiple assessments and variable wait times before tasks appear.",
    steps: [
      { title: "Create an account on the public site", source: "Official / public information" },
      { title: "Complete staged skill assessments", source: "Official / public information" },
      { title: "Wait for project eligibility", source: "Community-reported experience" },
      { title: "Start available evaluation work", source: "Community-reported experience" },
    ],
  },
};

export async function seedTaskMatch(prisma: SeedClient) {
  await prisma.platformSetting.upsert({
    where: { key: "taskmatchWeights" },
    create: {
      key: "taskmatchWeights",
      value: {
        skills: 0.4,
        experience: 0.2,
        language: 0.1,
        country: 0.1,
        availability: 0.1,
        rate: 0.1,
      },
    },
    update: {},
  });

  const companies = await prisma.company.findMany();
  const skills = await prisma.skill.findMany();
  const domains = await prisma.domain.findMany();
  const companyBySlug = Object.fromEntries(companies.map((c) => [c.slug, c]));
  const skillBySlug = Object.fromEntries(skills.map((s) => [s.slug, s]));
  const domainBySlug = Object.fromEntries(domains.map((d) => [d.slug, d]));

  for (const row of opportunities) {
    const company = companyBySlug[row.company];
    if (!company) continue;
    const existing = await prisma.opportunity.findUnique({ where: { slug: row.slug } });
    const data = {
      companyId: company.id,
      title: row.title,
      description: row.description,
      status: "ACTIVE" as const,
      sourceType: row.sourceType,
      sourceUrl: row.sourceUrl,
      countryRestrictions: row.countryRestrictions,
      remoteType: "REMOTE" as const,
      paymentModel: "HOURLY" as const,
      currency: "USD",
      minRate: row.minRate,
      maxRate: row.maxRate,
      rateUnit: "HOURLY" as const,
      weeklyHoursMin: row.weeklyHoursMin,
      weeklyHoursMax: row.weeklyHoursMax,
      experienceYearsMin: row.experienceYearsMin,
      experienceYearsPreferred: row.experienceYearsPreferred,
      languageRequirements: row.languageRequirements,
      applicationUrl: row.applicationUrl,
      screeningType: row.screeningType,
      estimatedProcessMinutes: row.estimatedProcessMinutes,
      isDemo: true,
      featured: false,
      publishedAt: existing?.publishedAt ?? now,
      lastVerifiedAt: row.lastVerifiedAt,
    };

    const opp = existing
      ? await prisma.opportunity.update({ where: { slug: row.slug }, data })
      : await prisma.opportunity.create({ data: { ...data, slug: row.slug } });

    await prisma.opportunitySkill.deleteMany({ where: { opportunityId: opp.id } });
    await prisma.opportunityDomain.deleteMany({ where: { opportunityId: opp.id } });

    await prisma.opportunitySkill.createMany({
      data: row.skills
        .map((s) => {
          const skill = skillBySlug[s.slug];
          if (!skill) return null;
          return {
            opportunityId: opp.id,
            skillId: skill.id,
            required: s.required,
            preferredLevel: s.preferredLevel ?? null,
          };
        })
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    });
    await prisma.opportunityDomain.createMany({
      data: row.domains
        .map((slug) => {
          const domain = domainBySlug[slug];
          if (!domain) return null;
          return { opportunityId: opp.id, domainId: domain.id };
        })
        .filter((d): d is NonNullable<typeof d> => Boolean(d)),
    });
  }

  for (const [slug, guide] of Object.entries(guides)) {
    const company = companyBySlug[slug];
    if (!company) continue;
    await prisma.companyApplicationGuide.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        steps: guide.steps,
        estimatedTime: guide.estimatedTime,
        difficulty: guide.difficulty,
        officialSourceUrl: guide.officialSourceUrl,
        officialSummary: guide.officialSummary,
        communitySummary: guide.communitySummary,
      },
      update: {
        steps: guide.steps,
        estimatedTime: guide.estimatedTime,
        difficulty: guide.difficulty,
        officialSourceUrl: guide.officialSourceUrl,
        officialSummary: guide.officialSummary,
        communitySummary: guide.communitySummary,
      },
    });
  }

  const mercorOpp = await prisma.opportunity.findUnique({
    where: { slug: "mercor-ai-coding-expert" },
  });
  if (mercorOpp) {
    const existingTips = await prisma.applicationTip.count({
      where: { opportunityId: mercorOpp.id, isDemo: true },
    });
    if (!existingTips) {
      await prisma.applicationTip.createMany({
        data: [
          {
            opportunityId: mercorOpp.id,
            companyId: mercorOpp.companyId,
            body: "Practice concise explanations of real coding work. Keep examples specific, not confidential.",
            status: "PUBLISHED",
            isDemo: true,
          },
          {
            opportunityId: mercorOpp.id,
            companyId: mercorOpp.companyId,
            body: "A quiet room and a working microphone came up often. Setup issues waste screening time.",
            status: "PUBLISHED",
            isDemo: true,
          },
          {
            opportunityId: mercorOpp.id,
            companyId: mercorOpp.companyId,
            body: "Review TypeScript and Python fundamentals you already use. Do not look for leaked assessments.",
            status: "PUBLISHED",
            isDemo: true,
          },
        ],
      });
    }
  }

  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@happytasking.com" },
    include: { skills: { include: { skill: true } }, workPreference: true },
  });
  if (demoUser) {
    await prisma.userLanguage.upsert({
      where: { userId_code: { userId: demoUser.id, code: "en" } },
      create: { userId: demoUser.id, code: "en", proficiency: "PROFESSIONAL" },
      update: {},
    });
    await prisma.userWorkPreference.upsert({
      where: { userId: demoUser.id },
      create: {
        userId: demoUser.id,
        lookingStatus: "READY",
        workload: "TEN_TO_TWENTY",
        startTiming: "IMMEDIATELY",
        professionalExperienceYears: 8,
        aiWorkExperienceYears: 2,
        desiredRate: 55,
        desiredRateCurrency: "USD",
        desiredRateUnit: "HOURLY",
      },
      update: {},
    });
    for (const row of demoUser.skills) {
      const level =
        row.skill.slug === "python" ? "INTERMEDIATE" : "ADVANCED";
      if (!row.proficiency) {
        await prisma.userSkill.update({
          where: { userId_skillId: { userId: demoUser.id, skillId: row.skillId } },
          data: { proficiency: level },
        });
      }
    }
  }

  console.log("TaskMatch DEMO opportunities ready.");
}

const standalone = process.argv[1]?.includes("taskmatch-seed");
if (standalone) {
  const prisma = new PrismaClient();
  seedTaskMatch(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
