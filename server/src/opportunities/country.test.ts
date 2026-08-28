import assert from "node:assert/strict";
import {
  brazilEligibleLabel,
  countryEligibleLabel,
  isIsoCountryCode,
  ISO_COUNTRIES,
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

function testBareRemoteStaysUnspecified() {
  const parsed = parseCountryLocation("Remote", true);
  assert.equal(parsed.eligibility, "UNSPECIFIED");
  assert.equal(matchesCountryFilter(parsed, "DZ"), false);
}

function testRemoteInternationalIsGlobal() {
  const parsed = parseCountryLocation("Remote International", true);
  assert.equal(parsed.eligibility, "GLOBAL");
  assert.equal(matchesCountryFilter(parsed, "DZ"), true);
  assert.equal(countryEligibleLabel(parsed), "Worldwide");
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

function testAlgeriaGermanyIndia() {
  assert.ok(parseCountryLocation("Algeria", true).codes.includes("DZ"));
  assert.ok(parseCountryLocation("Germany", true).codes.includes("DE"));
  assert.ok(parseCountryLocation("India", true).codes.includes("IN"));
  assert.equal(matchesCountryFilter(parseCountryLocation("Algeria", true), "DZ"), true);
  assert.equal(matchesCountryFilter(parseCountryLocation("Algeria", true), "BR"), false);
}

function testMultiCountry() {
  const parsed = parseCountryLocation(
    "United States, Canada, Belgium, France, United Kingdom",
    true,
  );
  assert.equal(parsed.eligibility, "EXPLICIT");
  for (const code of ["US", "CA", "BE", "FR", "GB"]) {
    assert.ok(parsed.codes.includes(code), code);
  }
  assert.equal(matchesCountryFilter(parsed, "GB"), true);
  assert.equal(matchesCountryFilter(parsed, "DZ"), false);
  assert.equal(countryEligibleLabel(parsed), "5 countries");
  assert.equal(countryEligibleLabel(parsed, "FR"), "France eligible");
}

function testGlobal() {
  const parsed = parseCountryLocation("Worldwide / any country", false);
  assert.equal(parsed.eligibility, "GLOBAL");
  assert.equal(matchesCountryFilter(parsed, "BR"), true);
  assert.equal(brazilEligibleLabel(parsed), "Worldwide");
}

function testIsoList() {
  assert.ok(ISO_COUNTRIES.length >= 240);
  assert.equal(isIsoCountryCode("BR"), true);
  assert.equal(isIsoCountryCode("DZ"), true);
  assert.equal(isIsoCountryCode("INVALID"), false);
  assert.equal(isIsoCountryCode("br"), true);
}

function testInvalidCountryFilterIsNoFilter() {
  const parsed = parseCountryLocation("Brazil", true);
  assert.equal(matchesCountryFilter(parsed, "INVALID"), true);
}

testRemoteIsNotWorldwide();
testBareRemoteStaysUnspecified();
testRemoteInternationalIsGlobal();
testDefaultBrazilIsConfirmedOnly();
testUnspecifiedIsUnknownNotConfirmed();
testExplicitBrazil();
testUsLocationNotBrazilEligible();
testAlgeriaGermanyIndia();
testMultiCountry();
testGlobal();
testIsoList();
testInvalidCountryFilterIsNoFilter();
console.log("country.test.ts ok");
