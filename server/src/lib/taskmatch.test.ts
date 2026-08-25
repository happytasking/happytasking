import assert from "node:assert/strict";
import {
  computeCandidateMatch,
  computeOpportunityQuality,
  matchConfidence,
  recommendationLabel,
} from "./taskmatch.js";

const python = { skillId: "py", slug: "python", name: "Python", required: true, preferredLevel: "ADVANCED" };
const ts = { skillId: "ts", slug: "typescript", name: "TypeScript", required: true };
const agent = { skillId: "ag", slug: "agent-evaluation", name: "Agent Evaluation", required: false };

const baseOpp = {
  domainIds: ["coding"],
  skills: [python, ts, agent],
  countryRestrictions: ["US", "BR", "IN"],
  languageRequirements: ["en"],
  experienceYearsMin: 2,
  experienceYearsPreferred: 5,
  weeklyHoursMin: 10,
  weeklyHoursMax: 30,
  minRate: 40,
  maxRate: 70,
  rateUnit: "HOURLY",
};

const strongProfile = {
  countryCode: "BR",
  domainIds: ["coding"],
  skills: [
    { skillId: "py", slug: "python", name: "Python", proficiency: "ADVANCED" },
    { skillId: "ts", slug: "typescript", name: "TypeScript", proficiency: "ADVANCED" },
  ],
  languages: [{ code: "en", proficiency: "PROFESSIONAL" }],
  professionalExperienceYears: 8,
  aiWorkExperienceYears: 3,
  lookingStatus: "READY",
  workload: "TEN_TO_TWENTY",
  desiredRate: 55,
  desiredRateUnit: "HOURLY",
  companyIds: ["outlier"],
};

{
  const match = computeCandidateMatch(strongProfile, baseOpp);
  assert.ok(match.score != null && match.score >= 85, `expected high match, got ${match.score}`);
  assert.ok(match.reasons.some((r) => r.kind === "match" && r.text === "TypeScript"));
  assert.equal(recommendationLabel(match.score, 84), "STRONG_MATCH");
}

{
  const ineligible = computeCandidateMatch(
    { ...strongProfile, countryCode: "ZZ" },
    baseOpp,
  );
  const country = ineligible.dimensions.find((d) => d.key === "country");
  assert.equal(country?.score, 0);
}

{
  const missingSkills = computeCandidateMatch(
    { ...strongProfile, skills: [] },
    { ...baseOpp, skills: [python, ts] },
  );
  assert.ok((missingSkills.score ?? 100) < 70);
  assert.ok(missingSkills.reasons.some((r) => r.kind === "gap"));
}

{
  const noProfile = computeCandidateMatch(
    {
      countryCode: null,
      domainIds: [],
      skills: [],
      languages: [],
      companyIds: [],
    },
    baseOpp,
  );
  assert.ok((noProfile.availableDimensions ?? 0) <= 3);
  assert.equal(matchConfidence({
    profileFieldsFilled: 1,
    profileFieldsTotal: 10,
    opportunityComplete: true,
    verifiedDaysAgo: 2,
    availableDimensions: noProfile.availableDimensions,
  }), "LOW");
}

{
  const closedQuality = computeOpportunityQuality({});
  assert.equal(closedQuality.score, null);
  assert.equal(closedQuality.insufficient, true);
}

{
  const quality = computeOpportunityQuality({
    taskScore: 82,
    taskAvailability: "HIGH",
    pay: 80,
    stability: 70,
    paymentReliability: 90,
    sentiment: 75,
    resolution: 88,
  });
  assert.ok(quality.score != null && quality.score >= 75);
  assert.equal(quality.insufficient, false);
}

{
  assert.equal(recommendationLabel(92, 40), "GOOD_FIT_WEAK_CONDITIONS");
  assert.equal(recommendationLabel(40, 90), "GOOD_OPPORTUNITY_SKILL_GAPS");
  assert.equal(recommendationLabel(30, 30), "LOW_PRIORITY");
}

{
  const weakPython = computeCandidateMatch(
    {
      ...strongProfile,
      skills: [
        { skillId: "py", slug: "python", name: "Python", proficiency: "BEGINNER" },
        { skillId: "ts", slug: "typescript", name: "TypeScript", proficiency: "ADVANCED" },
      ],
    },
    baseOpp,
  );
  assert.ok(
    weakPython.reasons.some((r) => r.text.includes("proficiency below preferred")),
  );
}

{
  const featured = computeCandidateMatch(strongProfile, baseOpp);
  const unfeatured = computeCandidateMatch(strongProfile, baseOpp);
  assert.equal(featured.score, unfeatured.score);
  assert.equal(
    computeOpportunityQuality({ taskScore: 80, pay: 80 }).score,
    computeOpportunityQuality({ taskScore: 80, pay: 80 }).score,
  );
}

{
  const stale = matchConfidence({
    profileFieldsFilled: 8,
    profileFieldsTotal: 10,
    opportunityComplete: true,
    verifiedDaysAgo: 45,
    availableDimensions: 6,
  });
  const fresh = matchConfidence({
    profileFieldsFilled: 8,
    profileFieldsTotal: 10,
    opportunityComplete: true,
    verifiedDaysAgo: 1,
    availableDimensions: 6,
  });
  assert.ok(stale !== "HIGH" || fresh === "HIGH");
  assert.notEqual(stale, "HIGH");
}

{
  const missingIntel = computeOpportunityQuality({
    taskScore: null,
    pay: null,
    stability: null,
  });
  assert.equal(missingIntel.insufficient, true);
  assert.equal(missingIntel.score, null);
}

console.log("taskmatch.lib tests passed");
