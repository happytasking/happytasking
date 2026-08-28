import assert from "node:assert/strict";
import {
  brazilEligibleLabel,
  matchesCountryFilter,
  parseCountryLocation,
} from "./country.js";

function testDefaultBrazilIsConfirmedOnly() {
  const unspecified = parseCountryLocation(null, true);
  const global = parseCountryLocation("Worldwide / any country", false);
  const brazil = parseCountryLocation("Brazil, remote", true);
  assert.equal(matchesCountryFilter(unspecified, "BR"), false);
  assert.equal(matchesCountryFilter(global, "BR"), true);
  assert.equal(matchesCountryFilter(brazil, "BR"), true);
  assert.equal(brazilEligibleLabel(unspecified), null);
}

function testUnspecifiedIsUnknownNotConfirmed() {
  const parsed = parseCountryLocation("", false);
  assert.equal(parsed.eligibility, "UNSPECIFIED");
  assert.equal(brazilEligibleLabel(parsed), null);
  assert.equal(matchesCountryFilter(parsed, "BR"), false);
}

function testRemoteIsNotWorldwide() {
  const parsed = parseCountryLocation(null, true);
  assert.equal(parsed.eligibility, "UNSPECIFIED");
  assert.deepEqual(parsed.codes, []);
  assert.equal(brazilEligibleLabel(parsed), null);
  assert.equal(matchesCountryFilter(parsed, "BR"), false);
  assert.equal(matchesCountryFilter(parsed, "BR", { includeUnspecified: true }), true);
}

function testExplicitBrazil() {
  const parsed = parseCountryLocation("Brazil, remote", true);
  assert.equal(parsed.eligibility, "EXPLICIT");
  assert.ok(parsed.codes.includes("BR"));
  assert.equal(matchesCountryFilter(parsed, "BR"), true);
  assert.equal(brazilEligibleLabel(parsed), "Brazil eligible");
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
testDefaultBrazilIsConfirmedOnly();
testUnspecifiedIsUnknownNotConfirmed();
testExplicitBrazil();
testUsLocationNotBrazilEligible();
testGlobal();
console.log("country.test.ts ok");
