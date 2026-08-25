import assert from "node:assert/strict";
import {
  computeAggregateConfidence,
  computeTaskScore,
  hasMinimumPublicSample,
  MIN_PUBLIC_SAMPLE_SIZE,
  periodStartDate,
} from "./taskScore.service.js";

function testEmpty() {
  const result = computeTaskScore([], "90d");
  assert.equal(result.taskScore, null);
  assert.equal(result.sampleSize, 0);
  assert.equal(result.verifiedPct, 0);
  assert.deepEqual(result.confidence, {
    score: 0,
    tier: "LOW",
    verifiedCount: 0,
    communityCount: 0,
    countryCount: 0,
    recentCount: 0,
  });
}

function testPerfectScores() {
  const result = computeTaskScore(
    [
      {
        overallExperience: 5,
        paySatisfaction: 5,
        paymentReliability: 5,
        taskAvailability: 5,
        projectStability: 5,
        reviewerFairness: 5,
        guidelineClarity: 5,
        supportQuality: 5,
        transparency: 5,
        wouldWorkAgain: true,
        verificationStatus: "VERIFIED",
      },
    ],
    "30d",
  );
  assert.equal(result.taskScore, 100);
  assert.equal(result.sampleSize, 1);
  assert.equal(result.verifiedPct, 100);
  assert.equal(result.dimensions.pay, 100);
}

function testMixed() {
  const result = computeTaskScore(
    [
      {
        overallExperience: 5,
        paySatisfaction: 5,
        paymentReliability: 5,
        taskAvailability: 5,
        projectStability: 5,
        reviewerFairness: 5,
        guidelineClarity: 5,
        supportQuality: 5,
        transparency: 5,
        wouldWorkAgain: true,
        verificationStatus: "VERIFIED",
      },
      {
        overallExperience: 1,
        paySatisfaction: 1,
        paymentReliability: 1,
        taskAvailability: 1,
        projectStability: 1,
        reviewerFairness: 1,
        guidelineClarity: 1,
        supportQuality: 1,
        transparency: 1,
        wouldWorkAgain: false,
        verificationStatus: "UNVERIFIED",
      },
    ],
    "all",
  );
  assert.equal(result.sampleSize, 2);
  assert.equal(result.verifiedPct, 50);
  assert.equal(result.dimensions.wouldWorkAgainRate, 50);
  assert.ok(result.taskScore != null && result.taskScore > 40 && result.taskScore < 60);
}

function testPeriod() {
  assert.ok(periodStartDate("7d") instanceof Date);
  assert.ok(periodStartDate("30d") instanceof Date);
  assert.ok(periodStartDate("90d") instanceof Date);
  assert.equal(periodStartDate("all"), null);
}

function testConfidence() {
  const asOf = new Date("2026-08-20T12:00:00.000Z");
  const confidence = computeAggregateConfidence(
    [
      {
        verificationStatus: "VERIFIED",
        countryCode: "US",
        createdAt: "2026-08-19T12:00:00.000Z",
      },
      {
        verificationStatus: "VERIFIED",
        countryCode: "GB",
        createdAt: "2026-08-01T12:00:00.000Z",
      },
      {
        verificationStatus: "VERIFIED",
        countryCode: "IN",
        createdAt: "2026-07-01T12:00:00.000Z",
      },
      {
        verificationStatus: "UNVERIFIED",
        country: "United States",
        createdAt: "2026-06-01T12:00:00.000Z",
      },
      {
        verificationStatus: "UNVERIFIED",
        countryCode: "US",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    asOf,
  );

  assert.deepEqual(confidence, {
    score: 53,
    tier: "MEDIUM",
    verifiedCount: 3,
    communityCount: 2,
    countryCount: 4,
    recentCount: 4,
  });
}

function testMinimumPublicSampleSafeguard() {
  assert.equal(MIN_PUBLIC_SAMPLE_SIZE, 5);
  assert.equal(hasMinimumPublicSample(4), false);
  assert.equal(hasMinimumPublicSample(5), true);
}

testEmpty();
testPerfectScores();
testMixed();
testPeriod();
testConfidence();
testMinimumPublicSampleSafeguard();
console.log("taskScore.service tests passed");
