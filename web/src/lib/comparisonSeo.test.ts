import assert from "node:assert/strict";
import {
  comparisonMetricDisplay,
  comparisonPageMetadata,
  comparisonPageTitle,
  comparisonProductValidity,
  comparisonSEOEligibility,
  comparisonSeoSections,
  comparisonPath,
  isCanonicalComparisonSlug,
  isValidRelatedComparison,
  normalizeComparisonPair,
  parseComparisonSlug,
  relatedComparisonPairs,
} from "./comparisonSeo";
import type { Company } from "./types";

const realA = {
  name: "Mercor",
  slug: "mercor",
  status: "ACTIVE",
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
  status: "ACTIVE",
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

function company(partial: Partial<Company> & Pick<Company, "name" | "slug">): Company {
  return {
    id: partial.id || partial.slug,
    description: partial.description || "",
    website: partial.website ?? null,
    logoUrl: null,
    headquarters: null,
    country: null,
    isDemo: false,
    ...partial,
  };
}

function testNormalizeAlphabeticalAndStable() {
  const forward = normalizeComparisonPair("outlier", "mercor");
  const reverse = normalizeComparisonPair("mercor", "outlier");
  assert.equal(forward?.slug, "mercor-vs-outlier");
  assert.deepEqual(forward, reverse);
  assert.equal(comparisonPath("outlier", "mercor"), "/compare/mercor-vs-outlier");
}

function testParseKnownSlugsHandlesEmbeddedVs() {
  const parsed = parseComparisonSlug("acme-vs-labs-vs-mercor", [
    "acme-vs-labs",
    "mercor",
  ]);
  assert.deepEqual(parsed, { a: "acme-vs-labs", b: "mercor" });
}

function testParseNaivePartition() {
  const parsed = parseComparisonSlug("outlier-vs-mercor");
  assert.deepEqual(parsed, { a: "outlier", b: "mercor" });
}

function testSameCompanyRejected() {
  assert.equal(normalizeComparisonPair("outlier", "Outlier"), null);
  const result = comparisonSEOEligibility(realA, { ...realA });
  assert.ok(result.reasons.includes("SAME_COMPANY"));
  assert.equal(result.indexable, false);
}

function testDemoNoindexAndSitemap() {
  const result = comparisonSEOEligibility(
    { ...realA, isDemo: true },
    { ...realB, isDemo: true },
  );
  assert.equal(result.indexable, false);
  assert.equal(result.includeInSitemap, false);
  assert.ok(result.reasons.includes("DEMO_ONLY"));
}

function testRealEligibleIndexAndSitemap() {
  const result = comparisonSEOEligibility(realA, realB);
  assert.equal(result.indexable, true);
  assert.equal(result.includeInSitemap, true);
}

function testTitleCanonicalOg() {
  const left = company({ name: "Mercor", slug: "mercor", isDemo: false });
  const right = company({ name: "Outlier", slug: "outlier", isDemo: true });
  assert.equal(
    comparisonPageTitle(left.name, right.name),
    "Mercor vs Outlier: Pay, Tasks, Reviews & Stability | Happy Tasking",
  );
  const meta = comparisonPageMetadata(left, right, "mercor-vs-outlier", false);
  assert.equal(
    meta.alternates?.canonical,
    "https://happytasking.com/compare/mercor-vs-outlier",
  );
  assert.equal(
    (meta.openGraph as { title?: string }).title,
    "Mercor vs Outlier: Pay, Tasks, Reviews & Stability | Happy Tasking",
  );
  assert.equal((meta.robots as { index?: boolean }).index, false);
}

function testCanonicalFlag() {
  assert.equal(
    isCanonicalComparisonSlug("mercor-vs-outlier", "outlier", "mercor"),
    true,
  );
  assert.equal(
    isCanonicalComparisonSlug("outlier-vs-mercor", "outlier", "mercor"),
    false,
  );
}

function testMissingMetricsNotZero() {
  assert.equal(comparisonMetricDisplay(null), "Not enough data");
  assert.equal(comparisonMetricDisplay(undefined), "Not enough data");
  assert.equal(comparisonMetricDisplay(78), 78);
  assert.notEqual(comparisonMetricDisplay(null), 0);
}

function testEmptySectionsOmitted() {
  const empty = company({ name: "Acme", slug: "acme", description: "Public listing." });
  const sections = comparisonSeoSections(empty, empty);
  assert.ok(!sections.includes("taskScore"));
  assert.ok(!sections.includes("pay"));
  assert.ok(!sections.includes("issues"));
  assert.ok(sections.includes("quick"));
  assert.ok(sections.includes("taskmatch"));
}

function listed(
  partial: Partial<Company> & Pick<Company, "name" | "slug">,
): Company {
  return company({
    description: `${partial.name} publishes public AI work programs for independent contributors.`,
    website: `https://${partial.slug.replace(/-/g, "")}.example`,
    ...partial,
  });
}

function testRelatedPairsLimitedAndCanonical() {
  const left = listed({
    name: "Mercor",
    slug: "mercor",
    similarCompanies: [
      { name: "Outlier", slug: "outlier", description: "Public listing for Outlier." },
      { name: "Turing", slug: "turing", description: "Public listing for Turing." },
    ],
  });
  const right = listed({
    name: "Outlier",
    slug: "outlier",
    similarCompanies: [
      { name: "Turing", slug: "turing", description: "Public listing for Turing." },
    ],
  });
  const related = relatedComparisonPairs(left, right, 4);
  assert.ok(related.every((pair) => pair.left.localeCompare(pair.right, "en") <= 0));
  assert.ok(!related.some((pair) => pair.slug === "mercor-vs-outlier"));
  assert.ok(related.length <= 4);
  assert.ok(related.some((pair) => pair.leftName === "Mercor" || pair.rightName === "Mercor"));
}

function testRelatedProductValidDemoStillShown() {
  const left = listed({ name: "Mercor", slug: "mercor", isDemo: true });
  const other = {
    name: "Turing",
    slug: "turing",
    isDemo: true,
    description: "Turing lists public remote software work.",
  };
  assert.equal(isValidRelatedComparison(left, other), true);
  assert.equal(comparisonSEOEligibility(
    { ...realA, isDemo: true },
    { ...realB, isDemo: true },
  ).indexable, false);
  const related = relatedComparisonPairs(
    listed({
      name: "Mercor",
      slug: "mercor",
      isDemo: true,
      similarCompanies: [other],
    }),
    listed({ name: "Outlier", slug: "outlier", isDemo: true }),
    4,
  );
  assert.ok(related.some((pair) => pair.slug === "mercor-vs-turing"));
}

function testRelatedRejectsInvalidPrivateDuplicateError() {
  const mercor = listed({ name: "Mercor", slug: "mercor" });
  assert.equal(isValidRelatedComparison(mercor, mercor), false);
  assert.ok(comparisonProductValidity(mercor, mercor).reasons.includes("SAME_COMPANY"));

  assert.equal(
    isValidRelatedComparison(mercor, { name: "", slug: "turing" }),
    false,
  );
  assert.equal(
    isValidRelatedComparison(mercor, {
      name: "Shell",
      slug: "not a slug",
    }),
    false,
  );
  assert.equal(
    isValidRelatedComparison(mercor, {
      name: "Hidden",
      slug: "hidden",
      companyStatus: "INACTIVE",
      description: "Hidden Co publishes public AI work programs for contributors.",
    }),
    false,
  );
  assert.equal(
    isValidRelatedComparison(mercor, {
      name: "Mercor Clone",
      slug: "mercor-clone",
      website: "https://www.mercor.example",
      description: "Clone listing that points at the same public website host.",
    }),
    false,
  );
  assert.equal(
    isValidRelatedComparison(
      { ...mercor, errorState: true },
      listed({ name: "Turing", slug: "turing" }),
    ),
    false,
  );
  assert.equal(
    isValidRelatedComparison(
      { name: "A", slug: "aaa" },
      { name: "B", slug: "bbb" },
    ),
    false,
  );
}

function testRelatedDoesNotRequireSeoIndexability() {
  const demoA = listed({ name: "Mercor", slug: "mercor", isDemo: true });
  const demoB = listed({ name: "Turing", slug: "turing", isDemo: true });
  assert.equal(isValidRelatedComparison(demoA, demoB), true);
  assert.equal(comparisonSEOEligibility(
    companySeoish(demoA),
    companySeoish(demoB),
  ).includeInSitemap, false);
}

function companySeoish(side: Company) {
  return {
    name: side.name,
    slug: side.slug,
    status: side.companyStatus || "ACTIVE",
    isDemo: side.isDemo,
    website: side.website,
    description: side.description,
    reviews: 1,
    payReports: 1,
    availabilityReports: 1,
    opportunities: 1,
    complaints: 0,
  };
}

function testRelatedDoesNotBulkGenerate() {
  const similar = Array.from({ length: 20 }, (_, i) => ({
    name: `Co ${i}`,
    slug: `co-${String(i).padStart(2, "0")}`,
    description: `Co ${i} publishes public AI work programs for independent contributors.`,
  }));
  const related = relatedComparisonPairs(
    listed({ name: "Mercor", slug: "mercor", similarCompanies: similar }),
    listed({ name: "Outlier", slug: "outlier" }),
    4,
  );
  assert.ok(related.length <= 4);
  assert.ok(related.length < (20 * 19) / 2);
}

function testHyphenatedSlugs() {
  assert.deepEqual(parseComparisonSlug("scale-ai-vs-surge-ai"), {
    a: "scale-ai",
    b: "surge-ai",
  });
  const longest = parseComparisonSlug("acme-vs-labs-vs-mercor");
  assert.deepEqual(longest, { a: "acme-vs-labs", b: "mercor" });
}

function testSameWebsiteNotDistinct() {
  const result = comparisonSEOEligibility(realA, {
    ...realB,
    website: "https://www.mercor.com",
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("INSUFFICIENT_DISTINCT_CONTENT"));
}

function testTwitterMetadata() {
  const left = company({ name: "Mercor", slug: "mercor" });
  const right = company({ name: "Outlier", slug: "outlier" });
  const meta = comparisonPageMetadata(left, right, "mercor-vs-outlier", true);
  assert.equal(
    (meta.twitter as { title?: string }).title,
    "Mercor vs Outlier: Pay, Tasks, Reviews & Stability | Happy Tasking",
  );
  assert.equal(
    (meta.openGraph as { url?: string }).url,
    "https://happytasking.com/compare/mercor-vs-outlier",
  );
}

function testQueryCompatibilityHelper() {
  const pair = normalizeComparisonPair("outlier", "mercor");
  assert.equal(`/compare?a=outlier&b=mercor` !== `/compare/${pair?.slug}`, true);
  assert.equal(pair?.slug, "mercor-vs-outlier");
}

testNormalizeAlphabeticalAndStable();
testParseKnownSlugsHandlesEmbeddedVs();
testParseNaivePartition();
testSameCompanyRejected();
testDemoNoindexAndSitemap();
testRealEligibleIndexAndSitemap();
testTitleCanonicalOg();
testCanonicalFlag();
testMissingMetricsNotZero();
testEmptySectionsOmitted();
testRelatedPairsLimitedAndCanonical();
testRelatedProductValidDemoStillShown();
testRelatedRejectsInvalidPrivateDuplicateError();
testRelatedDoesNotRequireSeoIndexability();
testRelatedDoesNotBulkGenerate();
testHyphenatedSlugs();
testSameWebsiteNotDistinct();
testTwitterMetadata();
testQueryCompatibilityHelper();
console.log("comparisonSeo.test.ts ok");
