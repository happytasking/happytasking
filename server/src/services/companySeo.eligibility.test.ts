import assert from "node:assert/strict";
import {
  companyHasIndexableContent,
  companySEOEligibility,
} from "./companySeo.eligibility.js";

const realShell = {
  name: "Example Labs",
  slug: "example-labs",
  status: "ACTIVE" as const,
  isDemo: false,
  website: "https://example.com",
  description:
    "Example Labs publishes public AI work programs for independent contributors.",
  reviews: 0,
  payReports: 0,
  availabilityReports: 0,
  opportunities: 0,
  complaints: 0,
};

function testDemoNeverIndexable() {
  const result = companySEOEligibility({ ...realShell, isDemo: true });
  assert.equal(result.indexable, false);
  assert.equal(result.includeInSitemap, false);
  assert.deepEqual(result.reasons, ["DEMO_ONLY"]);
}

function testInactiveIsPrivate() {
  const result = companySEOEligibility({ ...realShell, status: "INACTIVE" });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("PRIVATE"));
}

function testInvalidCompany() {
  const result = companySEOEligibility({
    ...realShell,
    name: "",
    slug: "",
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("INVALID_COMPANY"));
}

function testEmptyShellInsufficientContent() {
  const result = companySEOEligibility({
    name: "Shell",
    slug: "shell",
    status: "ACTIVE",
    isDemo: false,
    description: "Short",
    website: null,
    reviews: 0,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 0,
    complaints: 0,
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("INSUFFICIENT_CONTENT"));
}

function testDescriptionAloneQualifies() {
  const result = companySEOEligibility({
    ...realShell,
    website: null,
    reviews: 0,
  });
  assert.equal(result.indexable, true);
  assert.equal(result.includeInSitemap, true);
  assert.deepEqual(result.reasons, []);
}

function testWebsiteAndShortCopyQualifies() {
  const result = companySEOEligibility({
    name: "Acme",
    slug: "acme",
    status: "ACTIVE",
    isDemo: false,
    website: "https://acme.example",
    description: "Public AI work marketplace.",
    reviews: 0,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 0,
    complaints: 0,
  });
  assert.equal(result.indexable, true);
  assert.deepEqual(result.reasons, []);
}

function testOneRealReviewQualifiesWithoutTenReviewRule() {
  const result = companySEOEligibility({
    name: "Acme",
    slug: "acme",
    status: "ACTIVE",
    isDemo: false,
    description: "",
    website: null,
    reviews: 1,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 0,
    complaints: 0,
  });
  assert.equal(result.indexable, true);
  assert.deepEqual(result.reasons, []);
}

function testErrorStateNotIndexable() {
  const result = companySEOEligibility({ ...realShell, errorState: true });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("ERROR_STATE"));
}

function testLocalhostWebsiteDoesNotCount() {
  const result = companySEOEligibility({
    name: "Acme",
    slug: "acme",
    status: "ACTIVE",
    isDemo: false,
    website: "http://localhost:3000",
    description: "Short copy only.",
    reviews: 0,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 0,
    complaints: 0,
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("INSUFFICIENT_CONTENT"));
}

function testIndexableEqualsSitemap() {
  const demo = companySEOEligibility({ ...realShell, isDemo: true });
  const real = companySEOEligibility(realShell);
  assert.equal(demo.indexable, demo.includeInSitemap);
  assert.equal(real.indexable, real.includeInSitemap);
}

function testLegacyContentHelper() {
  assert.equal(
    companyHasIndexableContent({
      description: "Short",
      reviews: 0,
      payReports: 0,
      availabilityReports: 0,
      opportunities: 0,
      complaints: 0,
    }),
    false,
  );
  assert.equal(
    companyHasIndexableContent({
      description: "A".repeat(40),
      reviews: 0,
      payReports: 0,
      availabilityReports: 0,
      opportunities: 0,
      complaints: 0,
    }),
    true,
  );
}

function testConvertedCompanyDoesNotUseDemoReviews() {
  const result = companySEOEligibility({
    name: "Mercor",
    slug: "mercor",
    status: "ACTIVE",
    isDemo: false,
    description:
      "Expert network matching specialists to AI and research task work.",
    website: "https://mercor.com",
    reviews: 0,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 363,
    complaints: 0,
  });
  assert.equal(result.indexable, true);
  assert.deepEqual(result.reasons, []);
}

function testDemoFlagStillBlocksEvenWithRealOpportunities() {
  const result = companySEOEligibility({
    name: "Mercor",
    slug: "mercor",
    status: "ACTIVE",
    isDemo: true,
    description:
      "Expert network matching specialists to AI and research task work.",
    website: "https://mercor.com",
    reviews: 0,
    payReports: 0,
    availabilityReports: 0,
    opportunities: 363,
    complaints: 0,
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("DEMO_ONLY"));
}

testDemoNeverIndexable();
testConvertedCompanyDoesNotUseDemoReviews();
testDemoFlagStillBlocksEvenWithRealOpportunities();
testInactiveIsPrivate();
testInvalidCompany();
testEmptyShellInsufficientContent();
testDescriptionAloneQualifies();
testWebsiteAndShortCopyQualifies();
testOneRealReviewQualifiesWithoutTenReviewRule();
testErrorStateNotIndexable();
testLocalhostWebsiteDoesNotCount();
testIndexableEqualsSitemap();
testLegacyContentHelper();
console.log("companySeo.eligibility.test.ts ok");
