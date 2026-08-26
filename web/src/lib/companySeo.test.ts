import assert from "node:assert/strict";
import {
  companyPageDescription,
  companyPageMetadata,
  companyPageTitle,
  companySEOEligibility,
  companySeoSections,
  jsonLdContainsForbiddenMetrics,
  listedCompanyJsonLd,
} from "./companySeo";
import type { Company } from "./types";

const realInput = {
  name: "Example Labs",
  slug: "example-labs",
  status: "ACTIVE",
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

function testDemoRemainsNoindex() {
  const result = companySEOEligibility({ ...realInput, isDemo: true });
  assert.equal(result.indexable, false);
  assert.equal(result.includeInSitemap, false);
  assert.deepEqual(result.reasons, ["DEMO_ONLY"]);
}

function testRealEligibleIsIndexableAndSitemap() {
  const result = companySEOEligibility(realInput);
  assert.equal(result.indexable, true);
  assert.equal(result.includeInSitemap, true);
  assert.deepEqual(result.reasons, []);
}

function testTitleIsCompanySpecific() {
  assert.equal(
    companyPageTitle("Outlier"),
    "Outlier Reviews, Pay & Task Availability | Happy Tasking",
  );
}

function testCanonicalAndOgAreCompanySpecific() {
  const company = {
    name: "Outlier",
    slug: "outlier",
    description: "Public description",
    website: "https://outlier.ai",
    logoUrl: null,
    headquarters: null,
    country: null,
    isDemo: false,
    id: "1",
  } satisfies Company;
  const meta = companyPageMetadata(company, true);
  assert.equal(
    meta.alternates?.canonical,
    "https://happytasking.com/companies/outlier",
  );
  assert.equal(
    (meta.openGraph as { title?: string })?.title,
    "Outlier Reviews, Pay & Task Availability | Happy Tasking",
  );
  assert.equal(
    (meta.twitter as { title?: string })?.title,
    "Outlier Reviews, Pay & Task Availability | Happy Tasking",
  );
}

function testDemoDescriptionNotPresentedAsProduction() {
  assert.match(
    companyPageDescription("Outlier", true),
    /demo data/i,
  );
}

function testEmptySectionsOmitted() {
  const sections = companySeoSections({
    isDemo: true,
    description: "",
    reviews: [],
    payByDomain: [],
    similarCompanies: [],
    topIssues: [{ category: "PAY", count: 3 }],
  });
  assert.ok(!sections.includes("pay"));
  assert.ok(!sections.includes("reviews"));
  assert.ok(!sections.includes("similar"));
  assert.ok(!sections.includes("issues"));
  assert.ok(sections.includes("taskmatch"));
}

function testPaySectionOnlyWhenData() {
  const sections = companySeoSections({
    description: "A real public company description that is long enough.",
    payByDomain: [
      { domain: "Coding", advertisedRate: 20, effectiveRate: 18, sampleSize: 4 },
    ],
  });
  assert.ok(sections.includes("overview"));
  assert.ok(sections.includes("pay"));
}

function testListedJsonLdOmitsDemoAndRatings() {
  const demo: Company = {
    id: "1",
    name: "Outlier",
    slug: "outlier",
    description: "Demo",
    website: "https://outlier.ai",
    logoUrl: null,
    headquarters: null,
    country: null,
    isDemo: true,
  };
  assert.equal(listedCompanyJsonLd(demo, false), null);
  const real: Company = { ...demo, isDemo: false, description: realInput.description };
  const jsonLd = listedCompanyJsonLd(real, true);
  assert.ok(jsonLd);
  assert.equal(jsonLdContainsForbiddenMetrics(jsonLd), false);
  assert.equal(jsonLd["@type"], "Organization");
}

function testEligibilityDeterministic() {
  const a = companySEOEligibility(realInput);
  const b = companySEOEligibility(realInput);
  assert.deepEqual(a, b);
}

testDemoRemainsNoindex();
testRealEligibleIsIndexableAndSitemap();
testTitleIsCompanySpecific();
testCanonicalAndOgAreCompanySpecific();
testDemoDescriptionNotPresentedAsProduction();
testEmptySectionsOmitted();
testPaySectionOnlyWhenData();
testListedJsonLdOmitsDemoAndRatings();
testEligibilityDeterministic();
console.log("companySeo.test.ts ok");
