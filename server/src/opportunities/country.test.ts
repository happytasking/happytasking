import assert from "node:assert/strict";
import {
  brazilEligibleLabel,
  matchesCountryFilter,
  parseCountryLocation,
} from "./country.js";

function testRemoteIsNotWorldwide() {
  const parsed = parseCountryLocation(null, true);
  assert.equal(parsed.eligibility, "UNSPECIFIED");
  assert.deepEqual(parsed.codes, []);
  assert.equal(brazilEligibleLabel(parsed), null);
  assert.equal(matchesCountryFilter(parsed, "BR"), true);
}

function testUsLocationNotBrazilEligible() {
  const parsed = parseCountryLocation("Remote United States", true);
  assert.equal(parsed.eligibility, "EXPLICIT");
  assert.ok(parsed.codes.includes("US"));
  assert.equal(matchesCountryFilter(parsed, "BR"), false);
  assert.equal(brazilEligibleLabel(parsed), null);
}

function testGlobal() {
  const parsed = parseCountryLocation("Worldwide / any country", false);
  assert.equal(parsed.eligibility, "GLOBAL");
  assert.equal(matchesCountryFilter(parsed, "BR"), true);
  assert.equal(brazilEligibleLabel(parsed), "Worldwide");
}

testRemoteIsNotWorldwide();
testUsLocationNotBrazilEligible();
testGlobal();
console.log("country.test.ts ok");
