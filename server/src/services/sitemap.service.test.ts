import assert from "node:assert/strict";
import { companyHasIndexableContent } from "./sitemap.eligibility.js";

function testEmptyShellIsNotIndexable() {
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
}

function testDescriptionQualifies() {
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

function testNonDemoEvidenceQualifies() {
  assert.equal(
    companyHasIndexableContent({
      description: "",
      reviews: 1,
      payReports: 0,
      availabilityReports: 0,
      opportunities: 0,
      complaints: 0,
    }),
    true,
  );
}

testEmptyShellIsNotIndexable();
testDescriptionQualifies();
testNonDemoEvidenceQualifies();
console.log("sitemap.service.test.ts ok");
