import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { seedTaskMatch } from "./taskmatch-seed.js";

const prisma = new PrismaClient();

const domains = [
  { name: "Coding / Software Engineering", slug: "coding" },
  { name: "Mathematics", slug: "mathematics" },
  { name: "Science / STEM", slug: "science" },
  { name: "Finance", slug: "finance" },
  { name: "Healthcare / Medicine", slug: "healthcare" },
  { name: "Legal", slug: "legal" },
  { name: "Writing", slug: "writing" },
  { name: "Translation / Languages", slug: "translation" },
  { name: "Research", slug: "research" },
  { name: "Generalist AI Evaluation", slug: "generalist" },
  { name: "Data Annotation", slug: "data-annotation" },
  { name: "Other", slug: "other" },
];

const skills = [
  { name: "Python", slug: "python", domain: "coding" },
  { name: "JavaScript", slug: "javascript", domain: "coding" },
  { name: "TypeScript", slug: "typescript", domain: "coding" },
  { name: "Swift", slug: "swift", domain: "coding" },
  { name: "Java", slug: "java", domain: "coding" },
  { name: "C++", slug: "cpp", domain: "coding" },
  { name: "C#", slug: "csharp", domain: "coding" },
  { name: "Go", slug: "go", domain: "coding" },
  { name: "Rust", slug: "rust", domain: "coding" },
  { name: "SQL", slug: "sql", domain: "coding" },
  { name: "React", slug: "react", domain: "coding" },
  { name: "Flutter", slug: "flutter", domain: "coding" },
  { name: "Node.js", slug: "nodejs", domain: "coding" },
  { name: "LLM Evaluation", slug: "llm-evaluation", domain: null },
  { name: "Prompt Evaluation", slug: "prompt-evaluation", domain: null },
  { name: "Agent Evaluation", slug: "agent-evaluation", domain: null },
  { name: "Tool Calling", slug: "tool-calling", domain: null },
  { name: "RAG", slug: "rag", domain: null },
  { name: "Code Evaluation", slug: "code-evaluation", domain: "coding" },
  { name: "RLHF", slug: "rlhf", domain: null },
  { name: "Data Annotation", slug: "data-annotation", domain: "data-annotation" },
  { name: "Research", slug: "research", domain: "research" },
  { name: "Fact Checking", slug: "fact-checking", domain: "research" },
];

/** DEMO fixtures — popular AI training / expert / annotation platforms */
const companies: Array<{
  name: string;
  slug: string;
  description: string;
  website: string;
  country: string;
  headquarters?: string;
  /** Score bias 0–1 used to vary DEMO TaskScore profiles */
  qualityBias: number;
  payBias: number;
}> = [
  {
    name: "Outlier",
    slug: "outlier",
    description:
      "AI training and evaluation platform connecting experts with model improvement work.",
    website: "https://outlier.ai",
    country: "United States",
    headquarters: "San Francisco, CA",
    qualityBias: 0.72,
    payBias: 0.78,
  },
  {
    name: "Mercor",
    slug: "mercor",
    description:
      "Expert network matching specialists to AI and research task work.",
    website: "https://mercor.com",
    country: "United States",
    headquarters: "San Francisco, CA",
    qualityBias: 0.8,
    payBias: 0.85,
  },
  {
    name: "DataAnnotation",
    slug: "dataannotation",
    description:
      "Remote data annotation and AI evaluation contractor platform.",
    website: "https://www.dataannotation.tech",
    country: "United States",
    qualityBias: 0.68,
    payBias: 0.7,
  },
  {
    name: "Turing",
    slug: "turing",
    description:
      "Remote engineering and AI talent platform for LLM training, evaluation, and software work.",
    website: "https://www.turing.com",
    country: "United States",
    headquarters: "Palo Alto, CA",
    qualityBias: 0.7,
    payBias: 0.75,
  },
  {
    name: "Scale AI",
    slug: "scale-ai",
    description:
      "Data platform supporting ML evaluation, labeling, and AI training workflows.",
    website: "https://scale.com",
    country: "United States",
    headquarters: "San Francisco, CA",
    qualityBias: 0.65,
    payBias: 0.72,
  },
  {
    name: "Alignerr",
    slug: "alignerr",
    description:
      "Expert network for AI alignment, evaluation, and specialized domain task work.",
    website: "https://alignerr.com",
    country: "United States",
    qualityBias: 0.76,
    payBias: 0.82,
  },
  {
    name: "Surge AI",
    slug: "surge-ai",
    description:
      "RLHF, preference data, and high-quality human feedback for foundation models.",
    website: "https://surgehq.ai",
    country: "United States",
    qualityBias: 0.74,
    payBias: 0.8,
  },
  {
    name: "Invisible Technologies",
    slug: "invisible-technologies",
    description:
      "AI operations and expert workflows powering model training and evaluation at scale.",
    website: "https://invisible.email",
    country: "United States",
    qualityBias: 0.66,
    payBias: 0.7,
  },
  {
    name: "Labelbox",
    slug: "labelbox",
    description:
      "Data labeling and model evaluation platform used across computer vision and LLM workflows.",
    website: "https://labelbox.com",
    country: "United States",
    headquarters: "San Francisco, CA",
    qualityBias: 0.63,
    payBias: 0.68,
  },
  {
    name: "Remotasks",
    slug: "remotasks",
    description: "Task-based remote work platform for AI data and annotation tasks.",
    website: "https://www.remotasks.com",
    country: "United States",
    qualityBias: 0.45,
    payBias: 0.4,
  },
  {
    name: "Appen",
    slug: "appen",
    description: "Crowdsourced data collection, annotation, and evaluation for AI systems.",
    website: "https://appen.com",
    country: "Australia",
    headquarters: "Sydney",
    qualityBias: 0.5,
    payBias: 0.48,
  },
  {
    name: "Toloka",
    slug: "toloka",
    description:
      "Crowdsourcing platform for data labeling, relevance, and AI evaluation tasks.",
    website: "https://toloka.ai",
    country: "Netherlands",
    qualityBias: 0.55,
    payBias: 0.52,
  },
  {
    name: "SuperAnnotate",
    slug: "superannotate",
    description:
      "Annotation and MLOps platform supporting vision, NLP, and generative AI datasets.",
    website: "https://www.superannotate.com",
    country: "United States",
    qualityBias: 0.62,
    payBias: 0.65,
  },
  {
    name: "Snorkel AI",
    slug: "snorkel-ai",
    description:
      "Data-centric AI platform focused on labeling, evaluation, and enterprise LLM workflows.",
    website: "https://snorkel.ai",
    country: "United States",
    headquarters: "Redwood City, CA",
    qualityBias: 0.69,
    payBias: 0.73,
  },
  {
    name: "Prolific",
    slug: "prolific",
    description:
      "Research participant and human-data platform used for surveys, studies, and AI evaluation.",
    website: "https://www.prolific.com",
    country: "United Kingdom",
    headquarters: "Oxford",
    qualityBias: 0.71,
    payBias: 0.6,
  },
  {
    name: "TELUS International AI",
    slug: "telus-international-ai",
    description:
      "AI data solutions spanning annotation, collection, and model evaluation (formerly Lionbridge AI).",
    website: "https://www.telusinternational.com",
    country: "Canada",
    qualityBias: 0.58,
    payBias: 0.55,
  },
];

