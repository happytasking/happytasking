import assert from "node:assert/strict";
import { companySEOEligibility } from "./companySeo.eligibility.js";
import {
  comparisonSEOEligibility,
  normalizeComparisonPair,
  selectComparisonPairs,
  MAX_COMPARISONS_PER_COMPANY,
  MAX_SITEMAP_COMPARISONS,
} from "./comparisonSeo.eligibility.js";

const realA = {
  name: "Mercor",
  slug: "mercor",
  status: "ACTIVE" as const,
  isDemo: false,
  website: "https://mercor.com",
  description:
    "Mercor publishes public AI work programs for independent contributors.",
  reviews: 4,
  payReports: 2,
  availabilityReports: 1,
  opportunities: 1,
  complaints: 0,
};

const realB = {
  name: "Turing",
  slug: "turing",
  status: "ACTIVE" as const,
  isDemo: false,
  website: "https://turing.com",
  description:
    "Turing lists public remote software work for independent engineers.",
  reviews: 3,
  payReports: 1,
  availabilityReports: 1,
  opportunities: 1,
  complaints: 0,
};

function testAlphabeticalCanonicalOrder() {
  const pair = normalizeComparisonPair("outlier", "mercor");
  assert.equal(pair?.slug, "mercor-vs-outlier");
  assert.equal(normalizeComparisonPair("mercor", "outlier")?.slug, pair?.slug);
}

function testSameCompanyNull() {
  assert.equal(normalizeComparisonPair("outlier", "outlier"), null);
  const result = comparisonSEOEligibility(realA, { ...realA });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("SAME_COMPANY"));
}

function testDemoNotIndexableOrSitemap() {
  const result = comparisonSEOEligibility(
    { ...realA, isDemo: true },
    { ...realB, isDemo: true },
  );
  assert.equal(result.indexable, false);
  assert.equal(result.includeInSitemap, false);
  assert.ok(result.reasons.includes("DEMO_ONLY"));
}

function testRealPairIndexable() {
  assert.equal(companySEOEligibility(realA).indexable, true);
  assert.equal(companySEOEligibility(realB).indexable, true);
  const result = comparisonSEOEligibility(realA, realB);
  assert.equal(result.indexable, true);
  assert.equal(result.includeInSitemap, true);
  assert.deepEqual(result.reasons, []);
}

function testIneligibleCompany() {
  const thin = {
    ...realB,
    name: "Shell",
    slug: "shell",
    description: "x",
    website: null,
    reviews: 0,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 0,
    complaints: 0,
  };
  const result = comparisonSEOEligibility(realA, thin);
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("COMPANY_B_INELIGIBLE"));
}

function testNoNxNExplosion() {
  const companies = Array.from({ length: 20 }, (_, i) => ({
    slug: `co-${String(i).padStart(2, "0")}`,
    domains: ["Coding"],
    updatedAt: new Date("2026-01-01"),
  }));
  const pairs = selectComparisonPairs(companies);
  assert.ok(pairs.length <= MAX_SITEMAP_COMPARISONS);
  const full = (20 * 19) / 2;
  assert.ok(pairs.length < full);
  const counts = new Map<string, number>();
  for (const pair of pairs) {
    const [left, right] = [pair.left, pair.right];
    counts.set(left, (counts.get(left) ?? 0) + 1);
    counts.set(right, (counts.get(right) ?? 0) + 1);
    assert.equal(pair.slug, `${left}-vs-${right}`);
    assert.ok(left.localeCompare(right, "en") <= 0);
  }
  for (const count of counts.values()) {
    assert.ok(count <= MAX_COMPARISONS_PER_COMPANY);
  }
}

function testNoDomainOverlapNoPair() {
  const pairs = selectComparisonPairs([
    { slug: "alpha", domains: ["Legal"], updatedAt: new Date() },
    { slug: "beta", domains: ["Coding"], updatedAt: new Date() },
  ]);
  assert.equal(pairs.length, 0);
}

function testSameWebsiteNotDistinct() {
  const result = comparisonSEOEligibility(realA, {
    ...realB,
    website: "https://www.mercor.com",
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("INSUFFICIENT_DISTINCT_CONTENT"));
}

testAlphabeticalCanonicalOrder();
testSameCompanyNull();
testDemoNotIndexableOrSitemap();
testRealPairIndexable();
testIneligibleCompany();
testNoNxNExplosion();
testNoDomainOverlapNoPair();
testSameWebsiteNotDistinct();
console.log("comparisonSeo.eligibility.test.ts ok");
