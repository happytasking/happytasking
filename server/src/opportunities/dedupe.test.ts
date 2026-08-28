import assert from "node:assert/strict";
import { opportunityFingerprint } from "./fingerprint.js";
import { uniqueOpportunitySlug } from "./slug.js";

function pickKey(input: {
  sourceKey: string;
  externalId: string;
  canonicalUrl?: string | null;
  fingerprint: string;
  existing: Array<{
    sourceKey: string | null;
    externalId: string | null;
    canonicalUrl?: string | null;
    fingerprint?: string | null;
  }>;
}) {
  const byExternal = input.existing.find(
    (row) => row.sourceKey === input.sourceKey && row.externalId === input.externalId,
  );
  if (byExternal) return "external-id";
  if (input.canonicalUrl) {
    const byUrl = input.existing.find((row) => row.canonicalUrl === input.canonicalUrl);
    if (byUrl) return "application-url";
  }
  const byFp = input.existing.find((row) => row.fingerprint === input.fingerprint);
  if (byFp) return "fingerprint";
  return "create";
}

function testPrefersExternalIdThenUrlThenFingerprint() {
  const fp = opportunityFingerprint({
    companySlug: "mercor",
    title: "Software Engineer — AI Training",
  });
  const existing = [
    {
      sourceKey: "aitraining-jobs",
      externalId: "abc",
      canonicalUrl: "https://work.mercor.com/jobs/1",
      fingerprint: fp,
    },
  ];
  assert.equal(
    pickKey({
      sourceKey: "aitraining-jobs",
      externalId: "abc",
      canonicalUrl: "https://work.mercor.com/jobs/1",
      fingerprint: fp,
      existing,
    }),
    "external-id",
  );
  assert.equal(
    pickKey({
      sourceKey: "mercor",
      externalId: "other",
      canonicalUrl: "https://work.mercor.com/jobs/1",
      fingerprint: fp,
      existing,
    }),
    "application-url",
  );
  assert.equal(
    pickKey({
      sourceKey: "mercor",
      externalId: "other",
      canonicalUrl: "https://work.mercor.com/jobs/2",
      fingerprint: fp,
      existing,
    }),
    "fingerprint",
  );
}

function testHourlyRerunIsIdempotent() {
  const fp = opportunityFingerprint({
    companySlug: "mercor",
    title: "Software Engineer — AI Training",
  });
  const existing = [
    {
      sourceKey: "aitraining-jobs",
      externalId: "abc",
      canonicalUrl: "https://work.mercor.com/jobs/1",
      fingerprint: fp,
    },
  ];
  assert.equal(
    pickKey({
      sourceKey: "aitraining-jobs",
      externalId: "abc",
      canonicalUrl: "https://work.mercor.com/jobs/1",
      fingerprint: fp,
      existing,
    }),
    "external-id",
  );
}

function testSlugDoesNotCollideOnTruncatedExternalId() {
  const title = "Software Engineer — AI Training";
  const a = uniqueOpportunitySlug("mercor", title, "0c3d8afd-9ee6-4008-aaaa-aaaaaaaaaaaa");
  const b = uniqueOpportunitySlug("mercor", title, "0c3d8afd-9ee7-4008-bbbb-bbbbbbbbbbbb");
  assert.notEqual(a, b);
  assert.ok(a.startsWith("mercor-software-engineer-ai-training-"));
  assert.equal(a === "mercor-software-engineer-ai-training-0c3d8afd9e", false);
}

testPrefersExternalIdThenUrlThenFingerprint();
testHourlyRerunIsIdempotent();
testSlugDoesNotCollideOnTruncatedExternalId();
console.log("dedupe.test.ts ok");
