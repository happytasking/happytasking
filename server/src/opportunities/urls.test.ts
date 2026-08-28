import assert from "node:assert/strict";
import {
  assertAllowedHost,
  stripKnownAggregatorReferralParams,
} from "./urls.js";

function testStripsKnownReferralOnly() {
  const raw =
    "https://jobs.micro1.ai/post/abc?referralCode=9bbe0074-9b97-49af-8528-9aacfe094577&utm_source=referral&utm_medium=share&utm_campaign=job_referral&keep=1";
  const out = stripKnownAggregatorReferralParams(raw);
  assert.ok(out);
  const url = new URL(out);
  assert.equal(url.searchParams.get("referralCode"), null);
  assert.equal(url.searchParams.get("utm_source"), null);
  assert.equal(url.searchParams.get("keep"), "1");
}

function testDoesNotStripUnrelatedQuery() {
  const raw = "https://work.mercor.com/jobs/foo?gh_jid=12&utm_source=newsletter";
  const out = stripKnownAggregatorReferralParams(raw);
  assert.ok(out?.includes("gh_jid=12"));
  assert.ok(out?.includes("utm_source=newsletter"));
}

function testSsrfBlocksPrivate() {
  assert.throws(() =>
    assertAllowedHost("https://127.0.0.1/jobs", ["aitraining.jobs"]),
  );
  assert.throws(() =>
    assertAllowedHost("https://evil.example/jobs", ["aitraining.jobs"]),
  );
  const ok = assertAllowedHost("https://aitraining.jobs/", ["aitraining.jobs"]);
  assert.equal(ok.hostname, "aitraining.jobs");
}

testStripsKnownReferralOnly();
testDoesNotStripUnrelatedQuery();
testSsrfBlocksPrivate();
console.log("urls.test.ts ok");
