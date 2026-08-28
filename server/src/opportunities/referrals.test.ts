import assert from "node:assert/strict";
import { DEFAULT_REFERRAL_DISCLOSURE } from "./referrals.js";
import { COMMERCIAL_INDEPENDENCE_STATEMENT } from "./provenance.js";

function resolve(input: {
  original: string | null;
  referral?: { url: string; authorized: boolean; active: boolean } | null;
}) {
  if (input.referral?.authorized && input.referral.active) {
    return { url: input.referral.url, usedReferral: true, disclosure: DEFAULT_REFERRAL_DISCLOSURE };
  }
  return { url: input.original, usedReferral: false, disclosure: null };
}

function testFallbackToOriginal() {
  const out = resolve({
    original: "https://job-boards.greenhouse.io/xai/jobs/1",
    referral: { url: "https://happytasking.example/ref", authorized: false, active: true },
  });
  assert.equal(out.usedReferral, false);
  assert.equal(out.url, "https://job-boards.greenhouse.io/xai/jobs/1");
}

function testUsesAuthorizedReferral() {
  const out = resolve({
    original: "https://work.mercor.com/jobs/1",
    referral: { url: "https://work.mercor.com/jobs/1?ht=1", authorized: true, active: true },
  });
  assert.equal(out.usedReferral, true);
  assert.ok(out.disclosure?.includes("commission"));
}

function testIndependenceCopy() {
  assert.ok(COMMERCIAL_INDEPENDENCE_STATEMENT.includes("do not influence"));
}

testFallbackToOriginal();
testUsesAuthorizedReferral();
testIndependenceCopy();
console.log("referrals.test.ts ok");
