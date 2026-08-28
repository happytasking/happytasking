import assert from "node:assert/strict";
import {
  TASKMATCH_DESCRIPTION,
  TASKMATCH_EMPTY_DESCRIPTION,
  TASKMATCH_EMPTY_TITLE,
  TASKMATCH_ERROR_TITLE,
  TASKMATCH_H1,
  TASKMATCH_PATH,
  TASKMATCH_TITLE,
  TASKMATCH_TRUST_NOTE,
  isLiveCatalogOpportunity,
  jsonLdContainsForbiddenTaskMatchTypes,
  taskmatchCanonical,
  taskmatchPageMetadata,
} from "./taskmatchLanding";
import { siteGraphJsonLd } from "./seo";
import { STATIC_PUBLIC_ROUTES } from "./indexability";

function testQueryVariantsStayOnTaskMatchCanonical() {
  assert.equal(taskmatchCanonical(), "https://happytasking.com/taskmatch");
  assert.equal(TASKMATCH_PATH, "/taskmatch");
  assert.ok(!STATIC_PUBLIC_ROUTES.some((route) => route.path.includes("country=BR")));
  assert.ok(!STATIC_PUBLIC_ROUTES.some((route) => route.path === "/taskmatch/brazil"));
}

function testMetadata() {
  const meta = taskmatchPageMetadata();
  assert.equal(meta.title, TASKMATCH_TITLE);
  assert.equal(meta.description, TASKMATCH_DESCRIPTION);
  assert.deepEqual(meta.alternates, { canonical: "https://happytasking.com/taskmatch" });
  assert.equal(taskmatchCanonical(), "https://happytasking.com/taskmatch");
  const robots = meta.robots;
  assert.ok(robots && typeof robots === "object" && !Array.isArray(robots));
  assert.equal(robots.index, true);
  assert.equal(robots.follow, true);
  assert.equal(TASKMATCH_PATH, "/taskmatch");
}

function testCopyIsNotJobSpam() {
  assert.equal(TASKMATCH_H1, "Find AI training work that fits you.");
  assert.equal((TASKMATCH_H1.match(/ai training/gi) || []).length, 1);
  assert.ok(!/ai trainer jobs/i.test(TASKMATCH_H1));
  assert.ok(!/thousands/i.test(TASKMATCH_DESCRIPTION));
  assert.ok(!/live jobs/i.test(TASKMATCH_DESCRIPTION));
  assert.ok(!/success rate/i.test(TASKMATCH_DESCRIPTION));
  const len = TASKMATCH_DESCRIPTION.length;
  assert.ok(len >= 140 && len <= 170, `description length ${len}`);
  assert.ok(TASKMATCH_TRUST_NOTE.includes("does not hire"));
  assert.equal(TASKMATCH_EMPTY_TITLE, "We don't list verified live openings yet.");
  assert.ok(/independently sourced/i.test(TASKMATCH_EMPTY_DESCRIPTION));
}

function testCatalogTrustGate() {
  assert.equal(
    isLiveCatalogOpportunity({
      isDemo: true,
      status: "ACTIVE",
      company: { isDemo: false },
    }),
    false,
  );
  assert.equal(
    isLiveCatalogOpportunity({
      isDemo: false,
      status: "ACTIVE",
      company: { isDemo: true },
    }),
    false,
  );
  assert.equal(
    isLiveCatalogOpportunity({
      isDemo: false,
      status: "CLOSED",
      company: { isDemo: false },
    }),
    false,
  );
  assert.equal(
    isLiveCatalogOpportunity({
      isDemo: false,
      status: "ACTIVE",
      company: { isDemo: false },
    }),
    true,
  );
}

function testNoJobPostingOrRatings() {
  const graph = siteGraphJsonLd();
  assert.equal(jsonLdContainsForbiddenTaskMatchTypes(graph), false);
  assert.equal(
    jsonLdContainsForbiddenTaskMatchTypes({
      "@type": "JobPosting",
      title: "AI Coding Expert",
    }),
    true,
  );
  assert.equal(
    jsonLdContainsForbiddenTaskMatchTypes({ aggregateRating: { ratingValue: 4 } }),
    true,
  );
}

function testSitemapPolicy() {
  const paths = STATIC_PUBLIC_ROUTES.map((route) => route.path);
  assert.ok(paths.includes("/taskmatch"));
  assert.ok(!paths.includes("/jobs"));
  assert.ok(!paths.includes("/ai-training-jobs"));
  assert.ok(!paths.includes("/taskmatch/remote"));
  assert.ok(!paths.includes("/taskmatch/coding"));
  assert.ok(!paths.includes("/taskmatch/evaluator"));
  assert.ok(!paths.includes("/taskmatch/trainer"));
}

function testEmptyIsNotError() {
  assert.notEqual(TASKMATCH_EMPTY_TITLE, TASKMATCH_ERROR_TITLE);
  assert.ok(/unavailable/i.test(TASKMATCH_ERROR_TITLE));
  assert.ok(/verified live openings/i.test(TASKMATCH_EMPTY_TITLE));
}

function testAnonymousHasOneH1() {
  assert.equal(TASKMATCH_H1.split("\n").length, 1);
  assert.ok(!TASKMATCH_H1.includes("ai training jobs"));
}

testMetadata();
testCopyIsNotJobSpam();
testCatalogTrustGate();
testNoJobPostingOrRatings();
testSitemapPolicy();
testQueryVariantsStayOnTaskMatchCanonical();
testEmptyIsNotError();
testAnonymousHasOneH1();
console.log("taskmatchLanding.test.ts ok");
