import assert from "node:assert/strict";
import {
  comparablePaySortValue,
  isNewListing,
  newestTimestamp,
  normalizeCountryParam,
  normalizeSearchQuery,
  normalizeWorkTypeParam,
  recommendedRank,
} from "./catalogQuery.js";

function testInvalidCountryIsIgnored() {
  assert.equal(normalizeCountryParam("INVALID"), undefined);
  assert.equal(normalizeCountryParam("br"), "BR");
  assert.equal(normalizeCountryParam("DZ"), "DZ");
  assert.equal(normalizeCountryParam(""), undefined);
}

function testWorkTypeAndSearch() {
  assert.equal(normalizeWorkTypeParam("coding"), "coding");
  assert.equal(normalizeWorkTypeParam("not-a-type"), undefined);
  assert.equal(normalizeSearchQuery("  python  "), "python");
  assert.equal(normalizeSearchQuery("%_drop"), "drop");
  assert.equal(normalizeSearchQuery("   "), undefined);
}

function testPaySortIsHourlyOnly() {
  assert.equal(comparablePaySortValue("HOURLY", 120), 120);
  assert.ok(comparablePaySortValue("PER_TASK", 500) < comparablePaySortValue("HOURLY", 1));
  assert.ok(comparablePaySortValue("HOURLY", null) < 0);
}

function testNewestIgnoresVerified() {
  const published = "2026-08-01T00:00:00.000Z";
  const verified = "2026-08-28T00:00:00.000Z";
  const firstSeen = "2026-08-10T00:00:00.000Z";
  assert.equal(
    newestTimestamp({ publishedAt: published, firstSeenAt: firstSeen }),
    new Date(published).getTime(),
  );
  assert.equal(
    newestTimestamp({ publishedAt: null, firstSeenAt: firstSeen }),
    new Date(firstSeen).getTime(),
  );
  assert.notEqual(
    newestTimestamp({ publishedAt: published, firstSeenAt: verified }),
    new Date(verified).getTime(),
  );
}

function testNewBadgeUsesPublishedAt() {
  const now = Date.parse("2026-08-28T12:00:00.000Z");
  assert.equal(isNewListing("2026-08-28T01:00:00.000Z", now), true);
  assert.equal(isNewListing("2026-08-20T01:00:00.000Z", now), false);
  assert.equal(isNewListing(null, now), false);
}

function testRecommendedIgnoresMissingMatch() {
  const withMatch = recommendedRank({ matchScore: 90, qualityScore: 40 });
  const without = recommendedRank({ matchScore: null, qualityScore: 40 });
  assert.ok(withMatch > without);
}

testInvalidCountryIsIgnored();
testWorkTypeAndSearch();
testPaySortIsHourlyOnly();
testNewestIgnoresVerified();
testNewBadgeUsesPublishedAt();
testRecommendedIgnoresMissingMatch();
console.log("catalogQuery.test.ts ok");