/** Brand assets shipped as raster; everything else is an SVG in web/public/logos. */
const rasterLogos = new Set(["alignerr", "mercor", "turing"]);

function logoFile(slug: string) {
  return rasterLogos.has(slug) ? `${slug}.png` : `${slug}.svg`;
}

const countryCodes: Record<string, string> = {
  "United States": "US",
  India: "IN",
  Germany: "DE",
  Brazil: "BR",
  Singapore: "SG",
  Kenya: "KE",
  Mexico: "MX",
  "United Kingdom": "GB",
  Canada: "CA",
  Japan: "JP",
  France: "FR",
  "United Arab Emirates": "AE",
  Egypt: "EG",
  Australia: "AU",
  Argentina: "AR",
  Poland: "PL",
  "South Korea": "KR",
  Morocco: "MA",
  Netherlands: "NL",
  Indonesia: "ID",
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const onboarded = {
  onboardingStartedAt: daysAgo(20),
  onboardingCompletedAt: daysAgo(20),
  onboardingVersion: 1,
};

function clampScore(n: number) {
  return Math.min(5, Math.max(1, Math.round(n)));
}

function scoreFromBias(bias: number, variance: number) {
  const base = 1 + bias * 4;
  return clampScore(base + variance);
}

async function main() {
  console.log("Seeding Happy Tasking DEMO data (popular AI training companies)...");

  await prisma.visit.deleteMany();
  await prisma.geoCache.deleteMany();
  await prisma.matchSnapshot.deleteMany();
  await prisma.userOpportunityStatus.deleteMany();
  await prisma.savedOpportunity.deleteMany();
  await prisma.applicationTip.deleteMany();
  await prisma.screeningReport.deleteMany();
  await prisma.opportunitySkill.deleteMany();
  await prisma.opportunityDomain.deleteMany();
  await prisma.opportunityLanguage.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.companyApplicationGuide.deleteMany();
  await prisma.userLanguage.deleteMany();
  await prisma.userWorkPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.taskWatch.deleteMany();
  await prisma.contributionImpact.deleteMany();
  await prisma.marketSignalSnapshot.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.onboardingProgress.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.userDomain.deleteMany();
  await prisma.profileVisibility.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.complaintReply.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.availabilitySkill.deleteMany();
  await prisma.taskAvailabilityReport.deleteMany();
  await prisma.payReportSkill.deleteMany();
  await prisma.payReport.deleteMany();
  await prisma.reviewSkill.deleteMany();
  await prisma.review.deleteMany();
  await prisma.experienceSkill.deleteMany();
  await prisma.workerExperience.deleteMany();
  await prisma.companyScoreSnapshot.deleteMany();
  await prisma.researchPanelOptIn.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@happytasking.com",
      username: "maya_r",
      displayName: "Maya R.",
      passwordHash,
      country: "United States",
      countryCode: "US",
      contributionScore: 120,
      trustLevel: 2,
      ...onboarded,
      activatedAt: daysAgo(18),
    },
  });

  // Triage account: the workflow banner promises moderator review, so the demo
  // data needs someone who can actually perform it.
  await prisma.user.create({
    data: {
      email: "moderator@happytasking.com",
      username: "ht_moderator",
      displayName: "HT Moderation",
      passwordHash,
      role: "MODERATOR",
      country: "United States",
      countryCode: "US",
      contributionScore: 400,
      trustLevel: 4,
      ...onboarded,
    },
  });

  const contributorNames = [
    { username: "alex_k", displayName: "Alex K.", country: "United States" },
    { username: "priya_n", displayName: "Priya N.", country: "India" },
    { username: "jonas_m", displayName: "Jonas M.", country: "Germany" },
    { username: "sofia_l", displayName: "Sofia L.", country: "Brazil" },
    { username: "chen_w", displayName: "Chen W.", country: "Singapore" },
    { username: "amina_h", displayName: "Amina H.", country: "Kenya" },
    { username: "diego_r", displayName: "Diego R.", country: "Mexico" },
    { username: "emma_t", displayName: "Emma T.", country: "United Kingdom" },
    { username: "noah_p", displayName: "Noah P.", country: "Canada" },
    { username: "yuki_s", displayName: "Yuki S.", country: "Japan" },
    { username: "lucas_b", displayName: "Lucas B.", country: "France" },
    { username: "hana_a", displayName: "Hana A.", country: "United Arab Emirates" },
    { username: "omar_f", displayName: "Omar F.", country: "Egypt" },
    { username: "isla_c", displayName: "Isla C.", country: "Australia" },
    { username: "mateo_v", displayName: "Mateo V.", country: "Argentina" },
    { username: "nina_g", displayName: "Nina G.", country: "Poland" },
    { username: "kai_j", displayName: "Kai J.", country: "South Korea" },
    { username: "leila_d", displayName: "Leila D.", country: "Morocco" },
    { username: "theo_s", displayName: "Theo S.", country: "Netherlands" },
    { username: "rina_m", displayName: "Rina M.", country: "Indonesia" },
  ];

  const voterPool = [];
  for (let i = 0; i < 40; i++) {
    const persona = contributorNames[i % contributorNames.length];
    const suffix = i >= contributorNames.length ? `_${Math.floor(i / contributorNames.length)}` : "";
    voterPool.push(
      await prisma.user.create({
        data: {
          email: `contributor${i}@demo.local`,
          username: `${persona.username}${suffix}`,
          passwordHash,
          displayName: persona.displayName,
          country: persona.country,
          countryCode: countryCodes[persona.country] || null,
          ...onboarded,
        },
      }),
    );
  }

  const domainRecords = [];
  for (const d of domains) {
    domainRecords.push(
      await prisma.domain.create({
        data: { name: d.name, slug: d.slug, description: `${d.name} AI work` },
      }),
    );
  }
  const domainBySlug = Object.fromEntries(domainRecords.map((d) => [d.slug, d]));

  const skillRecords = [];
  for (const s of skills) {
    skillRecords.push(
      await prisma.skill.create({
        data: {
          name: s.name,
          slug: s.slug,
          domainId: s.domain ? domainBySlug[s.domain].id : null,
        },
      }),
    );
  }

  // Claim state is deliberately mixed so both badges and both empty states are visible.
  const claimedSlugs = new Map([
    ["outlier", "Contributor Support Lead"],
    ["mercor", "Talent Operations"],
    ["scale-ai", "Community Manager"],
  ]);
  const pendingClaimSlugs = new Set(["surge-ai"]);

  const companyMeta = new Map<string, (typeof companies)[number]>();
  const companyRecords = [];
  for (const c of companies) {
    companyMeta.set(c.slug, c);
    const { qualityBias: _q, payBias: _p, ...data } = c;
    companyRecords.push(
      await prisma.company.create({
        data: {
          ...data,
          logoUrl: `/logos/${logoFile(c.slug)}`,
          isDemo: true,
          claimStatus: claimedSlugs.has(c.slug)
            ? "CLAIMED"
            : pendingClaimSlugs.has(c.slug)
              ? "PENDING"
              : "UNCLAIMED",
          claimedAt: claimedSlugs.has(c.slug) ? daysAgo(60) : null,
        },
      }),
    );
  }

  await prisma.platformSetting.upsert({
    where: { key: "foundingTasker" },
    create: {
      key: "foundingTasker",
      value: {
        open: true,
        endsAt: null,
        requireContribution: true,
        requireOnboarding: true,
      },
    },
    update: {},
  });

  const codingDomain = domainBySlug.coding;
  const python = skillRecords.find((s) => s.slug === "python");
  const typescript = skillRecords.find((s) => s.slug === "typescript");
  const llmEval = skillRecords.find((s) => s.slug === "llm-evaluation");
  const outlier = companyRecords.find((c) => c.slug === "outlier");
  if (codingDomain && outlier && python && typescript && llmEval) {
    await prisma.userDomain.create({
      data: { userId: demoUser.id, domainId: codingDomain.id },
    });
    await prisma.userSkill.createMany({
      data: [
        { userId: demoUser.id, skillId: python.id, proficiency: "INTERMEDIATE" },
        { userId: demoUser.id, skillId: typescript.id, proficiency: "ADVANCED" },
        { userId: demoUser.id, skillId: llmEval.id, proficiency: "ADVANCED" },
      ],
    });
    await prisma.userLanguage.create({
      data: { userId: demoUser.id, code: "en", proficiency: "PROFESSIONAL" },
    });
    await prisma.userWorkPreference.create({
      data: {
        userId: demoUser.id,
        lookingStatus: "READY",
        workload: "TEN_TO_TWENTY",
        startTiming: "IMMEDIATELY",
        professionalExperienceYears: 8,
        aiWorkExperienceYears: 2,
        desiredRate: 55,
        desiredRateCurrency: "USD",
        desiredRateUnit: "HOURLY",
        githubUrl: "https://github.com/example",
      },
    });
    await prisma.workerExperience.create({
      data: {
        userId: demoUser.id,
        companyId: outlier.id,
        domainId: codingDomain.id,
        currentlyActive: true,
        tenureBucket: "SIX_TO_TWELVE_MONTHS",
        country: "United States",
        countryCode: "US",
      },
    });
    await prisma.profileVisibility.create({
      data: { userId: demoUser.id },
    });
    await prisma.userBadge.create({
      data: { userId: demoUser.id, type: "FOUNDING_TASKER" },
    });
  }

  // Company-side logins. Password is the same demo password as contributor accounts.
  const companyRepBySlug = new Map<string, { id: string; title: string }>();
  for (const company of companyRecords) {
    const title = claimedSlugs.get(company.slug);
    const pending = pendingClaimSlugs.has(company.slug);
    if (!title && !pending) continue;

    const rep = await prisma.user.create({
      data: {
        email: `team@${company.slug}.demo`,
        username: `${company.slug.replace(/-/g, "_")}_team`,
        displayName: `${company.name} Team`,
        passwordHash,
        role: "COMPANY",
        country: company.country,
      },
    });
    await prisma.companyMember.create({
      data: {
        userId: rep.id,
        companyId: company.id,
        title: title ?? "Support",
        approved: !!title,
      },
    });
    if (title) companyRepBySlug.set(company.slug, { id: rep.id, title });
  }

  const reviewTitles = [
    "Solid pay, uneven task flow",
    "Good onboarding, mixed reviewer experience",
    "Strong coding projects this quarter",
    "Low availability lately",
    "Reliable payments, unclear guidelines",
    "Expert rates competitive for domain work",
    "Would recommend for coding evaluations",
    "Support slow during project transitions",
  ];

  const reviewBodies = [
    "Pay matched the listing most weeks, but volume swung hard mid-project. No confidential details — just noting the availability pattern for others deciding where to put evenings.",
    "Onboarding was clear and relatively fast. Reviewer feedback varied a lot by batch; some notes were actionable, others were one-liners. Still would work again when the queue is full.",
    "Coding eval work has been the strongest fit for me here. Guidelines were tighter than average, which helped first-pass acceptance. Effective hourly landed close to advertised when I stopped counting idle wait time.",
    "Availability dropped for about two weeks with almost no notice. Payments stayed reliable. Worth it if you can tolerate quiet stretches.",
    "Payouts cleared on schedule every time. The guidelines doc felt thin for edge cases, so I burned time asking clarifying questions. Better docs would fix most of the friction.",
    "Domain expert rates were competitive versus other platforms I’ve tried. Revision load was lighter when the rubric was specific. Sharing ranges only — no project names.",
    "Would recommend for people comfortable with coding evaluations. Queue was steadier than my other gigs this month, and support answered within a day when I hit a platform glitch.",
    "Support got slow whenever a project was rotating. Tasks themselves were fine. Plan for longer ticket times during transitions.",
  ];

  for (const company of companyRecords) {
    const meta = companyMeta.get(company.slug)!;
    const reviewCount = 34 + (company.slug.length % 9);
    // Each company drifts in a different direction so trend lines differ.
    const drift = ((iNoise(company.slug) % 5) - 2) * 0.075;

    for (let i = 0; i < reviewCount; i++) {
      const variance = ((i % 5) - 2) * 0.32;
      const payVar = ((i % 4) - 1.5) * 0.28;
      const domain = domainRecords[i % domainRecords.length];
      // 0 = oldest report, 1 = most recent.
      const recency = reviewCount === 1 ? 1 : i / (reviewCount - 1);
      const season = Math.sin(recency * Math.PI * 2 + iNoise(company.slug)) * 0.04;
      const trended = meta.qualityBias + drift * (recency - 0.5) * 2 + season;
      const payTrended = meta.payBias + drift * 0.6 * (recency - 0.5) * 2 + season * 0.5;
      const daysBack = Math.round((1 - recency) * 115) + (iNoise(company.slug) % 4);

      const overall = scoreFromBias(trended, variance);
      const pay = scoreFromBias(payTrended, payVar);
      const reliability = scoreFromBias(payTrended + 0.05, variance * 0.5);
      const availability = scoreFromBias(trended - 0.1, ((i % 3) - 1) * 0.6);
      const stability = scoreFromBias(trended - 0.05, variance);
      const fairness = scoreFromBias(trended, payVar);
      const clarity = scoreFromBias(trended + 0.02, variance);
      const support = scoreFromBias(trended - 0.15, variance);
      const transparency = scoreFromBias(trended - 0.08, payVar);
      const author = voterPool[i % voterPool.length];
      const named = i % 4 === 0;

      await prisma.review.create({
        data: {
          companyId: company.id,
          userId: i % 2 === 0 ? demoUser.id : author.id,
          domainId: domain.id,
          country: ["United States", "India", "Brazil", "United Kingdom", "Philippines"][
            i % 5
          ],
          currentlyActive: i % 3 !== 0,
          overallExperience: overall,
          paySatisfaction: pay,
          paymentReliability: reliability,
          taskAvailability: availability,
          projectStability: stability,
          reviewerFairness: fairness,
          guidelineClarity: clarity,
          supportQuality: support,
          transparency,
          wouldWorkAgain: overall >= 3,
          title: reviewTitles[i % reviewTitles.length],
          body: reviewBodies[i % reviewBodies.length],
          identityMode: named ? "USERNAME" : "ANONYMOUS",
          displayName: named
            ? author.displayName
            : "Anonymous contributor",
          verificationStatus: i % 3 === 0 ? "VERIFIED" : "UNVERIFIED",
          isDemo: true,
          createdAt: daysAgo(daysBack),
          skills: {
            create: [{ skillId: skillRecords[i % skillRecords.length].id }],
          },
        },
      });
    }

    // Several reports per day over 30 days so daily availability has volume.
    const statuses = ["HIGH", "MODERATE", "LOW", "NO_TASKS"] as const;
    for (let day = 0; day < 30; day++) {
      const reportsToday = 2 + ((iNoise(company.slug) + day) % 3);
      for (let r = 0; r < reportsToday; r++) {
        const wave = Math.sin((day / 30) * Math.PI * 2 + iNoise(company.slug));
        const level = meta.qualityBias * 3.2 + wave * 0.9 - r * 0.35;
        const idx = Math.min(3, Math.max(0, 3 - Math.round(level)));
        await prisma.taskAvailabilityReport.create({
          data: {
            companyId: company.id,
            userId: voterPool[(day + r) % voterPool.length].id,
            domainId: domainRecords[(day + r) % domainRecords.length].id,
            availabilityStatus: statuses[idx],
            reportDate: daysAgo(day),
            isDemo: true,
            verificationStatus: (day + r) % 2 === 0 ? "VERIFIED" : "UNVERIFIED",
          },
        });
      }
    }

    for (const domain of domainRecords.slice(0, 5)) {
      const domainBase =
        domain.slug === "legal"
          ? 62
          : domain.slug === "finance"
            ? 56
            : domain.slug === "coding"
              ? 48
              : domain.slug === "healthcare"
                ? 45
                : 24;
      // One report per month over 6 months so advertised vs effective can trend.
      for (let monthsBack = 5; monthsBack >= 0; monthsBack--) {
        const monthDrift = (5 - monthsBack) * 0.4 * (drift >= 0 ? 1 : -1);
        const advertised =
          Math.round((domainBase + meta.payBias * 12 + monthDrift) * 100) / 100;
        const gap = 0.78 + meta.payBias * 0.15 - monthsBack * 0.012;
        const effective =
          Math.round(
            (advertised * gap - (iNoise(company.slug) % 4)) * 100,
          ) / 100;

        await prisma.payReport.create({
          data: {
            companyId: company.id,
            userId: demoUser.id,
            domainId: domain.id,
            advertisedRate: advertised,
            advertisedRateUnit: "HOURLY",
            effectiveRate: Math.max(12, effective),
            currency: "USD",
            paymentModel: "HOURLY",
            isDemo: true,
            verificationStatus: "VERIFIED",
            createdAt: daysAgo(monthsBack * 30 + (domain.slug.length % 6)),
          },
        });
      }
    }

    const idx = companyRecords.indexOf(company);
    const issueSeeds = [
      {
        category: "PAYMENT" as const,
        title: (name: string) => `Payout delayed past the stated window on ${name}`,
        body: (name: string) =>
          `My last ${name} payout cleared 11 days after the stated 7-day window. Support acknowledged the ticket but only gave a generic “processing” reply. No confidential project details — just the payment timeline gap.`,
        desiredOutcome:
          "Confirm the new payout ETA and whether late payments are systematic this month.",
        response: (name: string) =>
          `Thanks for reporting this. Our finance team at ${name} is clearing a backlog from last week’s batch; impacted contributors should see funds within 48 hours.`,
      },
      {
        category: "TASK_AVAILABILITY" as const,
        title: () => "Task volume dropped overnight with no notice",
        body: (name: string) =>
          `On ${name} I went from steady mid-week volume to almost nothing overnight. No email, no dashboard banner. Curious if others on the same domain saw the same cliff, or if it was account-level.`,
        desiredOutcome: "Clearer communication when projects pause or rotate.",
        response: () =>
          "That drop was project-level, not account-level — a client paused intake while they revised the rubric. We're adding a dashboard banner for pauses longer than 24 hours so this stops being a surprise.",
      },
      {
        category: "REVIEWER_DISPUTE" as const,
        title: () => "Revision loop without actionable feedback",
        body: (name: string) =>
          `Had three revision rounds on the same ${name} batch with feedback that only said “doesn’t meet guidelines.” No line-level notes. Happy to fix work — just need concrete criteria so I’m not guessing.`,
        desiredOutcome: "Reviewer notes that cite the specific guideline clause.",
        response: () =>
          "We’re updating the reviewer checklist this sprint so rejections require a guideline citation. Appreciate the patience while that rolls out.",
      },
      {
        category: "SUPPORT" as const,
        title: (name: string) => `Support ticket unanswered for 9 days at ${name}`,
        body: (name: string) =>
          `Opened a ${name} ticket about an account hold and haven’t gotten a human reply in nine days — only the auto-ack. Holding work in the meantime.`,
        desiredOutcome: "A named agent and a clear status on the hold.",
        response: () =>
          "Apologies for the silence — the hold queue was mis-routed for part of last week. Your ticket now has a named owner and holds older than 72 hours are being worked first.",
      },
      {
        category: "RATE_CHANGE" as const,
        title: () => "Effective rate lower after a quiet rate change",
        body: (name: string) =>
          `Advertised rate stayed the same on the ${name} listing, but the per-task payout changed mid-project. Only noticed after exporting the weekly statement. Looking for others who tracked effective hourly before/after.`,
        desiredOutcome:
          "In-product notice when per-task rates change on an active project.",
        response: () =>
          "You're right that the change wasn't announced well. Per-task rates on active projects will now trigger an in-product notice and an email before they take effect.",
      },
      {
        category: "THROTTLE_TASK_LIMIT" as const,
        title: () => "Daily task cap applied without explanation",
        body: (name: string) =>
          `Hit a hard daily cap on ${name} that wasn’t there last month. Profile still shows “active,” and there’s no note in the dashboard. Would like to know if it’s quality-based or project-wide.`,
        desiredOutcome: "Explain the throttle criteria and how to appeal.",
        response: () =>
          "Some projects now use soft daily caps to keep review queues healthy. If your quality metrics stay green for two weeks, the cap lifts automatically.",
      },
      {
        category: "GUIDELINES" as const,
        title: () => "Guidelines changed mid-batch without a changelog",
        body: (name: string) =>
          `Started a ${name} batch under one rubric and got dinged against a stricter version that appeared mid-week. No email, no version stamp on the doc. Wasted a few hours redoing work that was previously accepted.`,
        desiredOutcome: "Versioned guidelines and a notice when they change.",
        response: () =>
          "Guidelines now carry a version stamp and a changelog entry. Work submitted under a previous version won't be judged against the newer rubric — reach out if a batch was already affected.",
      },
      {
        category: "UNPAID_ONBOARDING" as const,
        title: () => "Unpaid assessment took longer than disclosed",
        body: (name: string) =>
          `${name} listed assessments as ~2 hours. Mine ran closer to 5 with a redo request. Fine if that’s the bar — just want the time estimate to be honest so people can plan.`,
        desiredOutcome: "Update the public time estimate for assessments.",
        response: (name: string) =>
          `${name} is reviewing assessment length estimates by domain. Thanks for the signal.`,
      },
    ];
    const seed = issueSeeds[idx % issueSeeds.length];
    const author = voterPool[idx % voterPool.length];
    const name = company.name;
    const rep = companyRepBySlug.get(company.slug);
    // Only claimed profiles have a verified rep, so only they can answer publicly.
    const officialReply = rep ? seed.response(name) : null;
    const openedAt = daysAgo(1 + (idx % 12));

    const complaint = await prisma.complaint.create({
      data: {
        publicId: `HT-${10000 + idx}`,
        companyId: company.id,
        userId: author.id,
        category: seed.category,
        title: seed.title(name),
        body: seed.body(name),
        desiredOutcome: seed.desiredOutcome,
        verificationStatus: "VERIFIED",
        status: officialReply ? "COMPANY_RESPONDED" : "PUBLISHED",
        publicIdentityMode: idx % 3 === 0 ? "USERNAME" : "ANONYMOUS",
        isDemo: true,
        submittedAt: openedAt,
      },
    });

    if (officialReply && rep) {
      // Space the thread across the window that has actually elapsed since the
      // report was filed. Fixed offsets would overshoot `now` on recent issues and
      // sort seeded replies after genuinely new ones.
      const elapsed = Date.now() - openedAt.getTime();
      const at = (fraction: number) =>
        new Date(openedAt.getTime() + Math.round(elapsed * fraction));

      await prisma.complaintReply.create({
        data: {
          complaintId: complaint.id,
          authorId: rep.id,
          authorRole: "COMPANY",
          authorTitle: rep.title,
          body: officialReply,
          isDemo: true,
          createdAt: at(0.35),
        },
      });
      await prisma.complaintReply.create({
        data: {
          complaintId: complaint.id,
          authorId: author.id,
          authorRole: "CONTRIBUTOR",
          body: "Thanks for the update — that matches what I saw on my end. I’ll report back here once it clears so others know the outcome.",
          isDemo: true,
          createdAt: at(0.7),
        },
      });
    }
  }

  const discussionSeeds: {
    title: string;
    body: string;
    category:
      | "TASK_AVAILABILITY"
      | "PAY"
      | "ONBOARDING"
      | "GENERAL"
      | "REVIEWERS";
    companySlug: string;
    authorIdx: number;
    votes: number;
    daysAgo: number;
    comments: { authorIdx: number; body: string; daysAgo: number }[];
  }[] = [
    {
      title: "Anyone else seeing coding tasks dry up mid-week?",
      body: "Last two Wednesdays I’ve opened the queue around 9am local and there’s almost nothing left by noon. Mondays still look healthy. Is this a known pattern on coding projects right now, or am I getting soft-throttled?",
      category: "TASK_AVAILABILITY",
      companySlug: "outlier",
      authorIdx: 0,
      votes: 28,
      daysAgo: 1,
      comments: [
        {
          authorIdx: 2,
          body: "Same here — Tue/Wed cliffs, Fri slightly better. I started grabbing a batch early and parking it (within the idle timeout) and that’s helped a bit.",
          daysAgo: 1,
        },
        {
          authorIdx: 5,
          body: "I’m on a different domain and still seeing steady volume, so it might be coding-specific this week rather than account-level.",
          daysAgo: 0,
        },
        {
          authorIdx: 8,
          body: "Support told me it’s “project rotation” without more detail. Would love a dashboard banner when a project pauses.",
          daysAgo: 0,
        },
      ],
    },
    {
      title: "Advertised vs effective hourly after QA — what’s realistic?",
      body: "Curious what people are actually clearing after revisions. My listing says $45–55/hr but after two revision rounds last week I landed closer to $32 effective. Not naming projects — just looking for ranges from others doing similar coding eval work.",
      category: "PAY",
      companySlug: "mercor",
      authorIdx: 1,
      votes: 19,
      daysAgo: 2,
      comments: [
        {
          authorIdx: 4,
          body: "I’ve been tracking wall-clock including wait time. $38–42 effective is my recent band when feedback is clean; drops hard if a reviewer is picky.",
          daysAgo: 2,
        },
        {
          authorIdx: 7,
          body: "Tip: stop the timer when you’re waiting on review. My advertised-to-effective gap shrank a lot once I stopped counting idle hours.",
          daysAgo: 1,
        },
      ],
    },
    {
      title: "How long did onboarding actually take for you?",
      body: "Just submitted assessments and trying to set expectations. I’ve seen “1–3 days” on the site — is that still accurate, or should I plan for a week+ before the first paid task?",
      category: "ONBOARDING",
      companySlug: "dataannotation",
      authorIdx: 3,
      votes: 14,
      daysAgo: 3,
      comments: [
        {
          authorIdx: 6,
          body: "Took me 5 calendar days from submit to first paid task. Assessments themselves were ~4 hours total.",
          daysAgo: 2,
        },
        {
          authorIdx: 9,
          body: "Mine was closer to 10 days — they asked for a redo on one section. Stay responsive in email; that sped things up for a friend.",
          daysAgo: 2,
        },
      ],
    },
    {
      title: "Turing vs Outlier for coding experts right now?",
      body: "Trying to decide where to put my evenings. Care most about (1) consistent weekly hours and (2) pay that doesn’t evaporate after QA. What’s the current vibe from people active on both?",
      category: "GENERAL",
      companySlug: "turing",
      authorIdx: 10,
      votes: 22,
      daysAgo: 2,
      comments: [
        {
          authorIdx: 0,
          body: "Outlier has felt lumpier on volume this month but the tasks I do get clear faster. Turing has been steadier for me, slightly lower ceiling.",
          daysAgo: 2,
        },
        {
          authorIdx: 11,
          body: "I’m splitting 60/40 Turing/Outlier. When one goes quiet the other usually has something. Not glamorous, but it smooths the week.",
          daysAgo: 1,
        },
        {
          authorIdx: 14,
          body: "Watch the revision culture more than the sticker rate. A $50 listing with heavy rework can lose to a $40 listing with clean first-pass acceptance.",
          daysAgo: 1,
        },
        {
          authorIdx: 2,
          body: "+1 on tracking effective hourly for two weeks before deciding. The ranking flips once you include wait/revision time.",
          daysAgo: 0,
        },
      ],
    },
    {
      title: "Domain expert rates — finance/legal after revisions",
      body: "For folks doing finance or legal expert work: what’s your effective hourly after revisions lately? Seeing strong advertised numbers and trying to sanity-check before I commit evenings.",
      category: "PAY",
      companySlug: "alignerr",
      authorIdx: 12,
      votes: 16,
      daysAgo: 4,
      comments: [
        {
          authorIdx: 15,
          body: "Legal side here — $52–60 effective when guidelines are clear. One project dipped to ~$40 because of a vague rubric.",
          daysAgo: 3,
        },
        {
          authorIdx: 4,
          body: "Finance: closer to $48 effective. Turnaround on review has been the bigger variable than the sticker rate.",
          daysAgo: 3,
        },
      ],
    },
    {
      title: "Preference / RLHF volume this week — anyone busy?",
      body: "Preference-data work looked solid last week and went quiet Monday. Checking if it’s a broad dip or just my account. No project names — just looking for a pulse check.",
      category: "TASK_AVAILABILITY",
      companySlug: "surge-ai",
      authorIdx: 16,
      votes: 13,
      daysAgo: 1,
      comments: [
        {
          authorIdx: 8,
          body: "Also quiet on my side since Sunday. A few short batches popped up Tuesday morning and vanished fast.",
          daysAgo: 1,
        },
        {
          authorIdx: 17,
          body: "I refreshed around 7am local and grabbed a decent queue. Timing seems to matter more than usual this week.",
          daysAgo: 0,
        },
      ],
    },
    {
      title: "Reviewer fairness — how do you handle vague rejections?",
      body: "Getting rejections that just say “doesn’t meet guidelines” with no line notes. I want to improve, but there’s nothing actionable. How are others handling this without escalating every time?",
      category: "REVIEWERS",
      companySlug: "scale-ai",
      authorIdx: 18,
      votes: 11,
      daysAgo: 5,
      comments: [
        {
          authorIdx: 19,
          body: "I reply once asking which guideline clause failed. About half the time I get a useful note; otherwise I document it and move on.",
          daysAgo: 4,
        },
      ],
    },
    {
      title: "Pay reliability check — anyone still waiting on last week’s batch?",
      body: "My statement shows “paid” but the bank transfer hasn’t landed. Usually clears in 2–3 days; it’s day 6. Is anyone else seeing a delay this cycle?",
      category: "PAY",
      companySlug: "prolific",
      authorIdx: 7,
      votes: 18,
      daysAgo: 0,
      comments: [
        {
          authorIdx: 1,
          body: "Mine hit yesterday after 5 days. Slower than usual but it did arrive.",
          daysAgo: 0,
        },
        {
          authorIdx: 13,
          body: "Still waiting too. Opened a ticket this morning — will update if I hear back.",
          daysAgo: 0,
        },
      ],
    },
  ];

  for (const d of discussionSeeds) {
    const company = companyRecords.find((c) => c.slug === d.companySlug)!;
    const author = voterPool[d.authorIdx % voterPool.length];
    const discussion = await prisma.discussion.create({
      data: {
        title: d.title,
        body: d.body,
        category: d.category,
        authorId: author.id,
        companyId: company.id,
        domainId: domainBySlug.coding.id,
        isDemo: true,
        createdAt: daysAgo(d.daysAgo),
      },
    });

    for (let i = 0; i < d.votes; i++) {
      await prisma.vote.create({
        data: {
          userId: voterPool[i % voterPool.length].id,
          targetType: "DISCUSSION",
          targetId: discussion.id,
          value: 1,
        },
      });
    }

    for (const c of d.comments) {
      await prisma.comment.create({
        data: {
          discussionId: discussion.id,
          authorId: voterPool[c.authorIdx % voterPool.length].id,
          body: c.body,
          isDemo: true,
          createdAt: daysAgo(c.daysAgo),
        },
      });
    }
  }

  await seedTaskMatch(prisma);

  console.log("Seed complete.");
  console.log("Contributor login: demo@happytasking.com / password123");
  console.log(
    `Company logins (password123): ${[...claimedSlugs.keys()]
      .map((s) => `team@${s}.demo`)
      .join(", ")}`,
  );
  console.log(
    `Companies: ${companyRecords.length} → ${companyRecords.map((c) => c.name).join(", ")}`,
  );
  console.log(`Skills: ${skillRecords.length}, Domains: ${domainRecords.length}`);
}

function iNoise(slug: string) {
  return slug.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
