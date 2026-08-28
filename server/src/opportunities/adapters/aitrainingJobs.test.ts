import assert from "node:assert/strict";
import {
  discoverFetchRolesActionId,
  normalizeAiTrainingRow,
  parseNextActionPayload,
  StaleFetchRolesActionError,
  SourceDegradedError,
} from "./aitrainingJobs.js";
import { parseCountryLocation } from "../country.js";

const FIXTURE = `0:{"a":"$@1","f":"","b":"abc"}
1:{"rows":[{"id":"0c3d8afd-9ee6-4008-a75b-0dd821d88c87","title":"Hardware Expert","location":null,"remote":true,"work_type":"rlhf-eval","compensation_text":"$$50-$100/hr","platform_slug":"micro1","posted_at":null,"first_seen_at":"2026-08-27T06:01:19.875685+00:00","workLabel":"RLHF / Evaluation","platformName":"micro1","platformLogoDomain":"micro1.ai","pay":{"payLow":44,"payHigh":92,"payUnit":"hour","payDisplay":"$10–$95/hr","name":"micro1","live":true},"applyHref":"https://jobs.micro1.ai/post/5f50767b-8275-4f5a-8861-08e895e0d1e2?referralCode=9bbe0074-9b97-49af-8528-9aacfe094577&utm_source=referral&utm_medium=share&utm_campaign=job_referral","applySponsored":true,"partner":true,"applyRel":"sponsored nofollow noopener","highlight":"Above-average pay"},{"id":"xai-1","title":"AI Tutor - Hausa","location":"Remote United States","remote":true,"work_type":"multilingual","compensation_text":"$35/hour - $45/hour","platform_slug":"xai","posted_at":"2026-08-27T03:12:24+00:00","first_seen_at":"2026-08-08T06:01:14.711271+00:00","workLabel":"Multilingual","platformName":"xAI (SpaceXAI)","platformLogoDomain":"x.ai","pay":{"payLow":40,"payHigh":40},"applyHref":"https://job-boards.greenhouse.io/xai/jobs/5207427007","applySponsored":false}],"total":1666}`;

function testRemoteInternationalNormalizesGlobal() {
  const parsed = parseCountryLocation("Remote International", true);
  assert.equal(parsed.eligibility, "GLOBAL");
}

function testParsesFlightAndIgnoresPlatformPay() {
  const parsed = parseNextActionPayload(FIXTURE);
  assert.equal(parsed.total, 1666);
  assert.equal(parsed.rows.length, 2);
  const hardware = normalizeAiTrainingRow(parsed.rows[0], "https://aitraining.jobs/");
  assert.equal(hardware.pay.minRate, 50);
  assert.equal(hardware.pay.maxRate, 100);
  assert.notEqual(hardware.pay.minRate, 44);
  assert.ok(hardware.originalApplicationUrl);
  assert.equal(
    new URL(hardware.originalApplicationUrl!).searchParams.get("referralCode"),
    null,
  );
  assert.ok(hardware.rawDiscoveryApplicationUrl?.includes("referralCode"));
  assert.equal(hardware.relevance.status, "ACCEPTED");
  assert.equal(hardware.country.eligibility, "UNSPECIFIED");
  assert.equal(parsed.rows[0].highlight, "Above-average pay");
}

function testPostedAtIsNotFirstSeen() {
  const parsed = parseNextActionPayload(FIXTURE);
  const hardware = normalizeAiTrainingRow(parsed.rows[0], "https://aitraining.jobs/");
  assert.equal(hardware.postedAt, null);
  assert.ok(hardware.sourceFirstSeenAt);
  const tutor = normalizeAiTrainingRow(parsed.rows[1], "https://aitraining.jobs/");
  assert.ok(tutor.postedAt);
  assert.ok(tutor.primary.official);
  assert.equal(tutor.country.codes.includes("US"), true);
}

function testDiscoversActionId() {
  const js =
    'let K=(0,z.createServerReference)("4029040649fbd3207c680ae9257a83274a7b265852",z.callServer,void 0,z.findSourceMapURL,"fetchRoles")';
  assert.equal(
    discoverFetchRolesActionId(js),
    "4029040649fbd3207c680ae9257a83274a7b265852",
  );
}

function testActionIdChangeIsDiscoveredFromPublicJs() {
  const previous = "4029040649fbd3207c680ae9257a83274a7b265852";
  const next = "111111111111111111111111111111111111111111";
  const js = `createServerReference)("${next}",z.callServer,void 0,z.findSourceMapURL,"fetchRoles")`;
  assert.equal(discoverFetchRolesActionId(js), next);
  assert.notEqual(discoverFetchRolesActionId(js), previous);
}

function testStalePayloadThrowsTypedError() {
  assert.throws(
    () => parseNextActionPayload("<html>no flight</html>"),
    (error: unknown) => error instanceof StaleFetchRolesActionError,
  );
}

function testSourceDegradedErrorIsActionable() {
  const error = new SourceDegradedError(
    "AITraining.jobs fetchRoles action could not be rediscovered from public pages",
  );
  assert.equal(error.name, "SourceDegradedError");
  assert.match(error.message, /rediscovered/);
}

testParsesFlightAndIgnoresPlatformPay();
testRemoteInternationalNormalizesGlobal();
testPostedAtIsNotFirstSeen();
testDiscoversActionId();
testActionIdChangeIsDiscoveredFromPublicJs();
testStalePayloadThrowsTypedError();
testSourceDegradedErrorIsActionable();
console.log("aitrainingJobs.test.ts ok");
