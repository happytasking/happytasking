import assert from "node:assert/strict";
import { canonicalApplicationKey, opportunityFingerprint } from "./fingerprint.js";

function testStableFingerprint() {
  const a = opportunityFingerprint({
    companySlug: "micro1",
    title: "Hardware Expert",
    locationText: null,
    workType: "rlhf-eval",
  });
  const b = opportunityFingerprint({
    companySlug: "Micro1",
    title: "Hardware  Expert",
    workType: "rlhf-eval",
  });
  assert.equal(a, b);
}

function testCanonicalUrlIgnoresReferral() {
  const key = canonicalApplicationKey(
    "https://jobs.micro1.ai/post/abc?referralCode=nope",
  );
  assert.equal(key, "https://jobs.micro1.ai/post/abc");
}

testStableFingerprint();
testCanonicalUrlIgnoresReferral();
console.log("fingerprint.test.ts ok");
