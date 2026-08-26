import assert from "node:assert/strict";
import {
  EDITORIAL_AUTHOR,
  guideArticleJsonLd,
  guidePageMetadata,
  guidePageTitle,
  guideSEOEligibility,
  hasMeaningfulGuideBody,
  isPublicGuideStatus,
} from "./guideSeo";
import { parseGuideFile, relatedPublishedGuides } from "./guides";
import type { Guide } from "./guides";

const BODY = `## How this kind of work is structured

Task-based AI work is not the same as a conventional job. Contributors complete defined tasks under platform guidelines, and availability can change from week to week.

## What to compare before you apply

Look at public company information, community-reported pay and availability when sample sizes exist, and whether the platform's process is documented. Happy Tasking does not invent pay ranges or screening questions.
`;

const publishedFrontmatter = `---
title: "How to Compare AI Training Platforms"
slug: "how-to-compare-ai-training-platforms"
description: "A practical overview of how to compare AI training platforms using public information and community-reported intelligence."
author: "Happy Tasking Editorial"
datePublished: "2026-08-26"
dateModified: "2026-08-26"
category: "Platforms"
status: "published"
featured: true
indexable: true
relatedCompanies:
  - outlier
  - mercor
relatedGuides:
  - how-ai-work-screenings-usually-work
sources:
  - title: "Happy Tasking methodology"
    url: "https://happytasking.com/methodology"
    kind: methodology
---
${BODY}
`;

function testPublishedEligible() {
  const result = guideSEOEligibility({
    title: "How to Compare AI Training Platforms",
    slug: "how-to-compare-ai-training-platforms",
    filenameSlug: "how-to-compare-ai-training-platforms",
    description:
      "A practical overview of how to compare AI training platforms using public information and community-reported intelligence.",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "published",
    body: BODY,
  });
  assert.equal(result.indexable, true);
  assert.equal(result.includeInSitemap, true);
  assert.deepEqual(result.reasons, []);
}

function testDraftNotPublic() {
  const result = guideSEOEligibility({
    title: "Draft",
    slug: "draft-guide",
    filenameSlug: "draft-guide",
    description: "A practical overview of how to compare AI training platforms using public information.",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "draft",
    body: BODY,
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("DRAFT"));
  assert.equal(isPublicGuideStatus("draft"), false);
}

function testArchivedNoindex() {
  const result = guideSEOEligibility({
    title: "Archived",
    slug: "archived-guide",
    filenameSlug: "archived-guide",
    description: "A practical overview of how to compare AI training platforms using public information.",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "archived",
    body: BODY,
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("ARCHIVED"));
}

function testDemoNoindex() {
  const result = guideSEOEligibility({
    title: "Demo",
    slug: "demo-guide",
    filenameSlug: "demo-guide",
    description: "A practical overview of how to compare AI training platforms using public information.",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "published",
    demo: true,
    body: BODY,
  });
  assert.equal(result.indexable, false);
  assert.equal(result.includeInSitemap, false);
  assert.ok(result.reasons.includes("DEMO_ONLY"));
}

function testInsufficientAndMissing() {
  assert.equal(
    hasMeaningfulGuideBody("Title", "Description", "Coming soon"),
    false,
  );
  const thin = guideSEOEligibility({
    title: "Thin",
    slug: "thin-guide",
    filenameSlug: "thin-guide",
    description: "Short",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "published",
    body: "Coming soon",
  });
  assert.ok(thin.reasons.includes("INSUFFICIENT_CONTENT"));
  const missing = guideSEOEligibility({
    title: "",
    slug: "",
    status: "published",
    body: BODY,
  });
  assert.ok(missing.reasons.includes("MISSING_METADATA"));
}

function testInvalidSlug() {
  const result = guideSEOEligibility({
    title: "Bad slug",
    slug: "Not A Slug",
    filenameSlug: "not-a-slug",
    description: "A practical overview of how to compare AI training platforms using public information.",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "published",
    body: BODY,
  });
  assert.ok(result.reasons.includes("INVALID_SLUG"));
}

function testParseAndMetadata() {
  const guide = parseGuideFile(
    "how-to-compare-ai-training-platforms.mdx",
    publishedFrontmatter,
  );
  assert.equal(guide.slug, "how-to-compare-ai-training-platforms");
  assert.equal(guide.seo.indexable, true);
  assert.equal(guide.relatedCompanies.includes("outlier"), true);
  assert.equal(guide.dateModified, "2026-08-26");
  assert.equal(
    guidePageTitle(guide.title),
    "How to Compare AI Training Platforms | Happy Tasking",
  );
  const meta = guidePageMetadata(guide, true);
  assert.equal(
    meta.alternates?.canonical,
    "https://happytasking.com/guides/how-to-compare-ai-training-platforms",
  );
  assert.equal(
    (meta.openGraph as { title?: string }).title,
    "How to Compare AI Training Platforms | Happy Tasking",
  );
  assert.equal((meta.openGraph as { type?: string }).type, "article");
  assert.equal(
    (meta.twitter as { title?: string }).title,
    "How to Compare AI Training Platforms | Happy Tasking",
  );
  const jsonLd = guideArticleJsonLd(guide);
  assert.equal(jsonLd["@type"], "Article");
  assert.equal(jsonLd.headline, guide.title);
  assert.ok(!("aggregateRating" in jsonLd));
}

function testDateModifiedNotAutoNow() {
  const guide = parseGuideFile(
    "how-to-compare-ai-training-platforms.mdx",
    publishedFrontmatter,
  );
  const today = new Date().toISOString().slice(0, 10);
  if (today !== "2026-08-26") {
    assert.notEqual(guide.dateModified, today);
  }
  assert.equal(guide.dateModified, guide.datePublished);
}

function testRelatedGuidesNoSelfOrUnpublished() {
  const current = parseGuideFile(
    "how-to-compare-ai-training-platforms.mdx",
    publishedFrontmatter,
  );
  const draftRelated: Guide = {
    ...current,
    slug: "how-ai-work-screenings-usually-work",
    status: "draft",
    seo: { indexable: false, includeInSitemap: false, reasons: ["DRAFT"] },
  };
  const related = relatedPublishedGuides(current, [current, draftRelated], 4);
  assert.equal(related.length, 0);
}

function testPrivatePublishedNoindex() {
  const result = guideSEOEligibility({
    title: "Private published",
    slug: "private-published",
    filenameSlug: "private-published",
    description: "A practical overview of how to compare AI training platforms using public information.",
    author: EDITORIAL_AUTHOR,
    datePublished: "2026-08-26",
    status: "published",
    indexable: false,
    body: BODY,
  });
  assert.equal(result.indexable, false);
  assert.ok(result.reasons.includes("PRIVATE"));
}

testPublishedEligible();
testDraftNotPublic();
testArchivedNoindex();
testDemoNoindex();
testInsufficientAndMissing();
testInvalidSlug();
testParseAndMetadata();
testDateModifiedNotAutoNow();
testRelatedGuidesNoSelfOrUnpublished();
testPrivatePublishedNoindex();
console.log("guideSeo.test.ts ok");
